<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    message?: string;
    label?: string;
    action?: Snippet;
  }

  let { title, message, label, action }: Props = $props();
</script>

<div class="empty">
  {#if label}<p class="label">{label}</p>{/if}
  <p class="title">{title}</p>
  {#if message}<p class="message">{message}</p>{/if}
  {#if action}<div class="action">{@render action()}</div>{/if}
</div>

<style>
  .empty {
    display: grid;
    justify-items: start;
    gap: 6px;
    padding: 40px 24px;
  }

  .label {
    margin: 0 0 6px;
    font-family: var(--font-mono);
    font-size: var(--size-label);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--ink-60);
  }

  .title {
    margin: 0;
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 700;
    letter-spacing: var(--tracking-display);
  }

  .message {
    margin: 0;
    max-width: 52ch;
    color: var(--ink-60);
  }

  .action {
    margin-top: 14px;
  }
</style>
