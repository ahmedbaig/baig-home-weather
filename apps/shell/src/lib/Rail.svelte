<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import type { ManifestEntry } from '@dashboard/sdk';

  interface Props {
    modules: ManifestEntry[];
  }

  let { modules }: Props = $props();

  const current = $derived(page.url.pathname.split('/')[1] ?? '');
</script>

<nav class="rail" aria-label="Modules">
  <a class="brand" href={resolve('/')} aria-label="Home"><span aria-hidden="true"></span></a>
  <a
    href={resolve('/')}
    class={{ active: current === '' }}
    aria-current={current === '' ? 'page' : undefined}
  >
    <span class="index">00</span>
    <span class="name">Home</span>
  </a>
  {#each modules as entry, index (entry.id)}
    <a
      href={resolve('/[id]/[...path]', { id: entry.id, path: '' })}
      class={{ active: current === entry.id }}
      aria-current={current === entry.id ? 'page' : undefined}
    >
      <span class="index">{String(index + 1).padStart(2, '0')}</span>
      <span class="name">{entry.title}</span>
    </a>
  {/each}
</nav>

<style>
  .rail {
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    height: 100vh;
    padding: 20px 10px;
    border-right: 1px solid var(--line);
    background: rgba(250, 249, 247, 0.4);
    -webkit-backdrop-filter: var(--glass-filter);
    backdrop-filter: var(--glass-filter);
  }

  .brand {
    display: grid;
    place-items: center;
    height: 40px;
    margin-bottom: 18px;
  }

  .brand span {
    width: 16px;
    height: 16px;
    background: var(--accent);
  }

  a {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 10px 12px;
    border-left: 2px solid transparent;
    color: var(--ink-60);
  }

  a:hover {
    background: var(--ink-05);
    color: var(--ink);
  }

  a.active {
    border-left-color: var(--accent);
    background: var(--accent-wash);
    color: var(--ink);
  }

  .index {
    font-family: var(--font-mono);
    font-size: var(--size-label);
    letter-spacing: var(--tracking-label);
  }

  .name {
    font-size: 14px;
    font-weight: 500;
  }

  @media (max-width: 760px) {
    .rail {
      position: static;
      flex-direction: row;
      height: auto;
      padding: 8px 12px;
      overflow-x: auto;
      border-right: 0;
      border-bottom: 1px solid var(--line);
    }

    .brand {
      margin: 0 8px 0 0;
    }
  }
</style>
