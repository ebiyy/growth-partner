import type { D1Database } from '@cloudflare/workers-types';
import * as S from '@effect/schema/Schema';
import {
  type AllErrors,
  type CreateUser,
  type User,
  UserEmail,
  UserId,
  UserName,
  type UserRepository,
  repositoryError,
  validationError,
} from '@growth-partner/core';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Fn from 'effect/Function';
import type { Logger } from '../context';

interface UserRow {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export class D1UserRepository implements UserRepository {
  constructor(
    private readonly db: D1Database,
    private readonly logger: Logger = console,
  ) {}

  create(data: CreateUser): Effect.Effect<never, AllErrors, User> {
    this.logger.info('Creating user', { email: data.email });

    return Fn.pipe(
      Effect.succeed(new Date()),
      Effect.bind('userId', () =>
        Effect.try({
          try: () => S.parseSync(UserId)(crypto.randomUUID()),
          catch: (error) => {
            this.logger.error('Failed to generate user ID', { error });
            return validationError(`Invalid user ID: ${error}`);
          },
        }),
      ),
      Effect.map(({ userId }) => ({
        id: userId,
        name: data.name,
        email: data.email,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      Effect.tap((user) =>
        Effect.tryPromise({
          try: () =>
            this.db
              .prepare(
                `
                INSERT INTO users (id, name, email, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
              `,
              )
              .bind(
                user.id,
                user.name,
                user.email,
                user.createdAt.toISOString(),
                user.updatedAt.toISOString(),
              )
              .run(),
          catch: (error) => {
            this.logger.error('Failed to create user in database', { error });
            return repositoryError('create', `Failed to create user in database: ${error}`);
          },
        }),
      ),
      Effect.catchAll((error) => {
        this.logger.error('User creation failed', { error });
        return Effect.fail(error);
      }),
    );
  }

  findById(id: UserId): Effect.Effect<never, AllErrors, User | null> {
    this.logger.info('Finding user by ID', { id });

    return Fn.pipe(
      Effect.tryPromise({
        try: () =>
          this.db
            .prepare(
              `
              SELECT id, name, email, created_at, updated_at
              FROM users
              WHERE id = ?
            `,
            )
            .bind(id)
            .first<UserRow>(),
        catch: (error) => {
          this.logger.error('Failed to find user in database', { error, id });
          return repositoryError('findById', `Failed to find user in database: ${error}`);
        },
      }),
      Effect.flatMap((result) => {
        if (!result) {
          this.logger.info('User not found', { id });
          return Effect.succeed(null);
        }

        return Fn.pipe(
          Effect.all([
            Effect.try({
              try: () => S.parseSync(UserId)(result.id),
              catch: (error) => {
                this.logger.error('Invalid user ID in database', { error, id: result.id });
                return validationError(`Invalid user ID: ${error}`);
              },
            }),
            Effect.try({
              try: () => S.parseSync(UserName)(result.name),
              catch: (error) => {
                this.logger.error('Invalid user name in database', { error, name: result.name });
                return validationError(`Invalid user name: ${error}`);
              },
            }),
            Effect.try({
              try: () => S.parseSync(UserEmail)(result.email),
              catch: (error) => {
                this.logger.error('Invalid user email in database', { error, email: result.email });
                return validationError(`Invalid user email: ${error}`);
              },
            }),
          ]),
          Effect.map(([userId, userName, userEmail]) => ({
            id: userId,
            name: userName,
            email: userEmail,
            createdAt: new Date(result.created_at),
            updatedAt: new Date(result.updated_at),
          })),
        );
      }),
      Effect.catchAll((error) => {
        this.logger.error('User lookup failed', { error, id });
        return Effect.fail(error);
      }),
    );
  }

  findByEmail(email: string): Effect.Effect<never, AllErrors, User | null> {
    this.logger.info('Finding user by email', { email });

    return Fn.pipe(
      Effect.tryPromise({
        try: () =>
          this.db
            .prepare(
              `
              SELECT id, name, email, created_at, updated_at
              FROM users
              WHERE email = ?
            `,
            )
            .bind(email)
            .first<UserRow>(),
        catch: (error) => {
          this.logger.error('Failed to find user in database', { error, email });
          return repositoryError('findByEmail', `Failed to find user in database: ${error}`);
        },
      }),
      Effect.flatMap((result) => {
        if (!result) {
          this.logger.info('User not found', { email });
          return Effect.succeed(null);
        }

        return Fn.pipe(
          Effect.all([
            Effect.try({
              try: () => S.parseSync(UserId)(result.id),
              catch: (error) => {
                this.logger.error('Invalid user ID in database', { error, id: result.id });
                return validationError(`Invalid user ID: ${error}`);
              },
            }),
            Effect.try({
              try: () => S.parseSync(UserName)(result.name),
              catch: (error) => {
                this.logger.error('Invalid user name in database', { error, name: result.name });
                return validationError(`Invalid user name: ${error}`);
              },
            }),
            Effect.try({
              try: () => S.parseSync(UserEmail)(result.email),
              catch: (error) => {
                this.logger.error('Invalid user email in database', { error, email: result.email });
                return validationError(`Invalid user email: ${error}`);
              },
            }),
          ]),
          Effect.map(([userId, userName, userEmail]) => ({
            id: userId,
            name: userName,
            email: userEmail,
            createdAt: new Date(result.created_at),
            updatedAt: new Date(result.updated_at),
          })),
        );
      }),
      Effect.catchAll((error) => {
        this.logger.error('User lookup failed', { error, email });
        return Effect.fail(error);
      }),
    );
  }
}

// マイグレーションSQL
export const userMigrations = {
  up: `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
  `,
  down: `
    DROP TABLE IF EXISTS users;
  `,
};
