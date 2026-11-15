<script lang="ts">
  import '@dashboard/ui/styles.css';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

{@render children()}
