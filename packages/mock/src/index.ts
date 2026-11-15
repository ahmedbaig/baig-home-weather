import { createReadStream, statSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import type { Plugin } from 'vite';
import { createMockApi, type MockApiOptions } from './api.ts';

export { createMockApi } from './api.ts';
export type { MockApiOptions, User } from './api.ts';

export interface MockPluginOptions extends MockApiOptions {
  enabled?: boolean;
}

export function isMockEnabled(): boolean {
  return process.env.PUBLIC_MOCK === '1' || process.env.PUBLIC_MOCK === 'true';
}

export function mockApi(options: MockPluginOptions = {}): Plugin {
  const enabled = options.enabled ?? isMockEnabled();
  const api = createMockApi(options);
  const handle = (req: IncomingMessage, res: ServerResponse, next: (error?: unknown) => void) => {
    void api.handle(req, res, next);
  };

  return {
    name: 'dashboard:mock-api',
    apply: () => enabled,
    configureServer(server) {
      server.middlewares.use(handle);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle);
    }
  };
}

const contentTypes: Record<string, string> = {
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.map': 'application/json; charset=utf-8'
};

export interface ServeModuleOptions {
  dir: string;
  base?: string;
}

export function serveModule({ dir, base = '/module' }: ServeModuleOptions): Plugin {
  const root = resolve(dir);

  return {
    name: 'dashboard:serve-module',
    configurePreviewServer(server) {
      server.middlewares.use(base, (req, res, next) => {
        const pathname = decodeURIComponent(
          new URL(req.url ?? '/', 'http://local.invalid').pathname
        );
        const file = resolve(root, `.${pathname}`);
        if (!file.startsWith(root + sep)) return next();
        try {
          if (!statSync(file).isFile()) return next();
        } catch {
          return next();
        }
        res.setHeader('Content-Type', contentTypes[extname(file)] ?? 'application/octet-stream');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache');
        createReadStream(file).pipe(res);
      });
    }
  };
}
