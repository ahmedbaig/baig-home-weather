<script lang="ts">
  import { fade } from 'svelte/transition';

  interface Props {
    visible: boolean;
    title?: string;
    accent?: string;
    status?: string;
    durationMs?: number;
  }

  let {
    visible,
    title = 'Home',
    accent = 'dashboard',
    status = 'Loading',
    durationMs = 450
  }: Props = $props();
</script>

{#if visible}
  <div class="splash" data-testid="splash" out:fade={{ duration: durationMs }} aria-busy="true">
    <div class="mark">
      <span class="logo" aria-hidden="true"></span>
      <h1>{title} <em>{accent}</em></h1>
      <p class="status"><span class="bar" aria-hidden="true"></span>{status}</p>
    </div>
  </div>
{/if}

<style>
  .splash {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: grid;
    place-items: center;
    background-color: var(--paper);
    background-image: var(--scanlines), var(--fields);
  }

  .mark {
    display: grid;
    justify-items: start;
    gap: 14px;
  }

  .logo {
    width: 18px;
    height: 18px;
    background: var(--accent);
  }

  h1 {
    font-size: var(--size-title);
  }

  .status {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--size-label);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--ink-60);
  }

  .bar {
    position: relative;
    width: 64px;
    height: 2px;
    overflow: hidden;
    background: var(--line);
  }

  .bar::after {
    content: '';
    position: absolute;
    inset: 0;
    width: 40%;
    background: var(--accent);
    animation: slide 1.1s var(--ease) infinite;
  }

  @keyframes slide {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(250%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .bar::after {
      animation: none;
    }
  }
</style>
