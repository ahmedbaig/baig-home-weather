import type { ApiClient } from './client';
import { ApiError } from './errors';
import { hasScope } from './scopes';
import type { DevLoginInput, SessionResponse, User } from './types';

export const SESSION_PATH = '/api/v1/session';

export function sessionApi(client: ApiClient) {
  return {
    get: () => client.get<SessionResponse>(SESSION_PATH),
    devLogin: (input: DevLoginInput) =>
      client.post<SessionResponse>(`${SESSION_PATH}/dev-login`, input),
    logout: () => client.delete(SESSION_PATH)
  };
}

export type SessionStatus = 'loading' | 'signed-in' | 'signed-out' | 'error';

export function canDevLogin(hostname: string): boolean {
  return ['localhost', '127.0.0.1', '[::1]'].includes(hostname);
}

export class Session {
  user = $state<User | null>(null);
  status = $state<SessionStatus>('loading');
  error = $state<ApiError | null>(null);
  readonly #api: ReturnType<typeof sessionApi>;

  constructor(client: ApiClient) {
    this.#api = sessionApi(client);
  }

  can(scope: string): boolean {
    return hasScope(this.user, scope);
  }

  async load(): Promise<void> {
    this.status = 'loading';
    try {
      this.#signIn(await this.#api.get());
    } catch (error) {
      this.#fail(error);
    }
  }

  async devLogin(input: DevLoginInput): Promise<void> {
    try {
      this.#signIn(await this.#api.devLogin(input));
    } catch (error) {
      this.#fail(error);
    }
  }

  async logout(): Promise<void> {
    await this.#api.logout();
    this.user = null;
    this.status = 'signed-out';
  }

  #signIn(response: SessionResponse): void {
    this.user = response.user;
    this.error = null;
    this.status = 'signed-in';
  }

  #fail(error: unknown): void {
    this.user = null;
    if (error instanceof ApiError && error.status === 401) {
      this.error = null;
      this.status = 'signed-out';
      return;
    }
    if (!(error instanceof ApiError)) throw error;
    this.error = error;
    this.status = 'error';
  }
}
