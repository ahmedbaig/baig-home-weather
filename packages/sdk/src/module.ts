import type { User } from './types';

export type Theme = 'light' | 'dark';

export interface ModuleContext {
  apiBase: string;
  user: User;
  navigate(path: string): void;
  theme: Theme;
}

export interface ModuleHandle {
  unmount(): void;
}

export interface MicroFrontend {
  mount(target: HTMLElement, ctx: ModuleContext): ModuleHandle;
}

export interface ManifestEntry {
  id: string;
  title: string;
  url: string;
  scope: string;
}

export function isMicroFrontend(value: unknown): value is MicroFrontend {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { mount?: unknown }).mount === 'function'
  );
}

export function isManifest(value: unknown): value is ManifestEntry[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        typeof entry === 'object' &&
        entry !== null &&
        ['id', 'title', 'url', 'scope'].every(
          (key) => typeof (entry as Record<string, unknown>)[key] === 'string'
        )
    )
  );
}
