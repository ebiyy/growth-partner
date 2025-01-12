import * as S from '@effect/schema/Schema';
import {
  CreateUser,
  User,
  UserEmail,
  UserId,
  UserName,
  UserRepository,
} from '@growth-partner/core';
import type { D1Database } from '@cloudflare/workers-types';
import * as Effect from 'effect/Effect';

export class D1UserRepository implements UserRepository {
  constructor(private readonly db: D1Database) {}

  create: (data: CreateUser) => Effect.Effect<never, Error, User> = (data) =>
    Effect.tryPromise({
      try: async () => {
        const now = new Date();
        const userId = await Effect.runPromise(
          Effect.try(() => S.parseSync(UserId)(crypto.randomUUID())),
        );

        const user: User = {
          id: userId,
          name: data.name,
          email: data.email,
          createdAt: now,
          updatedAt: now,
        };

        await this.db
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
          .run();

        return user;
      },
      catch: (error) => new Error(`Failed to create user: ${error}`),
    });

  findById: (id: string) => Effect.Effect<never, Error, User | null> = (id) =>
    Effect.tryPromise({
      try: async () => {
        const result = await this.db
          .prepare(
            `
            SELECT id, name, email, created_at, updated_at
            FROM users
            WHERE id = ?
          `,
          )
          .bind(id)
          .first<{
            id: string;
            name: string;
            email: string;
            created_at: string;
            updated_at: string;
          }>();

        if (!result) return null;

        const [userId, userName, userEmail] = await Promise.all([
          Effect.runPromise(Effect.try(() => S.parseSync(UserId)(result.id))),
          Effect.runPromise(Effect.try(() => S.parseSync(UserName)(result.name))),
          Effect.runPromise(Effect.try(() => S.parseSync(UserEmail)(result.email))),
        ]);

        return {
          id: userId,
          name: userName,
          email: userEmail,
          createdAt: new Date(result.created_at),
          updatedAt: new Date(result.updated_at),
        };
      },
      catch: (error) => new Error(`Failed to find user: ${error}`),
    });

  findByEmail: (email: string) => Effect.Effect<never, Error, User | null> = (email) =>
    Effect.tryPromise({
      try: async () => {
        const result = await this.db
          .prepare(
            `
            SELECT id, name, email, created_at, updated_at
            FROM users
            WHERE email = ?
          `,
          )
          .bind(email)
          .first<{
            id: string;
            name: string;
            email: string;
            created_at: string;
            updated_at: string;
          }>();

        if (!result) return null;

        const [userId, userName, userEmail] = await Promise.all([
          Effect.runPromise(Effect.try(() => S.parseSync(UserId)(result.id))),
          Effect.runPromise(Effect.try(() => S.parseSync(UserName)(result.name))),
          Effect.runPromise(Effect.try(() => S.parseSync(UserEmail)(result.email))),
        ]);

        return {
          id: userId,
          name: userName,
          email: userEmail,
          createdAt: new Date(result.created_at),
          updatedAt: new Date(result.updated_at),
        };
      },
      catch: (error) => new Error(`Failed to find user: ${error}`),
    });
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
