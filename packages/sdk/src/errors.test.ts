import { describe, expect, it } from 'vitest';
import { ApiError, parseErrorResponse, type ErrorEnvelope } from './errors';

const sent = { requestId: 'req-sent', correlationId: 'corr-sent' };

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}

describe('parseErrorResponse', () => {
  it('reads the error envelope into a typed ApiError', async () => {
    const envelope: ErrorEnvelope = {
      requestId: 'req-1',
      correlationId: 'corr-1',
      errors: [
        {
          code: 'E422-1',
          message: 'Validation failed',
          customerActions: ['Fix the highlighted fields'],
          supportActions: ['Check request payload'],
          fields: [{ field: 'title', rule: 'min', message: 'Title must be at least 3 characters' }]
        }
      ]
    };

    const error = await parseErrorResponse(jsonResponse(422, envelope), sent);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(422);
    expect(error.code).toBe('E422-1');
    expect(error.message).toBe('Validation failed');
    expect(error.requestId).toBe('req-1');
    expect(error.correlationId).toBe('corr-1');
    expect(error.customerActions).toEqual(['Fix the highlighted fields']);
    expect(error.fieldError('title')).toBe('Title must be at least 3 characters');
    expect(error.fieldErrors()).toEqual({ title: 'Title must be at least 3 characters' });
  });

  it('falls back to response headers when the body has no ids', async () => {
    const response = jsonResponse(
      404,
      { requestId: '', correlationId: '', errors: [{ code: 'E404-1', message: 'Post not found' }] },
      { 'X-Request-ID': 'req-header', 'X-Correlation-ID': 'corr-header' }
    );

    const error = await parseErrorResponse(response, sent);

    expect(error.code).toBe('E404-1');
    expect(error.requestId).toBe('req-header');
    expect(error.correlationId).toBe('corr-header');
  });

  it('builds a generic error when the body is not an envelope', async () => {
    const response = new Response('<html>bad gateway</html>', {
      status: 502,
      statusText: 'Bad Gateway'
    });

    const error = await parseErrorResponse(response, sent);

    expect(error.status).toBe(502);
    expect(error.code).toBe('E502-0');
    expect(error.message).toBe('Bad Gateway');
    expect(error.requestId).toBe('req-sent');
    expect(error.fields).toEqual([]);
  });
});
