import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createMockApi } from './api.ts';

let server: Server;
let base = '';

beforeAll(async () => {
  const api = createMockApi({ pingMs: 60_000 });
  server = createServer((req, res) => {
    void api.handle(req, res, () => {
      res.statusCode = 404;
      res.end();
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

async function login(features: string[]): Promise<string> {
  const res = await fetch(`${base}/api/v1/session/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dev@example.test', name: 'Dev', roles: [], features })
  });
  return (res.headers.get('set-cookie') ?? '').split(';')[0] ?? '';
}

describe('mock api', () => {
  it('returns 401 with the error envelope when signed out', async () => {
    const res = await fetch(`${base}/api/v1/session`, { headers: { 'X-Request-ID': 'req-1' } });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(res.headers.get('x-request-id')).toBe('req-1');
    expect(body).toMatchObject({ requestId: 'req-1', errors: [{ code: 'E401-1' }] });
  });

  it('paginates posts for a signed in reader', async () => {
    const cookie = await login(['posts:read']);
    const res = await fetch(`${base}/api/v1/posts?take=5&skip=5`, { headers: { cookie } });
    const page = (await res.json()) as { items: unknown[] };

    expect(res.status).toBe(200);
    expect(page).toMatchObject({ take: 5, skip: 5, total: 12 });
    expect(page.items).toHaveLength(5);
  });

  it('rejects short titles with field errors', async () => {
    const cookie = await login(['posts:read', 'posts:write']);
    const res = await fetch(`${base}/api/v1/posts`, {
      method: 'POST',
      headers: { cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'ab', body: '', published: false })
    });
    const body = (await res.json()) as { errors: unknown[] };

    expect(res.status).toBe(422);
    expect(body.errors[0]).toMatchObject({
      code: 'E422-1',
      fields: [{ field: 'title', rule: 'min' }]
    });
  });

  it('forbids writes without posts:write', async () => {
    const cookie = await login(['posts:read']);
    const res = await fetch(`${base}/api/v1/posts`, {
      method: 'POST',
      headers: { cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Hello there' })
    });

    expect(res.status).toBe(403);
  });
});
