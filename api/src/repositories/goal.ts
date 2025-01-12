import type { D1Database } from '@cloudflare/workers-types';
import * as S from '@effect/schema/Schema';
import {
  type AllErrors,
  type CreateGoal,
  type Goal,
  GoalDescription,
  GoalId,
  type GoalRepository,
  GoalStatus,
  GoalTitle,
  type UpdateGoal,
  UserId,
  repositoryError,
  validationError,
} from '@growth-partner/core';
import * as Effect from 'effect/Effect';
import * as Fn from 'effect/Function';
import type { Logger } from '../context';

interface GoalRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export class D1GoalRepository implements GoalRepository {
  constructor(
    private readonly db: D1Database,
    private readonly logger: Logger = console,
  ) {}

  create(data: CreateGoal): Effect.Effect<never, AllErrors, Goal> {
    this.logger.info('Creating goal', { userId: data.userId, title: data.title });

    return Fn.pipe(
      Effect.succeed(new Date()),
      Effect.bind('goalId', () =>
        Effect.try({
          try: () => S.parseSync(GoalId)(crypto.randomUUID()),
          catch: (error) => {
            this.logger.error('Failed to generate goal ID', { error });
            return validationError(`Invalid goal ID: ${error}`);
          },
        }),
      ),
      Effect.map(({ goalId }) => ({
        id: goalId,
        userId: data.userId,
        title: data.title,
        description: data.description,
        status: 'not_started' as const,
        dueDate: data.dueDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      Effect.tap((goal) =>
        Effect.tryPromise({
          try: () =>
            this.db
              .prepare(
                `
                INSERT INTO goals (
                  id,
                  user_id,
                  title,
                  description,
                  status,
                  due_date,
                  created_at,
                  updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              `,
              )
              .bind(
                goal.id,
                goal.userId,
                goal.title,
                goal.description,
                goal.status,
                goal.dueDate?.toISOString() ?? null,
                goal.createdAt.toISOString(),
                goal.updatedAt.toISOString(),
              )
              .run(),
          catch: (error) => {
            this.logger.error('Failed to create goal in database', { error });
            return repositoryError('create', `Failed to create goal in database: ${error}`);
          },
        }),
      ),
      Effect.catchAll((error) => {
        this.logger.error('Goal creation failed', { error });
        return Effect.fail(error);
      }),
    );
  }

  findById(id: GoalId): Effect.Effect<never, AllErrors, Goal | null> {
    this.logger.info('Finding goal by ID', { id });

    return Fn.pipe(
      Effect.tryPromise({
        try: () =>
          this.db
            .prepare(
              `
              SELECT
                id,
                user_id,
                title,
                description,
                status,
                due_date,
                created_at,
                updated_at
              FROM goals
              WHERE id = ?
            `,
            )
            .bind(id)
            .first<GoalRow>(),
        catch: (error) => {
          this.logger.error('Failed to find goal in database', { error, id });
          return repositoryError('findById', `Failed to find goal in database: ${error}`);
        },
      }),
      Effect.flatMap((result) => {
        if (!result) {
          this.logger.info('Goal not found', { id });
          return Effect.succeed(null);
        }

        return Fn.pipe(
          Effect.all([
            Effect.try({
              try: () => S.parseSync(GoalId)(result.id),
              catch: (error) => {
                this.logger.error('Invalid goal ID in database', { error, id: result.id });
                return validationError(`Invalid goal ID: ${error}`);
              },
            }),
            Effect.try({
              try: () => S.parseSync(UserId)(result.user_id),
              catch: (error) => {
                this.logger.error('Invalid user ID in database', { error, userId: result.user_id });
                return validationError(`Invalid user ID: ${error}`);
              },
            }),
            Effect.try({
              try: () => S.parseSync(GoalTitle)(result.title),
              catch: (error) => {
                this.logger.error('Invalid goal title in database', { error, title: result.title });
                return validationError(`Invalid goal title: ${error}`);
              },
            }),
            Effect.try({
              try: () => S.parseSync(GoalDescription)(result.description),
              catch: (error) => {
                this.logger.error('Invalid goal description in database', {
                  error,
                  description: result.description,
                });
                return validationError(`Invalid goal description: ${error}`);
              },
            }),
            Effect.try({
              try: () => S.parseSync(GoalStatus)(result.status),
              catch: (error) => {
                this.logger.error('Invalid goal status in database', {
                  error,
                  status: result.status,
                });
                return validationError(`Invalid goal status: ${error}`);
              },
            }),
          ]),
          Effect.map(([goalId, userId, title, description, status]) => ({
            id: goalId,
            userId,
            title,
            description,
            status,
            dueDate: result.due_date ? new Date(result.due_date) : null,
            createdAt: new Date(result.created_at),
            updatedAt: new Date(result.updated_at),
          })),
        );
      }),
      Effect.catchAll((error) => {
        this.logger.error('Goal lookup failed', { error, id });
        return Effect.fail(error);
      }),
    );
  }

  findByUserId(userId: UserId): Effect.Effect<never, AllErrors, Goal[]> {
    this.logger.info('Finding goals by user ID', { userId });

    return Fn.pipe(
      Effect.tryPromise({
        try: () =>
          this.db
            .prepare(
              `
              SELECT
                id,
                user_id,
                title,
                description,
                status,
                due_date,
                created_at,
                updated_at
              FROM goals
              WHERE user_id = ?
              ORDER BY created_at DESC
            `,
            )
            .bind(userId)
            .all<GoalRow>(),
        catch: (error) => {
          this.logger.error('Failed to find goals in database', { error, userId });
          return repositoryError('findByUserId', `Failed to find goals in database: ${error}`);
        },
      }),
      Effect.flatMap((result) => {
        if (!result.results) {
          this.logger.info('No goals found', { userId });
          return Effect.succeed([]);
        }

        return Fn.pipe(
          Effect.all(
            result.results.map((row) =>
              Fn.pipe(
                Effect.all([
                  Effect.try({
                    try: () => S.parseSync(GoalId)(row.id),
                    catch: (error) => {
                      this.logger.error('Invalid goal ID in database', { error, id: row.id });
                      return validationError(`Invalid goal ID: ${error}`);
                    },
                  }),
                  Effect.try({
                    try: () => S.parseSync(UserId)(row.user_id),
                    catch: (error) => {
                      this.logger.error('Invalid user ID in database', {
                        error,
                        userId: row.user_id,
                      });
                      return validationError(`Invalid user ID: ${error}`);
                    },
                  }),
                  Effect.try({
                    try: () => S.parseSync(GoalTitle)(row.title),
                    catch: (error) => {
                      this.logger.error('Invalid goal title in database', {
                        error,
                        title: row.title,
                      });
                      return validationError(`Invalid goal title: ${error}`);
                    },
                  }),
                  Effect.try({
                    try: () => S.parseSync(GoalDescription)(row.description),
                    catch: (error) => {
                      this.logger.error('Invalid goal description in database', {
                        error,
                        description: row.description,
                      });
                      return validationError(`Invalid goal description: ${error}`);
                    },
                  }),
                  Effect.try({
                    try: () => S.parseSync(GoalStatus)(row.status),
                    catch: (error) => {
                      this.logger.error('Invalid goal status in database', {
                        error,
                        status: row.status,
                      });
                      return validationError(`Invalid goal status: ${error}`);
                    },
                  }),
                ]),
                Effect.map(([goalId, userId, title, description, status]) => ({
                  id: goalId,
                  userId,
                  title,
                  description,
                  status,
                  dueDate: row.due_date ? new Date(row.due_date) : null,
                  createdAt: new Date(row.created_at),
                  updatedAt: new Date(row.updated_at),
                })),
              ),
            ),
          ),
        );
      }),
      Effect.catchAll((error) => {
        this.logger.error('Goals lookup failed', { error, userId });
        return Effect.fail(error);
      }),
    );
  }

  update(id: GoalId, data: UpdateGoal): Effect.Effect<never, AllErrors, Goal> {
    this.logger.info('Updating goal', { id, data });

    return Fn.pipe(
      Effect.succeed(new Date()),
      Effect.tap(() =>
        Effect.tryPromise({
          try: async () => {
            const updates: string[] = [];
            const values: Array<string | null | undefined> = [];

            if (data.title) {
              updates.push('title = ?');
              values.push(data.title);
            }
            if (data.description) {
              updates.push('description = ?');
              values.push(data.description);
            }
            if (data.status) {
              updates.push('status = ?');
              values.push(data.status);
            }
            if (data.dueDate !== undefined) {
              updates.push('due_date = ?');
              values.push(data.dueDate?.toISOString() ?? null);
            }

            updates.push('updated_at = ?');
            values.push(new Date().toISOString());
            values.push(id);

            await this.db
              .prepare(
                `
                UPDATE goals
                SET ${updates.join(', ')}
                WHERE id = ?
              `,
              )
              .bind(...values)
              .run();
          },
          catch: (error) => {
            this.logger.error('Failed to update goal in database', { error, id });
            return repositoryError('update', `Failed to update goal in database: ${error}`);
          },
        }),
      ),
      Effect.flatMap(() => this.findById(id)),
      Effect.flatMap((goal) => {
        if (!goal) {
          this.logger.error('Goal not found after update', { id });
          return Effect.fail(repositoryError('update', 'Goal not found after update'));
        }
        return Effect.succeed(goal);
      }),
      Effect.catchAll((error) => {
        this.logger.error('Goal update failed', { error, id });
        return Effect.fail(error);
      }),
    );
  }

  delete(id: GoalId): Effect.Effect<never, AllErrors, void> {
    this.logger.info('Deleting goal', { id });

    return Fn.pipe(
      Effect.tryPromise({
        try: () => this.db.prepare('DELETE FROM goals WHERE id = ?').bind(id).run(),
        catch: (error) => {
          this.logger.error('Failed to delete goal from database', { error, id });
          return repositoryError('delete', `Failed to delete goal from database: ${error}`);
        },
      }),
      Effect.map(() => undefined),
      Effect.catchAll((error) => {
        this.logger.error('Goal deletion failed', { error, id });
        return Effect.fail(error);
      }),
    );
  }
}

// マイグレーションSQL
export const goalMigrations = {
  up: `
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      due_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS goals_user_id_idx ON goals(user_id);
    CREATE INDEX IF NOT EXISTS goals_status_idx ON goals(status);
    CREATE INDEX IF NOT EXISTS goals_due_date_idx ON goals(due_date);
  `,
  down: `
    DROP TABLE IF EXISTS goals;
  `,
};
