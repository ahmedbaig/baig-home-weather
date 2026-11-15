<script lang="ts">
  import { hasScope, type ModuleContext } from '@dashboard/sdk';
  import { Button, EmptyState, Panel, Toaster, createToaster } from '@dashboard/ui';
  import { moduleInfo } from './module-info';
  import PostsView from './posts/PostsView.svelte';

  interface Props {
    ctx: ModuleContext;
  }

  let { ctx }: Props = $props();

  const toaster = createToaster();
  const canRead = $derived(hasScope(ctx.user, moduleInfo.readScope));
  const canWrite = $derived(hasScope(ctx.user, moduleInfo.writeScope));
</script>

<div class="module" data-module={moduleInfo.id} data-theme={ctx.theme}>
  {#if canRead}
    <PostsView apiBase={ctx.apiBase} {canWrite} {toaster} />
  {:else}
    <Panel>
      <EmptyState
        label="403 — No access"
        title="You can't see posts"
        message={`Your session is missing the ${moduleInfo.readScope} scope. Ask an admin to add it.`}
      >
        {#snippet action()}
          <Button onclick={() => ctx.navigate('/')}>Back home</Button>
        {/snippet}
      </EmptyState>
    </Panel>
  {/if}
  <Toaster store={toaster} />
</div>

<style>
  .module {
    display: grid;
    gap: var(--space-gap);
    min-width: 0;
  }
</style>
