import {
  ApiError,
  Session,
  createApiClient,
  filterByScope,
  isManifest,
  type ManifestEntry
} from '@dashboard/sdk';
import { getContext, setContext } from 'svelte';

const KEY = Symbol('shell');

export async function fetchManifest(url: string): Promise<ManifestEntry[]> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Manifest request failed with ${response.status}`);
  const body: unknown = await response.json();
  if (!isManifest(body)) throw new Error('Manifest must be a list of {id, title, url, scope}');
  return body;
}

export class Shell {
  readonly session: Session;
  manifest = $state<ManifestEntry[]>([]);
  manifestError = $state<string | null>(null);
  readonly #manifestUrl: string;

  constructor(apiBase: string, manifestUrl: string) {
    this.session = new Session(createApiClient({ baseUrl: apiBase }));
    this.#manifestUrl = manifestUrl;
  }

  async start(): Promise<void> {
    await Promise.all([this.session.load(), this.loadManifest()]);
  }

  async loadManifest(): Promise<void> {
    try {
      this.manifest = await fetchManifest(this.#manifestUrl);
      this.manifestError = null;
    } catch (error) {
      if (error instanceof ApiError || error instanceof Error) this.manifestError = error.message;
      else throw error;
    }
  }

  get modules(): ManifestEntry[] {
    return filterByScope(this.manifest, this.session.user);
  }

  find(id: string): ManifestEntry | undefined {
    return this.modules.find((entry) => entry.id === id);
  }
}

export function provideShell(shell: Shell): Shell {
  return setContext(KEY, shell);
}

export function useShell(): Shell {
  return getContext<Shell>(KEY);
}
