import type { GoalRepository, UserRepository } from '@growth-partner/core';
import type { inferAsyncReturnType } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

// ログレベルの定義
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// ログエントリの型定義
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

// ロガーインターフェース
export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

// デフォルトロガーの実装
export class DefaultLogger implements Logger {
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  debug(message: string, context?: Record<string, unknown>): void {
    console.debug(JSON.stringify(this.createLogEntry(LogLevel.DEBUG, message, context)));
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.info(JSON.stringify(this.createLogEntry(LogLevel.INFO, message, context)));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(JSON.stringify(this.createLogEntry(LogLevel.WARN, message, context)));
  }

  error(message: string, context?: Record<string, unknown>): void {
    console.error(JSON.stringify(this.createLogEntry(LogLevel.ERROR, message, context)));
  }
}

interface CreateContextOptions {
  userRepository: UserRepository;
  goalRepository: GoalRepository;
  logger?: Logger;
}

export function createContext(
  opts: FetchCreateContextFnOptions,
  { userRepository, goalRepository, logger = new DefaultLogger() }: CreateContextOptions,
) {
  return {
    userRepository,
    goalRepository,
    logger,
    headers: opts.req.headers,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
