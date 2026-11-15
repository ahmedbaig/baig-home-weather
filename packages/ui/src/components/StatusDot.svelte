<script lang="ts" module>
  export type DotStatus = 'ok' | 'live' | 'pending' | 'down';
</script>

<script lang="ts">
  interface Props {
    status: DotStatus;
    label?: string;
  }

  let { status, label }: Props = $props();
</script>

<span class="status" data-status={status} role="status">
  <span class={['dot', status]} aria-hidden="true"></span>
  <span class={{ 'sr-only': !label }}>{label ?? status}</span>
</span>

<style>
  .status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: var(--size-label);
    font-weight: 500;
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--ink-74);
  }

  .dot {
    position: relative;
    width: 8px;
    height: 8px;
    border-radius: var(--radius-dot);
    background: var(--ink);
  }

  .live {
    background: var(--accent);
  }

  .live::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: var(--radius-dot);
    border: 1px solid var(--accent);
    animation: pulse 1.8s var(--ease) infinite;
  }

  .pending {
    background: transparent;
    border: 1px solid var(--ink-60);
  }

  .down {
    background: var(--danger);
  }

  @keyframes pulse {
    from {
      opacity: 0.9;
      transform: scale(0.6);
    }
    to {
      opacity: 0;
      transform: scale(1.6);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .live::after {
      animation: none;
    }
  }
</style>
