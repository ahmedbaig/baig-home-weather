<script lang="ts">
  import { describe, sky } from './codes';
  import { dayLabel, round } from './format';
  import type { DaySummary } from './types';
  import WeatherIcon from './WeatherIcon.svelte';

  interface Props {
    days: DaySummary[];
  }

  let { days }: Props = $props();
</script>

<ol class="strip" aria-label="7 day forecast">
  {#each days as day (day.date)}
    {@const label = dayLabel(day.date)}
    <li class="day">
      <span class="eyebrow">{label.weekday} {label.day}</span>
      <WeatherIcon sky={sky(day.code)} label={describe(day.code)} />
      <span class="temps">
        <span>{round(day.max)}°</span>
        <span class="min">{round(day.min)}°</span>
      </span>
      <span class="rain">rain {day.rainChance}%</span>
    </li>
  {/each}
</ol>

<style>
  .strip {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 1px;
    margin: 0;
    padding: 0;
    list-style: none;
    background: var(--line);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
  }

  .day {
    display: grid;
    gap: 10px;
    padding: 18px 20px;
    background: var(--glass-bg);
    -webkit-backdrop-filter: var(--glass-filter);
    backdrop-filter: var(--glass-filter);
  }

  .eyebrow,
  .rain {
    font-family: var(--font-mono);
    font-size: var(--size-label);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--ink-60);
  }

  .temps {
    display: flex;
    gap: 10px;
    font-family: var(--font-mono);
    font-size: 16px;
  }

  .min {
    color: var(--ink-40);
  }

  @media (max-width: 900px) {
    .strip {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
  }
</style>
