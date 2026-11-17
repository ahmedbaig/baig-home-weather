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
import { mockForecast } from './weather.ts';

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

export function createMockApi(options: MockApiOptions = {}) {
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

  async function route(req: IncomingMessage, res: ServerResponse, url: URL): Promise<void> {
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

    if (path === '/api/v1/weather/forecast') {
      if (method !== 'GET') throw errors.method();
      requireScope(req, 'weather:read');
      const latitude = Number(url.searchParams.get('lat') ?? -33.87);
      const longitude = Number(url.searchParams.get('lon') ?? 151.21);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw errors.validation([
          { field: 'lat', rule: 'number', message: 'lat and lon must be numbers' }
        ]);
      }
      return sendJson(res, 200, mockForecast(latitude, longitude));
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
      await route(req, res, url);
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
