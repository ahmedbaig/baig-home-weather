import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createEventHub } from './events.ts';
import {
  MockError,
  cookies,
  errors,
  header,
  readJson,
  sendEmpty,
  sendError,
  sendJson,
  type RequestContext
} from './http.ts';
import { createPostStore, validate, type PostInput } from './posts.ts';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  features: string[];
}

export interface MockApiOptions {
  pingMs?: number;
}

type Next = (error?: unknown) => void;

const SID = 'sid';

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function intParam(value: string | null, fallback: number, max: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.min(parsed, max) : fallback;
}

function boolParam(value: string | null): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

export function createMockApi(options: MockApiOptions = {}) {
  const posts = createPostStore();
  const hub = createEventHub({ pingMs: options.pingMs });
  const sessions = new Map<string, User>();

  function currentUser(req: IncomingMessage): User {
    const sid = cookies(req)[SID];
    const user = sid ? sessions.get(sid) : undefined;
    if (!user) throw errors.unauthorized();
    return user;
  }

  function requireScope(req: IncomingMessage, scope: string): User {
    const user = currentUser(req);
    if (!user.features.includes(scope)) throw errors.forbidden(scope);
    return user;
  }

  async function devLogin(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const body = await readJson(req);
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    if (!email.includes('@')) {
      throw errors.validation([{ field: 'email', rule: 'email', message: 'Enter a valid email' }]);
    }
    const user: User = {
      id: randomUUID(),
      email,
      name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : email,
      roles: strings(body.roles),
      features: strings(body.features)
    };
    const sid = randomUUID();
    sessions.set(sid, user);
    res.setHeader('Set-Cookie', `${SID}=${sid}; Path=/; HttpOnly; SameSite=Lax`);
    sendJson(res, 200, { user });
  }

  function logout(req: IncomingMessage, res: ServerResponse): void {
    const sid = cookies(req)[SID];
    if (sid) sessions.delete(sid);
    res.setHeader('Set-Cookie', `${SID}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
    sendEmpty(res);
  }

  async function route(
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
    ctx: RequestContext
  ): Promise<void> {
    const method = req.method ?? 'GET';
    const path = url.pathname.replace(/\/+$/, '');

    if (path === '/api/v1/session') {
      if (method === 'GET') return sendJson(res, 200, { user: currentUser(req) });
      if (method === 'DELETE') return logout(req, res);
      throw errors.method();
    }

    if (path === '/api/v1/session/dev-login') {
      if (method === 'POST') return devLogin(req, res);
      throw errors.method();
    }

    if (path === '/api/v1/events') {
      if (method !== 'GET') throw errors.method();
      currentUser(req);
      const topics = (url.searchParams.get('topics') ?? '').split(',').filter(Boolean);
      return hub.subscribe(req, res, topics);
    }

    if (path === '/api/v1/posts') {
      if (method === 'GET') {
        requireScope(req, 'posts:read');
        return sendJson(
          res,
          200,
          posts.list({
            take: intParam(url.searchParams.get('take'), 20, 100),
            skip: intParam(url.searchParams.get('skip'), 0, Number.MAX_SAFE_INTEGER),
            published: boolParam(url.searchParams.get('published')),
            q: url.searchParams.get('q') ?? undefined
          })
        );
      }
      if (method === 'POST') {
        const user = requireScope(req, 'posts:write');
        const input = validate(await readJson(req), false) as PostInput;
        const post = posts.create(user.id, input);
        hub.publish('posts', 'posts.created', post, ctx.correlationId);
        return sendJson(res, 201, post);
      }
      throw errors.method();
    }

    const match = /^\/api\/v1\/posts\/([^/]+)$/.exec(path);
    if (match?.[1]) {
      const id = decodeURIComponent(match[1]);
      if (method === 'GET') {
        requireScope(req, 'posts:read');
        return sendJson(res, 200, posts.get(id));
      }
      if (method === 'PATCH') {
        requireScope(req, 'posts:write');
        const post = posts.update(id, validate(await readJson(req), true));
        hub.publish('posts', 'posts.updated', post, ctx.correlationId);
        return sendJson(res, 200, post);
      }
      if (method === 'DELETE') {
        requireScope(req, 'posts:write');
        posts.remove(id);
        hub.publish('posts', 'posts.deleted', { id }, ctx.correlationId);
        return sendEmpty(res);
      }
      throw errors.method();
    }

    throw errors.route();
  }

  async function handle(req: IncomingMessage, res: ServerResponse, next: Next): Promise<void> {
    const url = new URL(req.url ?? '/', 'http://mock.invalid');
    if (!url.pathname.startsWith('/api/')) return next();

    const ctx: RequestContext = {
      requestId: header(req, 'x-request-id') ?? randomUUID(),
      correlationId: header(req, 'x-correlation-id') ?? randomUUID()
    };
    res.setHeader('X-Request-ID', ctx.requestId);
    res.setHeader('X-Correlation-ID', ctx.correlationId);

    try {
      await route(req, res, url, ctx);
    } catch (error) {
      if (error instanceof MockError) return sendError(res, ctx, error);
      sendError(
        res,
        ctx,
        new MockError(500, {
          code: 'E500-1',
          message: 'Unexpected mock error',
          supportActions: [String(error)]
        })
      );
    }
  }

  return { handle, hub };
}
