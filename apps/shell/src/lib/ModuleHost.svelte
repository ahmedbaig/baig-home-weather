<script lang="ts">
  import type { ManifestEntry, ModuleContext, ModuleHandle } from '@dashboard/sdk';
  import { EmptyState, Panel } from '@dashboard/ui';
  import { untrack } from 'svelte';
  import { loadModule } from './load-module';

  interface Props {
    entry: ManifestEntry;
    ctx: ModuleContext;
  }

  let { entry, ctx }: Props = $props();

  let target = $state<HTMLElement>();
  let status = $state<'loading' | 'mounted' | 'error'>('loading');
  let message = $state('');

  function start(element: HTMLElement, url: string, context: ModuleContext) {
    let handle: ModuleHandle | undefined;
    let cancelled = false;
    status = 'loading';

    loadModule(url)
      .then((module) => {
        if (cancelled) return;
        handle = module.mount(element, context);
        status = 'mounted';
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        status = 'error';
        message = error instanceof Error ? error.message : String(error);
      });

    return () => {
      cancelled = true;
      handle?.unmount();
    };
  }

  $effect(() => {
    const element = target;
    const url = entry.url;
    const context = ctx;
    if (!element) return;
    return untrack(() => start(element, url, context));
  });
</script>

<div class="host" data-module-host={entry.id} data-status={status}>
  {#if status === 'loading'}
    <p class="loading">Loading {entry.title}</p>
  {:else if status === 'error'}
    <Panel>
      <EmptyState label="Module error" title={`${entry.title} failed to load`} {message} />
    </Panel>
  {/if}
  <div class="target" bind:this={target}></div>
</div>

<style>
  .host {
    min-width: 0;
  }

  .loading {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--size-label);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--ink-60);
  }
</style>
