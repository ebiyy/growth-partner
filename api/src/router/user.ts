import { initTRPC } from '@trpc/server';
import * as Effect from 'effect/Effect';
import * as S from '@effect/schema/Schema';
import { z } from 'zod';
import { Context } from '../context';
import {
  CreateUser,
  UserNotFoundError,
  EmailAlreadyExistsError,
  UserRepositoryTag,
  createUser,
  getUser,
  UserName,
  UserEmail,
  UserId,
} from '@growth-partner/core';

const t = initTRPC.context<Context>().create();

export const userRouter = t.router({
  create: t.procedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        email: z.string().email(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const program = Effect.gen(function* (_) {
        const name = yield* _(Effect.try(() => UserName.parse(input.name)));
        const email = yield* _(Effect.try(() => UserEmail.parse(input.email)));
        
        const result = yield* _(
          Effect.provideService(
            createUser({ name, email }),
            UserRepositoryTag,
            ctx.userRepository
          )
        );
        
        return result;
      });

      try {
        return await Effect.runPromise(program);
      } catch (error) {
        if (error instanceof EmailAlreadyExistsError) {
          throw new Error('Email already exists');
        }
        throw error;
      }
    }),

  getById: t.procedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const program = Effect.gen(function* (_) {
        const userId = yield* _(Effect.try(() => UserId.parse(input)));
        
        const result = yield* _(
          Effect.provideService(
            getUser(userId),
            UserRepositoryTag,
            ctx.userRepository
          )
        );
        
        return result;
      });
        UserRepositoryTag,
        ctx.userRepository
      );

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