import * as S from "@effect/schema/Schema";
import { UserId } from "./user";

export const GoalId = S.string.pipe(S.brand("GoalId"));
export type GoalId = S.Schema.To<typeof GoalId>;

export const GoalTitle = S.string.pipe(
	S.minLength(1),
	S.maxLength(100),
	S.brand("GoalTitle"),
);
export type GoalTitle = S.Schema.To<typeof GoalTitle>;

export const GoalDescription = S.string.pipe(
	S.maxLength(1000),
	S.brand("GoalDescription"),
);
export type GoalDescription = S.Schema.To<typeof GoalDescription>;

export const GoalStatus = S.union(
	S.literal("not_started"),
	S.literal("in_progress"),
	S.literal("completed"),
	S.literal("cancelled"),
);
export type GoalStatus = S.Schema.To<typeof GoalStatus>;

export const Goal = S.struct({
	id: GoalId,
	userId: UserId,
	title: GoalTitle,
	description: GoalDescription,
	status: GoalStatus,
	dueDate: S.nullable(S.Date),
	createdAt: S.Date,
	updatedAt: S.Date,
});
export type Goal = S.Schema.To<typeof Goal>;

export const CreateGoal = S.struct({
	userId: UserId,
	title: GoalTitle,
	description: GoalDescription,
	dueDate: S.nullable(S.Date),
});
export type CreateGoal = S.Schema.To<typeof CreateGoal>;

export const UpdateGoal = S.struct({
	title: S.optional(GoalTitle),
	description: S.optional(GoalDescription),
	status: S.optional(GoalStatus),
	dueDate: S.optional(S.nullable(S.Date)),
});
export type UpdateGoal = S.Schema.To<typeof UpdateGoal>;
