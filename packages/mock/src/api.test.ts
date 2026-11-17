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

  it('returns a 7 day forecast for a signed in reader', async () => {
    const cookie = await login(['weather:read']);
    const res = await fetch(`${base}/api/v1/weather/forecast?lat=-33.87&lon=151.21`, {
      headers: { cookie }
    });
    const body = (await res.json()) as { latitude: number; daily: { time: string[] } };

    expect(res.status).toBe(200);
    expect(body.latitude).toBe(-33.87);
    expect(body.daily.time).toHaveLength(7);
  });

  it('rejects coordinates that are not numbers', async () => {
    const cookie = await login(['weather:read']);
    const res = await fetch(`${base}/api/v1/weather/forecast?lat=abc&lon=151`, {
      headers: { cookie }
    });

    expect(res.status).toBe(422);
  });

  it('forbids the forecast without weather:read', async () => {
    const cookie = await login([]);
    const res = await fetch(`${base}/api/v1/weather/forecast`, { headers: { cookie } });

    expect(res.status).toBe(403);
  });
});
