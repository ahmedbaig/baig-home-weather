<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLTextareaAttributes, 'value'> {
    label: string;
    value?: string;
    error?: string | undefined;
    hint?: string;
  }

  let {
    label,
    value = $bindable(''),
    error,
    hint,
    id,
    rows = 5,
    class: className,
    ...rest
  }: Props = $props();

  const generated = $props.id();
  const inputId = $derived(id ?? `textarea-${generated}`);
  const messageId = $derived(`${inputId}-message`);
</script>

<div class={['field', className]}>
  <label class="label" for={inputId}>{label}</label>
  <textarea
    id={inputId}
    class={['control', { invalid: !!error }]}
    {rows}
    bind:value
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={error || hint ? messageId : undefined}
    {...rest}></textarea>
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
    padding: 10px 12px;
    border: 1px solid var(--ink-20);
    background: var(--raised);
    color: var(--ink);
    font: inherit;
    font-size: 14px;
    resize: vertical;
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
