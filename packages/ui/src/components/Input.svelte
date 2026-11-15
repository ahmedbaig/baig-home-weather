<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLInputAttributes, 'value'> {
    label: string;
    value?: string;
    error?: string | undefined;
    hint?: string;
    hideLabel?: boolean;
  }

  let {
    label,
    value = $bindable(''),
    error,
    hint,
    hideLabel = false,
    id,
    class: className,
    ...rest
  }: Props = $props();

  const generated = $props.id();
  const inputId = $derived(id ?? `input-${generated}`);
  const messageId = $derived(`${inputId}-message`);
</script>

<div class={['field', className]}>
  <label class={['label', { 'sr-only': hideLabel }]} for={inputId}>{label}</label>
  <input
    id={inputId}
    class={['control', { invalid: !!error }]}
    bind:value
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={error || hint ? messageId : undefined}
    {...rest}
  />
  {#if error}
    <p class="message error" id={messageId}>{error}</p>
  {:else if hint}
    <p class="message" id={messageId}>{hint}</p>
  {/if}
</div>

<style>
  .field {
    display: grid;
    gap: 6px;
    min-width: 0;
  }

  .label {
    font-family: var(--font-mono);
    font-size: var(--size-label);
    font-weight: 500;
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--ink-60);
  }

  .control {
    width: 100%;
    min-height: var(--target-min);
    padding: 0 12px;
    border: 1px solid var(--ink-20);
    background: var(--raised);
    color: var(--ink);
    font: inherit;
    font-size: 14px;
  }

  .control:focus {
    border-color: var(--ink);
    outline: none;
  }

  .invalid {
    border-color: var(--danger);
  }

  .message {
    margin: 0;
    font-size: 12px;
    color: var(--ink-60);
  }

  .error {
    color: var(--danger);
  }
</style>
