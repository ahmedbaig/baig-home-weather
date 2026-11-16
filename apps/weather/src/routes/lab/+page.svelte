<script lang="ts">
  import CurrentNow from '$lib/weather/CurrentNow.svelte';
</script>

<main class="lab">
  <CurrentNow />
</main>

<style>
  .lab {
    max-width: 720px;
    margin: 0 auto;
    padding: 32px var(--space-gutter);
  }
</style>
