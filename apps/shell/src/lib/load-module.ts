import { isMicroFrontend, type MicroFrontend } from '@dashboard/sdk';

export async function loadModule(url: string): Promise<MicroFrontend> {
  const loaded: unknown = await import(/* @vite-ignore */ url);
  if (!isMicroFrontend(loaded)) {
    throw new Error(`${url} does not export mount(target, ctx)`);
  }
  return loaded;
}
