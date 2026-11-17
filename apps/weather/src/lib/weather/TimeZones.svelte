<script lang="ts">
  import { Button, Panel } from '@dashboard/ui';
  import { offsetLabel, zoneTime } from './time';
  import type { Zones } from './zones.svelte';

  interface Props {
    zones: Zones;
    now: number;
    home: string;
  }

  let { zones, now, home }: Props = $props();

  let picked = $state('');

  const homeOffset = $derived(zoneTime(now, home).offsetMinutes);
  const rows = $derived(
    zones.list.map((zone) => {
      const t = zoneTime(now, zone.id);
      const working = t.minutes >= 9 * 60 && t.minutes < 17 * 60;
      return {
        ...zone,
        ...t,
        diff: offsetLabel(t.offsetMinutes - homeOffset),
        working,
        position: (t.minutes / 1440) * 100
      };
    })
  );

  $effect(() => {
    if (!zones.available.some((zone) => zone.id === picked)) picked = zones.available[0]?.id ?? '';
  });

  function add(event: SubmitEvent) {
    event.preventDefault();
    if (picked) zones.add(picked);
  }
</script>

<Panel>
  <div class="head">
    <h2 class="title">Time zones</h2>
    {#if zones.available.length > 0}
      <form class="add" onsubmit={add}>
        <label class="label" for="zone-pick">Add</label>
        <select id="zone-pick" bind:value={picked}>
          {#each zones.available as zone (zone.id)}
            <option value={zone.id}>{zone.label}</option>
          {/each}
        </select>
        <Button type="submit" variant="primary">Add zone</Button>
      </form>
    {/if}
  </div>

  <ul class="zones">
    {#each rows as row (row.id)}
      <li class="zone">
        <div class="top">
          <span class="label">{row.label}</span>
          <button
            class="remove"
            type="button"
            aria-label={`Remove ${row.label}`}
            onclick={() => zones.remove(row.id)}>×</button
          >
        </div>
        <span class="time">{row.time}</span>
        <span class="meta">{row.date} · {row.diff}</span>
        <div class="bar" aria-hidden="true">
          <span class="hours"></span>
          <span class={['mark', { off: !row.working }]} style:left={`${row.position}%`}></span>
        </div>
        <span class="meta">{row.working ? 'Working hours' : 'Outside 9–5'}</span>
      </li>
    {/each}
  </ul>
</Panel>

<style>
  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
  }

  .title {
    font-size: var(--size-panel);
  }

  .add {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  select {
    min-height: var(--target-min);
    min-width: 160px;
    padding: 0 12px;
    border: 1px solid var(--ink-20);
    background: var(--raised);
    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 14px;
  }

  .zones {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1px;
    margin: 0;
    padding: 0;
    list-style: none;
    background: var(--line);
    border: 1px solid var(--line);
  }

  .zone {
    display: grid;
    gap: 8px;
    padding: 18px 20px;
    background: rgba(250, 249, 247, 0.6);
  }

  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .label {
    font-family: var(--font-mono);
    font-size: var(--size-label);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--ink-60);
  }

  .remove {
    width: 24px;
    height: 24px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--ink-60);
    font-size: 16px;
    cursor: pointer;
  }

  .remove:hover {
    color: var(--danger);
  }

  .time {
    font-family: var(--font-mono);
    font-size: 34px;
    font-weight: 600;
    letter-spacing: var(--tracking-data);
    line-height: 1.1;
  }

  .meta {
    font-family: var(--font-mono);
    font-size: var(--size-small);
    color: var(--ink-60);
  }

  .bar {
    position: relative;
    height: 4px;
    background: var(--ink-10);
  }

  .hours {
    position: absolute;
    inset: 0 auto 0 37.5%;
    width: 33.33%;
    background: var(--ink-20);
  }

  .mark {
    position: absolute;
    top: -4px;
    width: 2px;
    height: 12px;
    background: var(--accent);
  }

  .mark.off {
    background: var(--ink);
  }
</style>
