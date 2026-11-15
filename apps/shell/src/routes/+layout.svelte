<script lang="ts">
  import '@dashboard/ui/styles.css';
  import { apiBase, manifestUrl } from '$lib/env';
  import Rail from '$lib/Rail.svelte';
  import { Shell, provideShell } from '$lib/shell.svelte';
  import { canDevLogin } from '@dashboard/sdk';
  import { Button, DevLogin, EmptyState, Panel, Splash } from '@dashboard/ui';
  import { onMount, type Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  const SPLASH_MIN_MS = 600;
  const devScopes = ['posts:read', 'posts:write', 'tv:watch'];
  const shell = provideShell(new Shell(apiBase, manifestUrl));
  const devLoginAllowed = canDevLogin(location.hostname);

  let ready = $state(false);

  onMount(() => {
    const minimum = new Promise((resolve) => setTimeout(resolve, SPLASH_MIN_MS));
    void Promise.all([shell.start(), minimum]).then(() => {
      ready = true;
    });
  });
</script>

<Splash visible={!ready} title="Home" accent="dashboard" status="Loading session" />

{#if ready}
  {#if shell.session.user}
    <div class="frame">
      <Rail modules={shell.modules} />
      <div class="main">
        <header class="top">
          <span class="label">{shell.session.user.name} — {shell.session.user.email}</span>
          <Button size="sm" onclick={() => shell.session.logout()}>Sign out</Button>
        </header>
        <main>{@render children()}</main>
      </div>
    </div>
  {:else if shell.session.status === 'signed-out' && devLoginAllowed}
    <div class="center">
      <DevLogin
        scopes={devScopes}
        selected={['posts:read', 'posts:write']}
        onlogin={(values) => shell.session.devLogin(values)}
      />
    </div>
  {:else}
    <div class="center">
      <Panel>
        <EmptyState
          label={shell.session.error?.code ?? '401'}
          title={shell.session.status === 'error' ? 'Could not load the session' : 'Signed out'}
          message={shell.session.error?.message ?? 'Sign in to continue.'}
        />
      </Panel>
    </div>
  {/if}
{/if}

<style>
  .frame {
    display: grid;
    grid-template-columns: 200px minmax(0, 1fr);
    min-height: 100vh;
  }

  .main {
    min-width: 0;
    padding: 20px var(--space-gutter) 64px;
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 14px;
    min-height: 32px;
    margin-bottom: 24px;
  }

  .label {
    font-family: var(--font-mono);
    font-size: var(--size-label);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--ink-60);
  }

  main {
    max-width: 1280px;
  }

  .center {
    display: grid;
    place-items: center;
    min-height: 100vh;
    padding: 16px;
  }

  @media (max-width: 760px) {
    .frame {
      grid-template-columns: minmax(0, 1fr);
    }

    .main {
      padding: 16px 16px 48px;
    }
  }
</style>
