import type { ModuleContext, ModuleHandle } from '@dashboard/sdk';
import { mount as mountComponent, unmount as unmountComponent } from 'svelte';
import WeatherModule from './lib/WeatherModule.svelte';
import { moduleInfo } from './lib/module-info';

export const id = moduleInfo.id;

export function mount(target: HTMLElement, ctx: ModuleContext): ModuleHandle {
  const instance = mountComponent(WeatherModule, { target, props: { ctx } });
  return {
    unmount() {
      void unmountComponent(instance);
    }
  };
}
