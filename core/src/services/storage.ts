import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import type { Goal } from '../domain/goal';
import type { User } from '../domain/user';

export interface StorageData {
  goals?: Goal[];
  user?: User;
  lastSyncTimestamp?: number;
}

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface NetworkAdapter {
  isOnline(): boolean;
}

export interface StorageService {
  readonly saveOfflineData: (data: StorageData) => Effect.Effect<never, Error, void>;
  readonly loadOfflineData: () => Effect.Effect<never, Error, StorageData>;
  readonly syncData: (localData: StorageData) => Effect.Effect<never, Error, StorageData>;
  readonly clearOfflineData: () => Effect.Effect<never, Error, void>;
}

export class StorageError extends Error {
  readonly _tag = 'StorageError';
  constructor(message: string) {
    super(`Storage error: ${message}`);
  }
}

export const StorageServiceTag = Context.Tag<StorageService>();

const STORAGE_KEY = 'growth_partner_offline_data';

export const createStorageService = (storage: StorageAdapter): StorageService => ({
  saveOfflineData: (data) =>
    Effect.try({
      try: () => {
        const serializedData = JSON.stringify({
          ...data,
          lastSyncTimestamp: Date.now(),
        });
        storage.setItem(STORAGE_KEY, serializedData);
      },
      catch: (error) => new StorageError(String(error)),
    }),

  loadOfflineData: () =>
    Effect.try({
      try: () => {
        const serializedData = storage.getItem(STORAGE_KEY);
        if (!serializedData) {
          return {};
        }
        return JSON.parse(serializedData) as StorageData;
      },
      catch: (error) => new StorageError(String(error)),
    }),

  syncData: (localData) =>
    Effect.try({
      try: () => {
        // オンライン同期処理のロジック
        // 1. ローカルの変更をサーバーに送信
        // 2. サーバーの最新データを取得
        // 3. コンフリクト解決
        // 4. マージされたデータを返却
        console.log('Syncing data with server:', localData);
        return {
          ...localData,
          lastSyncTimestamp: Date.now(),
        };
      },
      catch: (error) => new StorageError(String(error)),
    }),

  clearOfflineData: () =>
    Effect.try({
      try: () => {
        storage.removeItem(STORAGE_KEY);
      },
      catch: (error) => new StorageError(String(error)),
    }),
});

// オフラインデータの自動同期を管理するユーティリティ
export const createAutoSync = (
  storageService: StorageService,
  network: NetworkAdapter,
  intervalMs: number = 5 * 60 * 1000, // デフォルト5分
) => {
  let syncInterval: NodeJS.Timeout | null = null;

  const startAutoSync = () => {
    if (syncInterval) return;

    syncInterval = setInterval(async () => {
      if (!network.isOnline()) return;

      try {
        const localData = await Effect.runPromise(storageService.loadOfflineData());
        if (!localData.lastSyncTimestamp) return;

        const syncedData = await Effect.runPromise(storageService.syncData(localData));
        await Effect.runPromise(storageService.saveOfflineData(syncedData));
      } catch (error) {
        console.error('Auto sync failed:', error);
      }
    }, intervalMs);
  };

  const stopAutoSync = () => {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  };

  return {
    startAutoSync,
    stopAutoSync,
  };
};
