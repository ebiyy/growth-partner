import * as S from "@effect/schema/Schema";

export const UserId = S.string.pipe(S.brand("UserId"));
export type UserId = S.Schema.To<typeof UserId>;

export const UserName = S.string.pipe(
	S.minLength(1),
	S.maxLength(50),
	S.brand("UserName"),
);
export type UserName = S.Schema.To<typeof UserName>;

export const UserEmail = S.string.pipe(
	S.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
	S.brand("UserEmail"),
);
export type UserEmail = S.Schema.To<typeof UserEmail>;

export const User = S.struct({
	id: UserId,
	name: UserName,
	email: UserEmail,
	createdAt: S.Date,
	updatedAt: S.Date,
});
export type User = S.Schema.To<typeof User>;

export const CreateUser = S.struct({
	name: UserName,
	email: UserEmail,
});
export type CreateUser = S.Schema.To<typeof CreateUser>;
