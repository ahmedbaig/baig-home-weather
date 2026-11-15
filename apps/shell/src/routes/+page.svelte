<script lang="ts">
  import { resolve } from '$app/paths';
  import { useShell } from '$lib/shell.svelte';
  import { Badge, EmptyState, Eyebrow, Panel } from '@dashboard/ui';

  const shell = useShell();
</script>

<svelte:head><title>Dashboard</title></svelte:head>

<div class="home">
  <header class="head">
    <Eyebrow index={0}>Home</Eyebrow>
    <h1>Home <em>dashboard</em></h1>
  </header>

  {#if shell.manifestError}
    <Panel>
      <EmptyState label="Manifest" title="Could not load modules" message={shell.manifestError} />
    </Panel>
  {:else if shell.modules.length === 0}
    <Panel>
      <EmptyState
        label="Modules"
        title="Nothing to show"
        message="Your session has no scopes that match a module in the manifest."
      />
    </Panel>
  {:else}
    <div class="grid">
      {#each shell.modules as entry, index (entry.id)}
        <a class="card" href={resolve('/[id]/[...path]', { id: entry.id, path: '' })}>
          <Panel>
            <Eyebrow index={index + 1}>{entry.id}</Eyebrow>
            <p class="title">{entry.title}</p>
            <Badge tone="ink">{entry.scope}</Badge>
          </Panel>
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  .home {
    display: grid;
    gap: var(--space-gap);
  }

  .head {
    display: grid;
    gap: 10px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--line);
  }

  h1 {
    font-size: var(--size-title);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--space-gap);
  }

  .card {
    color: inherit;
  }

  .card :global(.panel) {
    display: grid;
    gap: 14px;
    justify-items: start;
    height: 100%;
    transition: outline-color var(--duration) var(--ease);
  }

  .card:hover :global(.panel) {
    outline-color: var(--accent);
  }

  .title {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--size-section);
    font-weight: 700;
    letter-spacing: var(--tracking-display);
  }

  @media (max-width: 640px) {
    h1 {
      font-size: 40px;
    }
  }
</style>
