<script lang="ts">
  import { goto } from '$app/navigation';
  import { apiBase } from '$lib/env';
  import { devScopes, moduleInfo } from '$lib/module-info';
  import WeatherModule from '$lib/WeatherModule.svelte';
  import { Session, canDevLogin, createApiClient, type ModuleContext } from '@dashboard/sdk';
  import { Button, DevLogin, EmptyState, Panel, Splash } from '@dashboard/ui';
  import { onMount } from 'svelte';

  const session = new Session(createApiClient({ baseUrl: apiBase }));
  const devLoginAllowed = canDevLogin(location.hostname);

  const ctx = $derived<ModuleContext | null>(
    session.user
      ? {
          apiBase,
          user: session.user,
          navigate: (path) => void goto(path),
          theme: 'light'
        }
      : null
  );

  onMount(() => {
    void session.load();
  });
</script>

<svelte:head><title>{moduleInfo.title}</title></svelte:head>

<Splash visible={session.status === 'loading'} title={moduleInfo.title} accent="module" />

<div class="page">
  <div class="bar">
    <span class="label">Standalone — {moduleInfo.id}</span>
    {#if session.user}
      <span class="who">
        <span class="label">{session.user.email}</span>
        <Button size="sm" onclick={() => session.logout()}>Sign out</Button>
      </span>
    {/if}
  </div>

  {#if ctx}
    <WeatherModule {ctx} />
  {:else if session.status === 'signed-out' && devLoginAllowed}
    <div class="center">
      <DevLogin scopes={devScopes} onlogin={(values) => session.devLogin(values)} />
    </div>
  {:else if session.status === 'signed-out'}
    <Panel>
      <EmptyState label="401" title="Signed out" message="Sign in through the dashboard." />
    </Panel>
  {:else if session.status === 'error'}
    <Panel>
      <EmptyState
        label={session.error?.code}
        title="Could not load the session"
        message={session.error?.message}
      />
    </Panel>
  {/if}
</div>

<style>
  .page {
    display: grid;
    gap: var(--space-gap);
    max-width: 1280px;
    margin: 0 auto;
    padding: 24px var(--space-gutter) 64px;
  }

  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 32px;
  }

  .who {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .label {
    font-family: var(--font-mono);
    font-size: var(--size-label);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--ink-60);
  }

  .center {
    display: grid;
    place-items: center;
    padding-top: 8vh;
  }

  @media (max-width: 640px) {
    .page {
      padding: 16px 16px 48px;
    }
  }
</style>
