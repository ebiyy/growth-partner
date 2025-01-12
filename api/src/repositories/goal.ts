import * as S from '@effect/schema/Schema';
import {
  CreateGoal,
  Goal,
  GoalDescription,
  GoalId,
  GoalRepository,
  GoalStatus,
  GoalTitle,
  UpdateGoal,
  UserId,
} from '@growth-partner/core';
import type { D1Database } from '@cloudflare/workers-types';
import * as Effect from 'effect/Effect';

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
  constructor(private readonly db: D1Database) {}

  create: (data: CreateGoal) => Effect.Effect<never, Error, Goal> = (data) =>
    Effect.tryPromise({
      try: async () => {
        const now = new Date();
        const goalId = await Effect.runPromise(
          Effect.try(() => S.parseSync(GoalId)(crypto.randomUUID())),
        );

        const goal: Goal = {
          id: goalId,
          userId: data.userId,
          title: data.title,
          description: data.description,
          status: 'not_started',
          dueDate: data.dueDate,
          createdAt: now,
          updatedAt: now,
        };

        await this.db
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
          .run();

        return goal;
      },
      catch: (error) => new Error(`Failed to create goal: ${error}`),
    });

  findById: (id: string) => Effect.Effect<never, Error, Goal | null> = (id) =>
    Effect.tryPromise({
      try: async () => {
        const result = await this.db
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
          .first<GoalRow>();

        if (!result) return null;

        const [goalId, userId, title, description, status] = await Promise.all([
          Effect.runPromise(Effect.try(() => S.parseSync(GoalId)(result.id))),
          Effect.runPromise(Effect.try(() => S.parseSync(UserId)(result.user_id))),
          Effect.runPromise(Effect.try(() => S.parseSync(GoalTitle)(result.title))),
          Effect.runPromise(Effect.try(() => S.parseSync(GoalDescription)(result.description))),
          Effect.runPromise(Effect.try(() => S.parseSync(GoalStatus)(result.status))),
        ]);

        return {
          id: goalId,
          userId,
          title,
          description,
          status,
          dueDate: result.due_date ? new Date(result.due_date) : null,
          createdAt: new Date(result.created_at),
          updatedAt: new Date(result.updated_at),
        };
      },
      catch: (error) => new Error(`Failed to find goal: ${error}`),
    });

  findByUserId: (userId: string) => Effect.Effect<never, Error, Goal[]> = (userId) =>
    Effect.tryPromise({
      try: async () => {
        const { results } = await this.db
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
          .all<GoalRow>();

        if (!results) return [];

        const goals = await Promise.all(
          results.map(async (result) => {
            const [goalId, userId, title, description, status] = await Promise.all([
              Effect.runPromise(Effect.try(() => S.parseSync(GoalId)(result.id))),
              Effect.runPromise(Effect.try(() => S.parseSync(UserId)(result.user_id))),
              Effect.runPromise(Effect.try(() => S.parseSync(GoalTitle)(result.title))),
              Effect.runPromise(Effect.try(() => S.parseSync(GoalDescription)(result.description))),
              Effect.runPromise(Effect.try(() => S.parseSync(GoalStatus)(result.status))),
            ]);

            return {
              id: goalId,
              userId,
              title,
              description,
              status,
              dueDate: result.due_date ? new Date(result.due_date) : null,
              createdAt: new Date(result.created_at),
              updatedAt: new Date(result.updated_at),
            };
          }),
        );

        return goals;
      },
      catch: (error) => new Error(`Failed to find goals: ${error}`),
    });

  update: (id: string, data: UpdateGoal) => Effect.Effect<never, Error, Goal> = (id, data) =>
    Effect.tryPromise({
      try: async () => {
        const now = new Date();
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
        values.push(now.toISOString());
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

        const updated = await Effect.runPromise(this.findById(id));
        if (!updated) {
          throw new Error('Failed to update goal: Goal not found');
        }

        return updated;
      },
      catch: (error) => new Error(`Failed to update goal: ${error}`),
    });

  delete: (id: string) => Effect.Effect<never, Error, void> = (id) =>
    Effect.tryPromise({
      try: async () => {
        await this.db.prepare('DELETE FROM goals WHERE id = ?').bind(id).run();
      },
      catch: (error) => new Error(`Failed to delete goal: ${error}`),
    });
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
