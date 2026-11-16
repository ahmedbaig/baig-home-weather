<script lang="ts">
  import { Button, Input, Textarea, Toggle } from '@dashboard/ui';
  import type { PostInput } from './api';
  import type { FieldErrors } from './posts.svelte';

  interface Props {
    onsubmit: (input: PostInput) => Promise<FieldErrors | null>;
    oncancel: () => void;
  }

  let { onsubmit, oncancel }: Props = $props();

  let title = $state('');
  let body = $state('');
  let published = $state(false);
  let errors = $state<FieldErrors>({});
  let saving = $state(false);

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    saving = true;
    const result = await onsubmit({ title, body, published });
    saving = false;
    errors = result ?? {};
    if (result === null) {
      title = '';
      body = '';
      published = false;
    }
  }
</script>

<form class="form" novalidate onsubmit={submit} aria-label="New post">
  <Input label="Title" name="title" bind:value={title} error={errors.title} autocomplete="off" />
  <Textarea label="Body" name="body" bind:value={body} error={errors.body} rows={6} />
  <Toggle label="Published" bind:checked={published} />
  <div class="actions">
    <Button onclick={oncancel}>Cancel</Button>
    <Button variant="primary" type="submit" disabled={saving}>
      {saving ? 'Saving' : 'Create post'}
    </Button>
  </div>
</form>

<style>
  .form {
    display: grid;
    gap: 18px;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 8px;
  }
</style>
