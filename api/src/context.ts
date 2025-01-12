import { inferAsyncReturnType } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { UserRepository, GoalRepository } from '@growth-partner/core';

interface CreateContextOptions {
  userRepository: UserRepository;
  goalRepository: GoalRepository;
}

export function createContext(
  opts: FetchCreateContextFnOptions,
  repositories: CreateContextOptions,
) {
  return {
    ...repositories,
    headers: opts.req.headers,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;