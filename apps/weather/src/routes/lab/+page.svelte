<script lang="ts">
  import { home } from '$lib/module-info';
  import { sampleLoader } from '$lib/weather/sample';
  import WeatherView from '$lib/weather/WeatherView.svelte';
</script>

<svelte:head><title>Weather lab</title></svelte:head>

<main class="lab">
  <WeatherView load={sampleLoader} place={home} />
</main>

<style>
  .lab {
    max-width: 1280px;
    margin: 0 auto;
    padding: 32px var(--space-gutter) 64px;
  }
</style>
