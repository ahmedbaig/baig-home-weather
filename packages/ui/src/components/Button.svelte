<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'ghost' | 'danger';
    size?: 'md' | 'sm';
    children: Snippet;
  }

  let {
    variant = 'ghost',
    size = 'md',
    type = 'button',
    children,
    class: className,
    ...rest
  }: Props = $props();
</script>

<button {type} class={['button', variant, size, className]} {...rest}>
  {@render children()}
</button>

<style>
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: var(--target-min);
    padding: 0 16px;
    border: 1px solid var(--ink-40);
    background: transparent;
    color: var(--ink);
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition:
      background var(--duration) var(--ease),
      border-color var(--duration) var(--ease),
      color var(--duration) var(--ease);
  }

  .button:hover:not(:disabled) {
    background: var(--ink-05);
    border-color: var(--ink);
  }

  .button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .primary {
    background: var(--ink);
    border-color: var(--ink);
    color: var(--on-ink);
  }

  .primary:hover:not(:disabled) {
    background: var(--accent-deep);
    border-color: var(--accent-deep);
  }

  .danger {
    border-color: var(--danger);
    color: var(--danger);
  }

  .danger:hover:not(:disabled) {
    background: var(--danger-wash);
    border-color: var(--danger);
  }

  .sm {
    min-height: 32px;
    padding: 0 12px;
    font-size: 12px;
  }
</style>
