<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    tone?: 'neutral' | 'accent' | 'danger' | 'ink';
    children: Snippet;
  }

  let { tone = 'neutral', children }: Props = $props();
</script>

<span class={['badge', tone]}>{@render children()}</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 7px;
    border: 1px solid currentColor;
    font-family: var(--font-mono);
    font-size: var(--size-label);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .neutral {
    color: var(--ink-60);
  }

  .ink {
    color: var(--ink);
  }

  .accent {
    color: var(--accent-ink);
  }

  .danger {
    color: var(--danger);
  }
</style>
