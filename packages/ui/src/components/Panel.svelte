<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLElement> {
    as?: 'section' | 'div' | 'article' | 'aside' | 'header';
    glass?: boolean;
    padded?: boolean;
    children: Snippet;
  }

  let {
    as = 'section',
    glass = true,
    padded = true,
    children,
    class: className,
    ...rest
  }: Props = $props();
</script>

<svelte:element this={as} class={['panel', { glass, padded }, className]} {...rest}>
  {@render children()}
</svelte:element>

<style>
  .panel {
    min-width: 0;
    background: var(--raised);
    border: 1px solid var(--line);
  }

  .glass {
    background: var(--glass-bg);
    -webkit-backdrop-filter: var(--glass-filter);
    backdrop-filter: var(--glass-filter);
    border: 1px solid var(--glass-border);
    outline: 1px solid var(--glass-outline);
    box-shadow: var(--glass-shadow);
  }

  .padded {
    padding: var(--space-panel) calc(var(--space-panel) + 4px);
  }
</style>
