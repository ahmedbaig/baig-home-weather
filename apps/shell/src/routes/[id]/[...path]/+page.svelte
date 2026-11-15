<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { apiBase } from '$lib/env';
  import ModuleHost from '$lib/ModuleHost.svelte';
  import { useShell } from '$lib/shell.svelte';
  import type { ModuleContext } from '@dashboard/sdk';
  import { EmptyState, Panel } from '@dashboard/ui';

  const shell = useShell();

  const entry = $derived(shell.find(page.params.id ?? ''));
  const ctx = $derived<ModuleContext | null>(
    shell.session.user
      ? {
          apiBase,
          user: $state.snapshot(shell.session.user),
          navigate: (path) => void goto(path),
          theme: 'light'
        }
      : null
  );
</script>

<svelte:head><title>{entry?.title ?? 'Not found'} — Dashboard</title></svelte:head>

{#if entry && ctx}
  {#key entry.id}
    <ModuleHost {entry} {ctx} />
  {/key}
{:else}
  <Panel>
    <EmptyState
      label="404"
      title="Module not found"
      message="It is not in the manifest, or your session does not have its scope."
    />
  </Panel>
{/if}
