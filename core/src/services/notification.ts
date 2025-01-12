import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import type { Goal } from '../domain/goal';
import type { User } from '../domain/user';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface NotificationService {
  readonly sendGoalDueNotification: (user: User, goal: Goal) => Effect.Effect<never, Error, void>;
  readonly sendGoalStatusUpdateNotification: (
    user: User,
    goal: Goal,
  ) => Effect.Effect<never, Error, void>;
  readonly sendMotivationalNotification: (
    user: User,
    goals: Goal[],
  ) => Effect.Effect<never, Error, void>;
}

export class NotificationError extends Error {
  readonly _tag = 'NotificationError';
  constructor(message: string) {
    super(`Notification error: ${message}`);
  }
}

export const NotificationServiceTag = Context.Tag<NotificationService>();

export const createNotificationService = (): NotificationService => ({
  sendGoalDueNotification: (user, goal) =>
    Effect.try({
      try: () => {
        const dueDate = goal.dueDate;
        if (!dueDate) return;

        const now = new Date();
        const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff <= 3 && daysDiff > 0) {
          const notification: NotificationPayload = {
            title: '目標期限が近づいています',
            body: `「${goal.title}」の期限まであと${daysDiff}日です。`,
            data: {
              goalId: goal.id,
              type: 'goal_due',
            },
          };
          // 通知の送信処理（実際の実装はプラットフォームに依存）
          console.log('Sending notification:', notification);
        }
      },
      catch: (error) => new NotificationError(String(error)),
    }),

  sendGoalStatusUpdateNotification: (user, goal) =>
    Effect.try({
      try: () => {
        const notification: NotificationPayload = {
          title: '目標のステータスが更新されました',
          body: `「${goal.title}」のステータスが「${goal.status}」に更新されました。`,
          data: {
            goalId: goal.id,
            type: 'goal_status_update',
          },
        };
        // 通知の送信処理
        console.log('Sending notification:', notification);
      },
      catch: (error) => new NotificationError(String(error)),
    }),

  sendMotivationalNotification: (user, goals) =>
    Effect.try({
      try: () => {
        const completedGoals = goals.filter((g) => g.status === 'completed');
        const inProgressGoals = goals.filter((g) => g.status === 'in_progress');

        let message = '';
        if (completedGoals.length > 0) {
          message = `${completedGoals.length}個の目標を達成しました！素晴らしい進捗です！`;
        } else if (inProgressGoals.length > 0) {
          message = '目標達成に向けて着実に進んでいますね！';
        } else {
          message = '新しい目標を設定して、一緒に成長していきましょう！';
        }

        const notification: NotificationPayload = {
          title: 'モチベーション応援メッセージ',
          body: message,
          data: {
            type: 'motivational',
          },
        };
        // 通知の送信処理
        console.log('Sending notification:', notification);
      },
      catch: (error) => new NotificationError(String(error)),
    }),
});
