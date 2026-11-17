<script lang="ts">
  import { Button, EmptyState, Eyebrow, Panel } from '@dashboard/ui';
  import { untrack } from 'svelte';
  import { Clock } from './clock.svelte';
  import { ForecastStore } from './forecast.svelte';
  import ForecastStrip from './ForecastStrip.svelte';
  import { timeIn } from './format';
  import NowCard from './NowCard.svelte';
  import RadarPanel from './RadarPanel.svelte';
  import TimeZones from './TimeZones.svelte';
  import { days, type ForecastLoader, type Place } from './types';
  import { Zones } from './zones.svelte';

  interface Props {
    load: ForecastLoader;
    place: Place;
    index?: number;
    refreshMs?: number;
  }

  let { load, place, index = 2, refreshMs = 15 * 60_000 }: Props = $props();

  const store = new ForecastStore(
    untrack(() => load),
    untrack(() => place)
  );
  const clock = new Clock();
  const zones = new Zones();

  const forecast = $derived(store.data);
  const home = $derived(forecast?.timezone ?? 'Australia/Sydney');

  $effect(() => clock.start());

  $effect(() => {
    void store.refresh();
    const timer = setInterval(() => void store.refresh(), refreshMs);
    return () => {
      clearInterval(timer);
      store.stop();
    };
  });
</script>

<div class="view">
  <header class="header">
    <div>
      <Eyebrow {index}>{place.name} · Open-Meteo</Eyebrow>
      <h1 class="title">Sky &amp; <em>time</em></h1>
    </div>
    {#if forecast}
      <span class="refreshed">forecast refreshed {timeIn(forecast.fetchedAt, home)}</span>
    {/if}
  </header>

  {#if forecast}
    <div class="top">
      <NowCard {forecast} {place} />
      <RadarPanel />
    </div>
    <ForecastStrip days={days(forecast)} />
  {:else if store.status === 'error'}
    <Panel>
      <EmptyState
        label={store.error?.code}
        title="Could not load the forecast"
        message={store.error?.message}
      >
        {#snippet action()}
          <Button onclick={() => store.refresh()}>Try again</Button>
        {/snippet}
      </EmptyState>
    </Panel>
  {:else}
    <Panel>
      <EmptyState label="Loading" title="Fetching the forecast" />
    </Panel>
  {/if}

  <TimeZones {zones} now={clock.now} {home} />
</div>

<style>
  .view {
    display: grid;
    gap: var(--space-gap);
    min-width: 0;
  }

  .header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--line);
  }

  .title {
    margin-top: 8px;
    font-size: var(--size-hero);
  }

  .refreshed {
    font-family: var(--font-mono);
    font-size: var(--size-small);
    color: var(--ink-60);
  }

  .top {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    gap: var(--space-gap);
  }

  @media (max-width: 900px) {
    .top {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
