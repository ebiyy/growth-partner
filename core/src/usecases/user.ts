import * as S from '@effect/schema/Schema';
import * as Effect from 'effect/Effect';
import { type UserRepository, UserRepositoryTag } from '../domain/repositories';
import type { CreateUser, User, UserId } from '../domain/user';

export class UserNotFoundError extends Error {
  readonly _tag = 'UserNotFoundError';
  constructor(userId: string) {
    super(`User not found: ${userId}`);
  }
}

export class EmailAlreadyExistsError extends Error {
  readonly _tag = 'EmailAlreadyExistsError';
  constructor(email: string) {
    super(`Email already exists: ${email}`);
  }
}

export const createUser = (data: CreateUser): Effect.Effect<UserRepository, Error, User> =>
  Effect.gen(function* (_) {
    const userRepo = yield* _(UserRepositoryTag);
    const existingUser = yield* _(userRepo.findByEmail(data.email));

    if (existingUser) {
      return yield* _(Effect.fail(new EmailAlreadyExistsError(data.email)));
    }

    return yield* _(userRepo.create(data));
  });

export const getUser = (userId: UserId): Effect.Effect<UserRepository, Error, User> =>
  Effect.gen(function* (_) {
    const userRepo = yield* _(UserRepositoryTag);
    const user = yield* _(userRepo.findById(userId));

    if (!user) {
      return yield* _(Effect.fail(new UserNotFoundError(userId)));
    }

    return user;
  });
