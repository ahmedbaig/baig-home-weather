<script lang="ts">
  import type { ToastItem } from '../toaster.svelte';

  interface Props {
    toast: ToastItem;
    ondismiss: (id: number) => void;
  }

  let { toast, ondismiss }: Props = $props();
</script>

<div class={['toast', toast.tone]} role={toast.tone === 'error' ? 'alert' : 'status'}>
  <span class="bar" aria-hidden="true"></span>
  <div class="body">
    <p class="title">{toast.title}</p>
    {#if toast.message}<p class="message">{toast.message}</p>{/if}
    {#if toast.meta}<p class="meta">{toast.meta}</p>{/if}
  </div>
  <button type="button" class="close" aria-label="Dismiss" onclick={() => ondismiss(toast.id)}>
    ×
  </button>
</div>

<style>
  .toast {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    width: 100%;
    padding: 14px 16px;
    background: var(--glass-bg);
    -webkit-backdrop-filter: var(--glass-filter);
    backdrop-filter: var(--glass-filter);
    border: 1px solid var(--glass-border);
    outline: 1px solid var(--glass-outline);
    box-shadow: var(--glass-shadow);
    color: var(--ink);
  }

  .bar {
    align-self: stretch;
    width: 3px;
    background: var(--ink);
  }

  .error .bar {
    background: var(--danger);
  }

  .success .bar,
  .info .bar {
    background: var(--accent);
  }

  .body {
    flex: 1;
    min-width: 0;
  }

  .title {
    margin: 0;
    font-weight: 600;
    font-size: 14px;
  }

  .error .title {
    color: var(--danger);
  }

  .message {
    margin: 2px 0 0;
    font-size: var(--size-small);
    color: var(--ink-74);
  }

  .meta {
    margin: 6px 0 0;
    font-family: var(--font-mono);
    font-size: var(--size-label);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink-60);
    overflow-wrap: anywhere;
  }

  .close {
    border: 0;
    background: none;
    color: var(--ink-60);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
  }

  .close:hover {
    color: var(--ink);
  }
</style>
