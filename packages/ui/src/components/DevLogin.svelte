<script lang="ts" module>
  export interface DevLoginValues {
    email: string;
    name: string;
    roles: string[];
    features: string[];
  }
</script>

<script lang="ts">
  import Button from './Button.svelte';
  import Eyebrow from './Eyebrow.svelte';
  import Input from './Input.svelte';
  import Panel from './Panel.svelte';

  interface Props {
    scopes: string[];
    selected?: string[];
    busy?: boolean;
    onlogin: (values: DevLoginValues) => void;
  }

  let { scopes, selected = scopes, busy = false, onlogin }: Props = $props();

  let name = $state('Dev User');
  let email = $state('dev@example.test');
  const initialFeatures = () => [...selected];
  let features = $state<string[]>(initialFeatures());

  function submit(event: SubmitEvent) {
    event.preventDefault();
    onlogin({ email, name, roles: ['member'], features });
  }
</script>

<Panel class="dev-login">
  <form onsubmit={submit}>
    <Eyebrow index="00">Dev login</Eyebrow>
    <h2>Sign <em>in</em></h2>
    <p class="note">Local only. Pick the scopes the session should carry.</p>
    <Input label="Name" bind:value={name} autocomplete="name" />
    <Input label="Email" type="email" bind:value={email} autocomplete="email" />
    <fieldset>
      <legend>Scopes</legend>
      {#each scopes as scope (scope)}
        <label class="scope">
          <input type="checkbox" value={scope} bind:group={features} />
          <span>{scope}</span>
        </label>
      {/each}
    </fieldset>
    <Button variant="primary" type="submit" disabled={busy}>Sign in</Button>
  </form>
</Panel>

<style>
  :global(.dev-login) {
    width: min(420px, 100%);
  }

  form {
    display: grid;
    gap: 16px;
  }

  h2 {
    font-size: var(--size-section);
  }

  .note {
    margin: 0;
    font-size: var(--size-small);
    color: var(--ink-60);
  }

  fieldset {
    display: grid;
    gap: 8px;
    margin: 0;
    padding: 0;
    border: 0;
  }

  legend {
    margin-bottom: 8px;
    font-family: var(--font-mono);
    font-size: var(--size-label);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--ink-60);
  }

  .scope {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono);
    font-size: 13px;
  }

  .scope input {
    width: 16px;
    height: 16px;
    margin: 0;
    accent-color: var(--accent);
  }
</style>
