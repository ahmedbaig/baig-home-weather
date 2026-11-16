import type { ModuleContext, ModuleHandle } from '@dashboard/sdk';
import { mount as mountComponent, unmount as unmountComponent } from 'svelte';
import PostsModule from './lib/PostsModule.svelte';
import { moduleInfo } from './lib/module-info';

export const id = moduleInfo.id;

export function mount(target: HTMLElement, ctx: ModuleContext): ModuleHandle {
  const instance = mountComponent(PostsModule, { target, props: { ctx } });
  return {
    unmount() {
      void unmountComponent(instance);
    }
  };
}
