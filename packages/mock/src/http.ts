import type { IncomingMessage, ServerResponse } from 'node:http';

export interface FieldError {
  field: string;
  rule: string;
  message: string;
}

export interface ErrorItem {
  code: string;
  message: string;
  customerActions?: string[];
  supportActions?: string[];
  fields?: FieldError[];
}

export interface RequestContext {
  requestId: string;
  correlationId: string;
}

export class MockError extends Error {
  readonly status: number;
  readonly item: ErrorItem;

  constructor(status: number, item: ErrorItem) {
    super(item.message);
    this.status = status;
    this.item = item;
  }
}

export const errors = {
  unauthorized: () =>
    new MockError(401, {
      code: 'E401-1',
      message: 'Sign in to continue',
      customerActions: ['Sign in again']
    }),
  forbidden: (scope: string) =>
    new MockError(403, {
      code: 'E403-1',
      message: `Missing scope ${scope}`,
      customerActions: ['Ask an admin for access'],
      supportActions: [`Grant the ${scope} feature to the user`]
    }),
  notFound: (what: string) =>
    new MockError(404, {
      code: 'E404-1',
      message: `${what} not found`,
      customerActions: ['Refresh the list and try again']
    }),
  badJson: () =>
    new MockError(400, {
      code: 'E400-1',
      message: 'Request body is not valid JSON',
      supportActions: ['Send a JSON body with Content-Type application/json']
    }),
  validation: (fields: FieldError[]) =>
    new MockError(422, {
      code: 'E422-1',
      message: 'Validation failed',
      customerActions: ['Fix the highlighted fields and try again'],
      supportActions: ['Check the request body against the API schema'],
      fields
    }),
  route: () => new MockError(404, { code: 'E404-0', message: 'Route not found' }),
  method: () => new MockError(405, { code: 'E405-1', message: 'Method not allowed' })
};

export function header(req: IncomingMessage, name: string): string | undefined {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

export function cookies(req: IncomingMessage): Record<string, string> {
  return Object.fromEntries(
    (header(req, 'cookie') ?? '')
      .split(';')
      .map((part) => part.trim().split('='))
      .filter((pair): pair is [string, string] => pair.length === 2 && !!pair[0])
      .map(([key, value]) => [key, decodeURIComponent(value)])
  );
}

export async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text) return {};
  try {
    const value: unknown = JSON.parse(text);
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  } catch {
    throw errors.badJson();
  }
  throw errors.badJson();
}

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export function sendEmpty(res: ServerResponse): void {
  res.statusCode = 204;
  res.end();
}

export function sendError(res: ServerResponse, ctx: RequestContext, error: MockError): void {
  sendJson(res, error.status, {
    requestId: ctx.requestId,
    correlationId: ctx.correlationId,
    errors: [error.item]
  });
}
