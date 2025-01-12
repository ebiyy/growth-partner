import * as Effect from 'effect/Effect';
import * as Context from 'effect/Context';
import { User, UserId, CreateUser } from './user';
import { Goal, GoalId, CreateGoal, UpdateGoal } from './goal';

export interface UserRepository {
  readonly create: (data: CreateUser) => Effect.Effect<never, Error, User>;
  readonly findById: (id: UserId) => Effect.Effect<never, Error, User | null>;
  readonly findByEmail: (email: string) => Effect.Effect<never, Error, User | null>;
}

export interface GoalRepository {
  readonly create: (data: CreateGoal) => Effect.Effect<never, Error, Goal>;
  readonly findById: (id: GoalId) => Effect.Effect<never, Error, Goal | null>;
  readonly findByUserId: (userId: UserId) => Effect.Effect<never, Error, Goal[]>;
  readonly update: (id: GoalId, data: UpdateGoal) => Effect.Effect<never, Error, Goal>;
  readonly delete: (id: GoalId) => Effect.Effect<never, Error, void>;
}

export const UserRepositoryTag = Context.Tag<UserRepository>();
export const GoalRepositoryTag = Context.Tag<GoalRepository>();