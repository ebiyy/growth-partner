import * as S from '@effect/schema/Schema';
import {
  CreateGoal,
  Goal,
  GoalDescription,
  GoalId,
  GoalNotFoundError,
  GoalRepositoryTag,
  GoalStatus,
  GoalTitle,
  UnauthorizedError,
  UserId,
  UserNotFoundError,
  UserRepositoryTag,
  createGoal,
  deleteGoal,
  getGoal,
  getUserGoals,
  updateGoal,
} from '@growth-partner/core';
import { initTRPC } from '@trpc/server';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import { z } from 'zod';
import type { Context } from '../context';

const t = initTRPC.context<Context>().create();

export const goalRouter = t.router({
  create: t.procedure
    .input(
      z.object({
        userId: z.string(),
        title: z.string().min(1).max(100),
        description: z.string().max(1000),
        dueDate: z.date().nullable(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const program = Effect.gen(function* (_) {
        const userId = yield* _(Effect.try(() => S.parseSync(UserId)(input.userId)));
        const title = yield* _(Effect.try(() => S.parseSync(GoalTitle)(input.title)));
        const description = yield* _(
          Effect.try(() => S.parseSync(GoalDescription)(input.description)),
        );

        const data: CreateGoal = {
          userId,
          title,
          description,
          dueDate: input.dueDate,
        };

        const result = yield* _(
          pipe(
            createGoal(data),
            Effect.provideService(UserRepositoryTag, ctx.userRepository),
            Effect.provideService(GoalRepositoryTag, ctx.goalRepository),
          ),
        );

        return result;
      });

      try {
        return await Effect.runPromise(program);
      } catch (error) {
        if (error instanceof UserNotFoundError) {
          throw new Error('User not found');
        }
        throw error;
      }
    }),

  getById: t.procedure
    .input(
      z.object({
        goalId: z.string(),
        userId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const program = Effect.gen(function* (_) {
        const goalId = yield* _(Effect.try(() => S.parseSync(GoalId)(input.goalId)));
        const userId = yield* _(Effect.try(() => S.parseSync(UserId)(input.userId)));

        const result = yield* _(
          Effect.provideService(getGoal(goalId, userId), GoalRepositoryTag, ctx.goalRepository),
        );

        return result;
      });

      try {
        return await Effect.runPromise(program);
      } catch (error) {
        if (error instanceof GoalNotFoundError) {
          throw new Error('Goal not found');
        }
        if (error instanceof UnauthorizedError) {
          throw new Error('Not authorized to access this goal');
        }
        throw error;
      }
    }),

  update: t.procedure
    .input(
      z.object({
        goalId: z.string(),
        userId: z.string(),
        title: z.string().min(1).max(100).optional(),
        description: z.string().max(1000).optional(),
        status: z.enum(['not_started', 'in_progress', 'completed', 'cancelled']).optional(),
        dueDate: z.date().nullable().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const program = Effect.gen(function* (_) {
        const goalId = yield* _(Effect.try(() => S.parseSync(GoalId)(input.goalId)));
        const userId = yield* _(Effect.try(() => S.parseSync(UserId)(input.userId)));

        const data = {
          ...(input.title && {
            title: yield* _(Effect.try(() => S.parseSync(GoalTitle)(input.title))),
          }),
          ...(input.description && {
            description: yield* _(
              Effect.try(() => S.parseSync(GoalDescription)(input.description)),
            ),
          }),
          ...(input.status && {
            status: yield* _(Effect.try(() => S.parseSync(GoalStatus)(input.status))),
          }),
          ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
        };

        const result = yield* _(
          Effect.provideService(
            updateGoal(goalId, userId, data),
            GoalRepositoryTag,
            ctx.goalRepository,
          ),
        );

        return result;
      });

      try {
        return await Effect.runPromise(program);
      } catch (error) {
        if (error instanceof GoalNotFoundError) {
          throw new Error('Goal not found');
        }
        if (error instanceof UnauthorizedError) {
          throw new Error('Not authorized to update this goal');
        }
        throw error;
      }
    }),

  delete: t.procedure
    .input(
      z.object({
        goalId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const program = Effect.gen(function* (_) {
        const goalId = yield* _(Effect.try(() => S.parseSync(GoalId)(input.goalId)));
        const userId = yield* _(Effect.try(() => S.parseSync(UserId)(input.userId)));

        yield* _(
          Effect.provideService(deleteGoal(goalId, userId), GoalRepositoryTag, ctx.goalRepository),
        );
      });

      try {
        await Effect.runPromise(program);
      } catch (error) {
        if (error instanceof GoalNotFoundError) {
          throw new Error('Goal not found');
        }
        if (error instanceof UnauthorizedError) {
          throw new Error('Not authorized to delete this goal');
        }
        throw error;
      }
    }),

  getByUserId: t.procedure.input(z.string()).query(async ({ input, ctx }) => {
    const program = Effect.gen(function* (_) {
      const userId = yield* _(Effect.try(() => S.parseSync(UserId)(input)));

      const result = yield* _(
        pipe(
          getUserGoals(userId),
          Effect.provideService(UserRepositoryTag, ctx.userRepository),
          Effect.provideService(GoalRepositoryTag, ctx.goalRepository),
        ),
      );

      return result;
    });

    try {
      return await Effect.runPromise(program);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new Error('User not found');
      }
      throw error;
    }
  }),
});
