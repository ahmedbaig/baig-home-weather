<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    index?: number | string;
    children: Snippet;
  }

  let { index, children }: Props = $props();

  const number = $derived(typeof index === 'number' ? String(index).padStart(2, '0') : index);
</script>

<p class="eyebrow">
  {#if number !== undefined}<span class="index">{number}</span><span aria-hidden="true">—</span
    >{/if}
  <span>{@render children()}</span>
</p>

<style>
  .eyebrow {
    display: flex;
    gap: 8px;
    align-items: baseline;
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--size-label);
    font-weight: 500;
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--ink-60);
  }

  .index {
    color: var(--ink);
  }
</style>
