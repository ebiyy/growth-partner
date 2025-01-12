import { initTRPC } from '@trpc/server';
import type { Context } from '../context';
import { goalRouter } from './goal';
import { userRouter } from './user';

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  user: userRouter,
  goal: goalRouter,
});

export type AppRouter = typeof appRouter;
