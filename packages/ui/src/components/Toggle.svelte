<script lang="ts">
  interface Props {
    label: string;
    checked?: boolean;
    disabled?: boolean;
    hideLabel?: boolean;
    onchange?: (checked: boolean) => void;
  }

  let {
    label,
    checked = $bindable(false),
    disabled = false,
    hideLabel = false,
    onchange
  }: Props = $props();

  function toggle() {
    checked = !checked;
    onchange?.(checked);
  }
</script>

<button
  type="button"
  role="switch"
  class="toggle"
  aria-checked={checked}
  aria-label={hideLabel ? label : undefined}
  {disabled}
  onclick={toggle}
>
  <span class={['track', { on: checked }]} aria-hidden="true"><span class="thumb"></span></span>
  {#if !hideLabel}<span class="text">{label}</span>{/if}
</button>

<style>
  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 32px;
    padding: 0;
    border: 0;
    background: none;
    color: var(--ink);
    font: inherit;
    font-size: 14px;
    cursor: pointer;
  }

  .toggle:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .track {
    position: relative;
    width: 34px;
    height: 18px;
    border: 1px solid var(--ink-40);
    background: var(--raised);
    transition:
      background var(--duration) var(--ease),
      border-color var(--duration) var(--ease);
  }

  .thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 12px;
    height: 12px;
    background: var(--ink-60);
    transition:
      transform var(--duration) var(--ease),
      background var(--duration) var(--ease);
  }

  .on {
    background: var(--accent);
    border-color: var(--accent);
  }

  .on .thumb {
    transform: translateX(16px);
    background: var(--on-ink);
  }
</style>
