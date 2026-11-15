<script lang="ts">
  interface Props {
    label: string;
    value: string | number;
    unit?: string;
    hint?: string;
    tone?: 'ink' | 'accent' | 'danger';
  }

  let { label, value, unit, hint, tone = 'ink' }: Props = $props();
</script>

<div class="stat">
  <span class="label">{label}</span>
  <span class={['value', tone]}>
    {value}{#if unit}<span class="unit">{unit}</span>{/if}
  </span>
  {#if hint}<span class="hint">{hint}</span>{/if}
</div>

<style>
  .stat {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    padding: 18px 20px;
    background: rgba(250, 249, 247, 0.55);
  }

  .label {
    font-family: var(--font-mono);
    font-size: var(--size-label);
    font-weight: 500;
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--ink-60);
  }

  .value {
    font-family: var(--font-mono);
    font-size: var(--size-data);
    font-weight: 600;
    letter-spacing: var(--tracking-data);
    line-height: 1;
  }

  .accent {
    color: var(--accent-ink);
  }

  .danger {
    color: var(--danger);
  }

  .unit {
    margin-left: 4px;
    font-size: 13px;
    font-weight: 500;
    color: var(--ink-60);
  }

  .hint {
    font-size: var(--size-small);
    color: var(--ink-60);
  }
</style>
