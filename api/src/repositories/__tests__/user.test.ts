import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import type { D1Database } from '@cloudflare/workers-types';
import * as S from '@effect/schema/Schema';
import { type CreateUser, User, UserEmail, UserId, UserName } from '@growth-partner/core';
import * as Effect from 'effect/Effect';
import { D1UserRepository, userMigrations } from '../user';

describe('D1UserRepository', () => {
  let db: D1Database;
  let repository: D1UserRepository;

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
    repository = new D1UserRepository(db);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      // テストデータの準備
      const name = await Effect.runPromise(Effect.try(() => S.parseSync(UserName)('Test User')));
      const email = await Effect.runPromise(
        Effect.try(() => S.parseSync(UserEmail)('test@example.com')),
      );
      const createUserData: CreateUser = {
        name,
        email,
      };

      // テストの実行
      const result = await Effect.runPromise(repository.create(createUserData));

      // 結果の検証
      expect(result).toMatchObject({
        name: createUserData.name,
        email: createUserData.email,
      });
    });

    it('should throw an error if user creation fails', async () => {
      // テストデータの準備
      const name = await Effect.runPromise(Effect.try(() => S.parseSync(UserName)('Test User')));
      const email = await Effect.runPromise(
        Effect.try(() => S.parseSync(UserEmail)('test@example.com')),
      );
      const createUserData: CreateUser = {
        name,
        email,
      };

      // エラーを発生させるモックの設定
      const mockDb = {
        prepare: mock(() => mockDb),
        bind: mock(() => mockDb),
        run: mock(() => Promise.reject(new Error('Database error'))),
      };
      db = mockDb as unknown as D1Database;
      repository = new D1UserRepository(db);

      // テストの実行と検証
      await expect(Effect.runPromise(repository.create(createUserData))).rejects.toThrow(
        'Failed to create user',
      );
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      // テストデータの準備
      const userId = await Effect.runPromise(Effect.try(() => S.parseSync(UserId)('test-user-id')));
      const name = await Effect.runPromise(Effect.try(() => S.parseSync(UserName)('Test User')));
      const email = await Effect.runPromise(
        Effect.try(() => S.parseSync(UserEmail)('test@example.com')),
      );
      const mockUser = {
        id: userId,
        name,
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // モックの設定
      const mockDb = {
        prepare: mock(() => mockDb),
        bind: mock(() => mockDb),
        first: mock(() => Promise.resolve(mockUser)),
      };
      db = mockDb as unknown as D1Database;
      repository = new D1UserRepository(db);

      // テストの実行
      const result = await Effect.runPromise(repository.findById(userId));

      // 結果の検証
      expect(result).toMatchObject({
        id: userId,
        name,
        email,
      });
    });

    it('should return null if user is not found', async () => {
      // テストの実行
      const result = await Effect.runPromise(repository.findById('non-existent-id'));

      // 結果の検証
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      // テストデータの準備
      const userId = await Effect.runPromise(Effect.try(() => S.parseSync(UserId)('test-user-id')));
      const name = await Effect.runPromise(Effect.try(() => S.parseSync(UserName)('Test User')));
      const email = await Effect.runPromise(
        Effect.try(() => S.parseSync(UserEmail)('test@example.com')),
      );
      const mockUser = {
        id: userId,
        name,
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // モックの設定
      const mockDb = {
        prepare: mock(() => mockDb),
        bind: mock(() => mockDb),
        first: mock(() => Promise.resolve(mockUser)),
      };
      db = mockDb as unknown as D1Database;
      repository = new D1UserRepository(db);

      // テストの実行
      const result = await Effect.runPromise(repository.findByEmail(email));

      // 結果の検証
      expect(result).toMatchObject({
        id: userId,
        name,
        email,
      });
    });

    it('should return null if user is not found by email', async () => {
      // テストの実行
      const email = await Effect.runPromise(
        Effect.try(() => S.parseSync(UserEmail)('non-existent@example.com')),
      );
      const result = await Effect.runPromise(repository.findByEmail(email));

      // 結果の検証
      expect(result).toBeNull();
    });
  });
});
