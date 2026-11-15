import { describe, expect, it, vi } from 'vitest';
import { buildUrl, createApiClient } from './client';
import { ApiError, NETWORK_ERROR_CODE } from './errors';
import { uuidv7 } from './ids';

function fakeFetch(response: () => Response) {
  return vi.fn<typeof globalThis.fetch>(async () => response());
}

function sentHeaders(mock: ReturnType<typeof fakeFetch>): Headers {
  const init = mock.mock.calls[0]?.[1];
  return new Headers(init?.headers);
}

describe('createApiClient', () => {
  it('sends request and correlation ids with credentials', async () => {
    const fetch = fakeFetch(() => Response.json({ ok: true }));
    const client = createApiClient({
      baseUrl: 'https://api.example.test/',
      fetch,
      correlationId: 'corr-page',
      requestId: () => 'req-1'
    });

    await client.get('/api/v1/posts', { query: { take: 20, skip: 0, q: '' } });

    const [url, init] = fetch.mock.calls[0] ?? [];
    expect(url).toBe('https://api.example.test/api/v1/posts?take=20&skip=0');
    expect(init?.credentials).toBe('include');
    expect(sentHeaders(fetch).get('X-Request-ID')).toBe('req-1');
    expect(sentHeaders(fetch).get('X-Correlation-ID')).toBe('corr-page');
  });

  it('passes a per-action correlation id through', async () => {
    const fetch = fakeFetch(() => Response.json({}));
    const client = createApiClient({ fetch, correlationId: 'corr-page' });

    await client.post('/api/v1/posts', { title: 'Hello' }, { correlationId: 'corr-action' });

    expect(sentHeaders(fetch).get('X-Correlation-ID')).toBe('corr-action');
    expect(sentHeaders(fetch).get('Content-Type')).toBe('application/json');
    expect(fetch.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ title: 'Hello' }));
  });

  it('reads ids back from response headers', async () => {
    const fetch = fakeFetch(
      () =>
        new Response(JSON.stringify({ id: '1' }), {
          status: 201,
          headers: { 'X-Request-ID': 'req-server', 'X-Correlation-ID': 'corr-server' }
        })
    );
    const client = createApiClient({ fetch });

    const response = await client.send<{ id: string }>('POST', '/api/v1/posts', { body: {} });

    expect(response).toEqual({
      status: 201,
      data: { id: '1' },
      requestId: 'req-server',
      correlationId: 'corr-server'
    });
  });

  it('throws ApiError for error responses', async () => {
    const fetch = fakeFetch(() =>
      Response.json(
        {
          requestId: 'req-9',
          correlationId: 'corr-9',
          errors: [{ code: 'E403-1', message: 'Missing scope posts:write' }]
        },
        { status: 403 }
      )
    );
    const client = createApiClient({ fetch });

    const error = await client.delete('/api/v1/posts/1').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 403, code: 'E403-1', requestId: 'req-9' });
  });

  it('turns network failures into ApiError with status 0', async () => {
    const fetchMock = vi.fn<typeof globalThis.fetch>(async () => {
      throw new TypeError('Failed to fetch');
    });
    const client = createApiClient({ fetch: fetchMock, requestId: () => 'req-net' });

    const error = await client.get('/api/v1/session').catch((e: unknown) => e);

    expect(error).toMatchObject({ status: 0, code: NETWORK_ERROR_CODE, requestId: 'req-net' });
  });

  it('returns undefined for empty responses', async () => {
    const client = createApiClient({ fetch: fakeFetch(() => new Response(null, { status: 204 })) });

    await expect(client.delete('/api/v1/session')).resolves.toBeUndefined();
  });
});

describe('buildUrl', () => {
  it('skips empty query values', () => {
    expect(buildUrl('', '/x', { a: 1, b: undefined, c: null, d: '', e: false })).toBe(
      '/x?a=1&e=false'
    );
  });
});

describe('uuidv7', () => {
  it('produces sortable version 7 ids', () => {
    const first = uuidv7(1_700_000_000_000);
    const second = uuidv7(1_700_000_000_001);
    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(first < second).toBe(true);
  });
});
