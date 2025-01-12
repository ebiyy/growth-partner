import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import type { D1Database } from '@cloudflare/workers-types';
import * as S from '@effect/schema/Schema';
import {
  type CreateGoal,
  Goal,
  GoalDescription,
  GoalId,
  GoalStatus,
  GoalTitle,
  UserId,
} from '@growth-partner/core';
import * as Effect from 'effect/Effect';
import { D1GoalRepository, goalMigrations } from '../goal';

describe('D1GoalRepository', () => {
  let db: D1Database;
  let repository: D1GoalRepository;

  beforeEach(async () => {
    // D1データベースのモック作成
    const mockDb = {
      prepare: mock(() => mockDb),
      bind: mock(() => mockDb),
      first: mock(() => null),
      run: mock(() => Promise.resolve({ success: true })),
      batch: mock(() => Promise.resolve()),
      exec: mock(() => Promise.resolve()),
      all: mock(() => Promise.resolve({ results: [] })),
      raw: mock(() => Promise.resolve()),
      dump: mock(() => Promise.resolve()),
    };

    db = mockDb as unknown as D1Database;
    repository = new D1GoalRepository(db);
  });

  describe('create', () => {
    it('should create a new goal', async () => {
      // テストデータの準備
      const userId = await Effect.runPromise(Effect.try(() => S.parseSync(UserId)('test-user-id')));
      const title = await Effect.runPromise(Effect.try(() => S.parseSync(GoalTitle)('Test Goal')));
      const description = await Effect.runPromise(
        Effect.try(() => S.parseSync(GoalDescription)('Test Description')),
      );
      const createGoalData: CreateGoal = {
        userId,
        title,
        description,
        dueDate: new Date('2025-12-31'),
      };

      // テストの実行
      const result = await Effect.runPromise(repository.create(createGoalData));

      // 結果の検証
      expect(result).toMatchObject({
        userId: createGoalData.userId,
        title: createGoalData.title,
        description: createGoalData.description,
        status: 'not_started',
        dueDate: createGoalData.dueDate,
      });
    });

    it('should throw an error if goal creation fails', async () => {
      // テストデータの準備
      const userId = await Effect.runPromise(Effect.try(() => S.parseSync(UserId)('test-user-id')));
      const title = await Effect.runPromise(Effect.try(() => S.parseSync(GoalTitle)('Test Goal')));
      const description = await Effect.runPromise(
        Effect.try(() => S.parseSync(GoalDescription)('Test Description')),
      );
      const createGoalData: CreateGoal = {
        userId,
        title,
        description,
        dueDate: new Date('2025-12-31'),
      };

      // エラーを発生させるモックの設定
      const mockDb = {
        prepare: mock(() => mockDb),
        bind: mock(() => mockDb),
        run: mock(() => Promise.reject(new Error('Database error'))),
      };
      db = mockDb as unknown as D1Database;
      repository = new D1GoalRepository(db);

      // テストの実行と検証
      await expect(Effect.runPromise(repository.create(createGoalData))).rejects.toThrow(
        'Failed to create goal',
      );
    });
  });

  describe('findById', () => {
    it('should find a goal by id', async () => {
      // テストデータの準備
      const goalId = await Effect.runPromise(Effect.try(() => S.parseSync(GoalId)('test-goal-id')));
      const userId = await Effect.runPromise(Effect.try(() => S.parseSync(UserId)('test-user-id')));
      const title = await Effect.runPromise(Effect.try(() => S.parseSync(GoalTitle)('Test Goal')));
      const description = await Effect.runPromise(
        Effect.try(() => S.parseSync(GoalDescription)('Test Description')),
      );
      const status = await Effect.runPromise(
        Effect.try(() => S.parseSync(GoalStatus)('not_started')),
      );

      const mockGoal = {
        id: goalId,
        user_id: userId,
        title,
        description,
        status,
        due_date: new Date('2025-12-31').toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // モックの設定
      const mockDb = {
        prepare: mock(() => mockDb),
        bind: mock(() => mockDb),
        first: mock(() => Promise.resolve(mockGoal)),
      };
      db = mockDb as unknown as D1Database;
      repository = new D1GoalRepository(db);

      // テストの実行
      const result = await Effect.runPromise(repository.findById(goalId));

      // 結果の検証
      expect(result).toMatchObject({
        id: goalId,
        userId,
        title,
        description,
        status,
      });
    });

    it('should return null if goal is not found', async () => {
      // テストの実行
      const result = await Effect.runPromise(repository.findById('non-existent-id'));

      // 結果の検証
      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find goals by user id', async () => {
      // テストデータの準備
      const userId = await Effect.runPromise(Effect.try(() => S.parseSync(UserId)('test-user-id')));
      const mockGoals = [
        {
          id: 'goal-1',
          user_id: userId,
          title: 'Goal 1',
          description: 'Description 1',
          status: 'not_started',
          due_date: new Date('2025-12-31').toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'goal-2',
          user_id: userId,
          title: 'Goal 2',
          description: 'Description 2',
          status: 'in_progress',
          due_date: new Date('2025-12-31').toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      // モックの設定
      const mockDb = {
        prepare: mock(() => mockDb),
        bind: mock(() => mockDb),
        all: mock(() => Promise.resolve({ results: mockGoals })),
      };
      db = mockDb as unknown as D1Database;
      repository = new D1GoalRepository(db);

      // テストの実行
      const result = await Effect.runPromise(repository.findByUserId(userId));

      // 結果の検証
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        userId,
        title: mockGoals[0].title,
        description: mockGoals[0].description,
        status: mockGoals[0].status,
      });
    });

    it('should return empty array if no goals found', async () => {
      // テストの実行
      const userId = await Effect.runPromise(Effect.try(() => S.parseSync(UserId)('test-user-id')));
      const result = await Effect.runPromise(repository.findByUserId(userId));

      // 結果の検証
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a goal', async () => {
      // テストデータの準備
      const goalId = await Effect.runPromise(Effect.try(() => S.parseSync(GoalId)('test-goal-id')));
      const title = await Effect.runPromise(
        Effect.try(() => S.parseSync(GoalTitle)('Updated Goal')),
      );
      const description = await Effect.runPromise(
        Effect.try(() => S.parseSync(GoalDescription)('Updated Description')),
      );
      const status = await Effect.runPromise(
        Effect.try(() => S.parseSync(GoalStatus)('completed')),
      );

      const mockUpdatedGoal = {
        id: goalId,
        user_id: 'test-user-id',
        title,
        description,
        status,
        due_date: new Date('2025-12-31').toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // モックの設定
      const mockDb = {
        prepare: mock(() => mockDb),
        bind: mock(() => mockDb),
        run: mock(() => Promise.resolve({ success: true })),
        first: mock(() => Promise.resolve(mockUpdatedGoal)),
      };
      db = mockDb as unknown as D1Database;
      repository = new D1GoalRepository(db);

      // テストの実行
      const result = await Effect.runPromise(
        repository.update(goalId, {
          title,
          description,
          status,
          dueDate: new Date('2025-12-31'),
        }),
      );

      // 結果の検証
      expect(result).toMatchObject({
        id: goalId,
        title,
        description,
        status,
      });
    });

    it('should throw an error if goal update fails', async () => {
      // テストデータの準備
      const goalId = await Effect.runPromise(Effect.try(() => S.parseSync(GoalId)('test-goal-id')));
      const title = await Effect.runPromise(
        Effect.try(() => S.parseSync(GoalTitle)('Updated Goal')),
      );

      // エラーを発生させるモックの設定
      const mockDb = {
        prepare: mock(() => mockDb),
        bind: mock(() => mockDb),
        run: mock(() => Promise.reject(new Error('Database error'))),
      };
      db = mockDb as unknown as D1Database;
      repository = new D1GoalRepository(db);

      // テストの実行と検証
      await expect(
        Effect.runPromise(
          repository.update(goalId, {
            title,
          }),
        ),
      ).rejects.toThrow('Failed to update goal');
    });
  });

  describe('delete', () => {
    it('should delete a goal', async () => {
      // モックの設定
      const mockDb = {
        prepare: mock(() => mockDb),
        bind: mock(() => mockDb),
        run: mock(() => Promise.resolve({ success: true })),
      };
      db = mockDb as unknown as D1Database;
      repository = new D1GoalRepository(db);

      // テストの実行と検証
      await expect(Effect.runPromise(repository.delete('test-goal-id'))).resolves.toBeUndefined();
    });

    it('should throw an error if goal deletion fails', async () => {
      // エラーを発生させるモックの設定
      const mockDb = {
        prepare: mock(() => mockDb),
        bind: mock(() => mockDb),
        run: mock(() => Promise.reject(new Error('Database error'))),
      };
      db = mockDb as unknown as D1Database;
      repository = new D1GoalRepository(db);

      // テストの実行と検証
      await expect(Effect.runPromise(repository.delete('test-goal-id'))).rejects.toThrow(
        'Failed to delete goal',
      );
    });
  });
});
