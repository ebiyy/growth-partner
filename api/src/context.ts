import type { GoalRepository, UserRepository } from '@growth-partner/core';
import type { inferAsyncReturnType } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

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
