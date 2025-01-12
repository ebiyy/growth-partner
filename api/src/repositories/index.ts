import type { D1Database } from '@cloudflare/workers-types';
import { D1GoalRepository, goalMigrations } from './goal';
import { D1UserRepository, userMigrations } from './user';

export interface Repositories {
  userRepository: D1UserRepository;
  goalRepository: D1GoalRepository;
}

export const createRepositories = (db: D1Database): Repositories => ({
  userRepository: new D1UserRepository(db),
  goalRepository: new D1GoalRepository(db),
});

export const migrations = {
  user: userMigrations,
  goal: goalMigrations,
};

export * from './goal';
export * from './user';
