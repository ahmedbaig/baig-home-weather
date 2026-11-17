<script lang="ts">
  import { createApiClient, hasScope, type ModuleContext } from '@dashboard/sdk';
  import { Button, EmptyState, Panel } from '@dashboard/ui';
  import { moduleInfo, home } from './module-info';
  import { forecastLoader } from './weather/api';
  import WeatherView from './weather/WeatherView.svelte';

  interface Props {
    ctx: ModuleContext;
  }

  let { ctx }: Props = $props();

  const canRead = $derived(hasScope(ctx.user, moduleInfo.readScope));
  const load = $derived(forecastLoader(createApiClient({ baseUrl: ctx.apiBase })));
</script>

<div class="module" data-module={moduleInfo.id} data-theme={ctx.theme}>
  {#if canRead}
    <WeatherView {load} place={home} index={moduleInfo.index} />
  {:else}
    <Panel>
      <EmptyState
        label="403 — No access"
        title="You can't see the weather"
        message={`Your session is missing the ${moduleInfo.readScope} scope. Ask an admin to add it.`}
      >
        {#snippet action()}
          <Button onclick={() => ctx.navigate('/')}>Back home</Button>
        {/snippet}
      </EmptyState>
    </Panel>
  {/if}
</div>

<style>
  .module {
    display: grid;
    gap: var(--space-gap);
    min-width: 0;
  }
</style>
