import * as Context from 'effect/Context';
import * as Data from 'effect/Data';
import type * as Effect from 'effect/Effect';
import type { CreateGoal, Goal, GoalId, UpdateGoal } from './goal';
import type { CreateUser, User, UserId } from './user';

// ドメインエラー
export class NotFoundError extends Data.TaggedError('NotFoundError')<{
  readonly entity: string;
  readonly id: string;
}> {}

export class ValidationError extends Data.TaggedError('ValidationError')<{
  readonly message: string;
  readonly field?: string;
}> {}

// リポジトリエラー
export class RepositoryError extends Data.TaggedError('RepositoryError')<{
  readonly cause: unknown;
  readonly operation: string;
}> {}

export class UnexpectedError extends Data.TaggedError('UnexpectedError')<{
  readonly cause: unknown;
}> {}

export type DomainError = NotFoundError | ValidationError;
export type RepositoryErrors = RepositoryError | UnexpectedError;
export type AllErrors = DomainError | RepositoryErrors;

export interface UserRepository {
  readonly create: (data: CreateUser) => Effect.Effect<never, AllErrors, User>;
  readonly findById: (id: UserId) => Effect.Effect<never, AllErrors, User | null>;
  readonly findByEmail: (email: string) => Effect.Effect<never, AllErrors, User | null>;
}

export interface GoalRepository {
  readonly create: (data: CreateGoal) => Effect.Effect<never, AllErrors, Goal>;
  readonly findById: (id: GoalId) => Effect.Effect<never, AllErrors, Goal | null>;
  readonly findByUserId: (userId: UserId) => Effect.Effect<never, AllErrors, Goal[]>;
  readonly update: (id: GoalId, data: UpdateGoal) => Effect.Effect<never, AllErrors, Goal>;
  readonly delete: (id: GoalId) => Effect.Effect<never, AllErrors, void>;
}

// エラー作成ヘルパー関数
export const notFound = (entity: string, id: string): NotFoundError =>
  new NotFoundError({ entity, id });

export const validationError = (message: string, field?: string): ValidationError =>
  new ValidationError({ message, field });

export const repositoryError = (operation: string, cause: unknown): RepositoryError =>
  new RepositoryError({ operation, cause });

export const unexpectedError = (cause: unknown): UnexpectedError => new UnexpectedError({ cause });

export const UserRepositoryTag = Context.GenericTag<UserRepository>('UserRepository');
export const GoalRepositoryTag = Context.GenericTag<GoalRepository>('GoalRepository');
