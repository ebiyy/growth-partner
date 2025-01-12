import * as Effect from "effect/Effect";
import type { CreateGoal, Goal, GoalId, UpdateGoal } from "../domain/goal";
import {
	type GoalRepository,
	GoalRepositoryTag,
	type UserRepository,
	UserRepositoryTag,
} from "../domain/repositories";
import type { UserId } from "../domain/user";
import { UserNotFoundError } from "./user";

export class GoalNotFoundError extends Error {
	readonly _tag = "GoalNotFoundError";
	constructor(goalId: string) {
		super(`Goal not found: ${goalId}`);
	}
}

export class UnauthorizedError extends Error {
	readonly _tag = "UnauthorizedError";
	constructor(message: string) {
		super(message);
	}
}

export const createGoal = (
	data: CreateGoal,
): Effect.Effect<UserRepository | GoalRepository, Error, Goal> =>
	Effect.gen(function* (_) {
		const userRepo = yield* _(UserRepositoryTag);
		const goalRepo = yield* _(GoalRepositoryTag);

		const user = yield* _(userRepo.findById(data.userId));
		if (!user) {
			return yield* _(Effect.fail(new UserNotFoundError(data.userId)));
		}

		return yield* _(goalRepo.create(data));
	});

export const getGoal = (
	goalId: GoalId,
	userId: UserId,
): Effect.Effect<GoalRepository, Error, Goal> =>
	Effect.gen(function* (_) {
		const goalRepo = yield* _(GoalRepositoryTag);
		const goal = yield* _(goalRepo.findById(goalId));

		if (!goal) {
			return yield* _(Effect.fail(new GoalNotFoundError(goalId)));
		}

		if (goal.userId !== userId) {
			return yield* _(
				Effect.fail(
					new UnauthorizedError("Not authorized to access this goal"),
				),
			);
		}

		return goal;
	});

export const updateGoal = (
	goalId: GoalId,
	userId: UserId,
	data: UpdateGoal,
): Effect.Effect<GoalRepository, Error, Goal> =>
	Effect.gen(function* (_) {
		const goalRepo = yield* _(GoalRepositoryTag);
		const goal = yield* _(goalRepo.findById(goalId));

		if (!goal) {
			return yield* _(Effect.fail(new GoalNotFoundError(goalId)));
		}

		if (goal.userId !== userId) {
			return yield* _(
				Effect.fail(
					new UnauthorizedError("Not authorized to update this goal"),
				),
			);
		}

		return yield* _(goalRepo.update(goalId, data));
	});

export const deleteGoal = (
	goalId: GoalId,
	userId: UserId,
): Effect.Effect<GoalRepository, Error, void> =>
	Effect.gen(function* (_) {
		const goalRepo = yield* _(GoalRepositoryTag);
		const goal = yield* _(goalRepo.findById(goalId));

		if (!goal) {
			return yield* _(Effect.fail(new GoalNotFoundError(goalId)));
		}

		if (goal.userId !== userId) {
			return yield* _(
				Effect.fail(
					new UnauthorizedError("Not authorized to delete this goal"),
				),
			);
		}

		return yield* _(goalRepo.delete(goalId));
	});

export const getUserGoals = (
	userId: UserId,
): Effect.Effect<UserRepository | GoalRepository, Error, Goal[]> =>
	Effect.gen(function* (_) {
		const userRepo = yield* _(UserRepositoryTag);
		const goalRepo = yield* _(GoalRepositoryTag);

		const user = yield* _(userRepo.findById(userId));
		if (!user) {
			return yield* _(Effect.fail(new UserNotFoundError(userId)));
		}

		return yield* _(goalRepo.findByUserId(userId));
	});
