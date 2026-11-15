<script lang="ts">
  import type { Snippet } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  interface Props {
    open?: boolean;
    title: string;
    eyebrow?: string;
    children: Snippet;
    footer?: Snippet;
    onclose?: () => void;
  }

  let { open = $bindable(false), title, eyebrow, children, footer, onclose }: Props = $props();

  const uid = $props.id();
  const titleId = `drawer-${uid}`;

  function close() {
    open = false;
    onclose?.();
  }

  function onkeydown(event: KeyboardEvent) {
    if (open && event.key === 'Escape') close();
  }
</script>

<svelte:window {onkeydown} />

{#if open}
  <div
    class="backdrop"
    transition:fade={{ duration: 150 }}
    onclick={close}
    aria-hidden="true"
  ></div>
  <div
    class="drawer"
    role="dialog"
    aria-modal="true"
    aria-labelledby={titleId}
    transition:fly={{ x: 40, duration: 200 }}
  >
    <header>
      <div>
        {#if eyebrow}<p class="eyebrow">{eyebrow}</p>{/if}
        <h2 id={titleId}>{title}</h2>
      </div>
      <button type="button" class="close" aria-label="Close" onclick={close}>×</button>
    </header>
    <div class="content">{@render children()}</div>
    {#if footer}<footer>{@render footer()}</footer>{/if}
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgba(16, 16, 20, 0.18);
  }

  .drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 41;
    display: flex;
    flex-direction: column;
    width: min(460px, 100vw);
    background: var(--glass-bg), rgba(242, 241, 238, 0.7);
    -webkit-backdrop-filter: var(--glass-filter);
    backdrop-filter: var(--glass-filter);
    border-left: 1px solid var(--glass-border);
    outline: 1px solid var(--glass-outline);
    box-shadow: var(--glass-shadow);
  }

  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 24px;
    border-bottom: 1px solid var(--line);
  }

  h2 {
    font-size: var(--size-section);
  }

  .eyebrow {
    margin: 0 0 8px;
    font-family: var(--font-mono);
    font-size: var(--size-label);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--ink-60);
  }

  .close {
    border: 0;
    background: none;
    font-size: 22px;
    line-height: 1;
    color: var(--ink-60);
    cursor: pointer;
  }

  .content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }

  footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 24px;
    border-top: 1px solid var(--line);
  }
</style>
