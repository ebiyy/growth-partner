import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createContext } from './context';
import { createRepositories } from './repositories';
import { appRouter } from './router';

export interface Env {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

// CORSの設定
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:3000', // Next.js開発サーバー
      'http://localhost:5173', // Tauriアプリ開発サーバー
      'https://growth-partner.pages.dev', // 本番環境
    ],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
  }),
);

// ヘルスチェックエンドポイント
app.get('/healthz', (c) => c.json({ status: 'ok' }));

// tRPCハンドラー
app.all('/trpc/*', async (c) => {
  const repositories = createRepositories(c.env.DB);

  const response = await fetchRequestHandler({
    endpoint: '/trpc',
    req: c.req.raw,
    router: appRouter,
    createContext: (opts) => createContext(opts, repositories),
    onError: ({ error, path }) => {
      console.error(`[tRPC] Error in ${path ?? '<no-path>'}:`, error);
    },
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
});

// エラーハンドリング
app.onError((err, c) => {
  console.error('[Hono] Error:', err);
  return c.json(
    {
      status: 'error',
      message: err.message,
    },
    500,
  );
});

// 404ハンドリング
app.notFound((c) => {
  return c.json(
    {
      status: 'error',
      message: 'Not Found',
    },
    404,
  );
});

export default app;
