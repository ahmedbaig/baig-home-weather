<script lang="ts" module>
  export interface Column {
    key: string;
    label: string;
    align?: 'left' | 'right' | 'center';
    width?: string;
  }
</script>

<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';

  interface Props {
    columns: Column[];
    rows: T[];
    rowKey: (row: T) => string;
    row: Snippet<[T]>;
    empty?: Snippet;
    caption?: string;
  }

  let { columns, rows, rowKey, row, empty, caption }: Props = $props();
</script>

<div class="scroll">
  <table>
    {#if caption}<caption class="sr-only">{caption}</caption>{/if}
    <thead>
      <tr>
        {#each columns as column (column.key)}
          <th style:text-align={column.align ?? 'left'} style:width={column.width}>
            {column.label}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as item (rowKey(item))}
        <tr>{@render row(item)}</tr>
      {:else}
        {#if empty}
          <tr><td class="empty" colspan={columns.length}>{@render empty()}</td></tr>
        {/if}
      {/each}
    </tbody>
  </table>
</div>

<style>
  .scroll {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--size-small);
  }

  th {
    padding: 10px 14px;
    border-bottom: 1px solid var(--line);
    font-family: var(--font-mono);
    font-size: var(--size-label);
    font-weight: 500;
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--ink-60);
    white-space: nowrap;
  }

  tbody :global(td) {
    padding: 11px 14px;
    border-bottom: 1px solid var(--line-soft);
    vertical-align: middle;
  }

  tbody tr:hover :global(td) {
    background: var(--ink-05);
  }

  .empty {
    padding: 0;
  }
</style>
