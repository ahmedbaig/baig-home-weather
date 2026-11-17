<script lang="ts">
  import { Eyebrow, Panel } from '@dashboard/ui';
  import { describe, sky } from './codes';
  import { clock, direction, round } from './format';
  import type { Forecast, Place } from './types';
  import WeatherIcon from './WeatherIcon.svelte';

  interface Props {
    forecast: Forecast;
    place: Place;
  }

  let { forecast, place }: Props = $props();

  const now = $derived(forecast.current);
  const today = $derived({
    rain: forecast.daily.precipitation_sum[0] ?? 0,
    rainChance: forecast.daily.precipitation_probability_max[0] ?? 0,
    sunrise: forecast.daily.sunrise[0],
    sunset: forecast.daily.sunset[0]
  });
</script>

<Panel class="now">
  <Eyebrow>Now · {place.name}</Eyebrow>

  <div class="hero">
    <span class="temp">{round(now.temperature_2m)}°</span>
    <div class="condition">
      <span class="label">
        <WeatherIcon sky={sky(now.weather_code)} size={22} />
        {describe(now.weather_code)}
      </span>
      <span class="sub">
        feels like {round(now.apparent_temperature)}° · humidity {now.relative_humidity_2m}%
      </span>
    </div>
  </div>

  <dl class="grid">
    <div class="cell">
      <dt>Wind</dt>
      <dd>{round(now.wind_speed_10m)} km/h<br />{direction(now.wind_direction_10m)}</dd>
    </div>
    <div class="cell">
      <dt>Rain</dt>
      <dd>{today.rain.toFixed(1)} mm · {today.rainChance}%</dd>
    </div>
    <div class="cell">
      <dt>UV</dt>
      <dd>{now.uv_index.toFixed(1)}</dd>
    </div>
    <div class="cell wide">
      <dt>Sun</dt>
      <dd>
        {today.sunrise ? clock(today.sunrise) : '—'}–{today.sunset ? clock(today.sunset) : '—'}
      </dd>
    </div>
  </dl>
</Panel>

<style>
  .hero {
    display: flex;
    align-items: center;
    gap: 24px;
    margin: 12px 0 20px;
  }

  .temp {
    font-family: var(--font-mono);
    font-size: clamp(64px, 9vw, 112px);
    font-weight: 600;
    letter-spacing: var(--tracking-data);
    line-height: 1;
  }

  .condition {
    display: grid;
    gap: 4px;
  }

  .label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-display);
    font-size: var(--size-panel);
    font-weight: 700;
  }

  .sub {
    font-size: var(--size-small);
    color: var(--ink-60);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1px;
    margin: 0;
    background: var(--line);
    border: 1px solid var(--line);
  }

  .cell {
    display: grid;
    gap: 8px;
    padding: 14px 16px;
    background: rgba(250, 249, 247, 0.6);
  }

  .wide {
    grid-column: 1 / -1;
  }

  dt {
    font-family: var(--font-mono);
    font-size: var(--size-label);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--ink-60);
  }

  dd {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 15px;
  }
</style>
