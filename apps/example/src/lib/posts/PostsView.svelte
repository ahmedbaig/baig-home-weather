<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { EventStream, createApiClient, type ApiError } from '@dashboard/sdk';
  import {
    Badge,
    Button,
    Drawer,
    EmptyState,
    Eyebrow,
    Input,
    Panel,
    Stat,
    StatusDot,
    Table,
    Toggle,
    type Column,
    type DotStatus,
    type ToastStore
  } from '@dashboard/ui';
  import { moduleInfo } from '../module-info';
  import { postsApi, type Post, type PostEvents, type PostInput } from './api';
  import PostForm from './PostForm.svelte';
  import { PostsList } from './posts.svelte';

  interface Props {
    apiBase: string;
    canWrite: boolean;
    toaster: ToastStore;
  }

  let { apiBase, canWrite, toaster }: Props = $props();

  const list = new PostsList(
    postsApi(createApiClient({ baseUrl: untrack(() => apiBase) })),
    (error: ApiError) => toaster.error(error)
  );

  let stream = $state<EventStream<PostEvents> | null>(null);
  let received = $state(0);
  let drawerOpen = $state(false);
  let search = $state('');
  let searchTimer: ReturnType<typeof setTimeout> | undefined;

  const columns: Column[] = [
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status', width: '110px' },
    { key: 'views', label: 'Views', align: 'right', width: '90px' },
    { key: 'created', label: 'Created', width: '190px' },
    { key: 'published', label: 'Published', width: '110px' },
    { key: 'actions', label: '', align: 'right', width: '110px' }
  ];

  const liveStatus = $derived<DotStatus>(
    stream?.status === 'open' ? 'live' : stream?.status === 'closed' ? 'down' : 'pending'
  );
  const liveLabel = $derived(
    stream?.status === 'open' ? 'Live' : stream?.status === 'closed' ? 'Offline' : 'Connecting'
  );
  const publishedOnPage = $derived(list.items.filter((post) => post.published).length);
  const viewsOnPage = $derived(list.items.reduce((sum, post) => sum + post.views, 0));

  const dateFormat = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  function connect(baseUrl: string) {
    const events = new EventStream<PostEvents>({ baseUrl, topics: [...moduleInfo.topics] });
    const refresh = () => {
      received += 1;
      void list.load();
    };
    events.on('posts.created', refresh);
    events.on('posts.updated', refresh);
    events.on('posts.deleted', refresh);
    stream = events;
    return () => events.close();
  }

  onMount(() => {
    void list.load();
    return () => clearTimeout(searchTimer);
  });

  $effect(() => {
    const baseUrl = apiBase;
    return untrack(() => connect(baseUrl));
  });

  function onsearch(event: Event & { currentTarget: HTMLInputElement }) {
    const value = event.currentTarget.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => void list.search(value), 250);
  }

  async function create(input: PostInput) {
    const errors = await list.create(input);
    if (errors === null) {
      drawerOpen = false;
      toaster.success('Post created', input.title);
    }
    return errors;
  }

  async function remove(post: Post) {
    if (await list.remove(post)) toaster.success('Post deleted', post.title);
  }
</script>

<div class="view">
  <header class="head">
    <div class="titles">
      <Eyebrow index={moduleInfo.index}>{moduleInfo.title}</Eyebrow>
      <h1>Posts <em>board</em></h1>
    </div>
    <div class="head-actions">
      <span data-testid="live-status"><StatusDot status={liveStatus} label={liveLabel} /></span>
      {#if canWrite}
        <Button variant="primary" onclick={() => (drawerOpen = true)}>New post</Button>
      {/if}
    </div>
  </header>

  <div class="tiles">
    <Stat label="Total posts" value={list.total} />
    <Stat label="Published on page" value={publishedOnPage} />
    <Stat label="Views on page" value={viewsOnPage} />
    <Stat label="Live events" value={received} tone={received > 0 ? 'accent' : 'ink'} />
  </div>

  <Panel padded={false}>
    <div class="toolbar">
      <Input
        label="Search posts"
        hideLabel
        type="search"
        placeholder="Search posts"
        bind:value={search}
        oninput={onsearch}
      />
      <div class="pager">
        <span class="range" data-testid="range">
          {list.info.from}–{list.info.to} of {list.total}
        </span>
        <Button size="sm" disabled={!list.info.hasPrev} onclick={() => list.previous()}>Prev</Button
        >
        <Button size="sm" disabled={!list.info.hasNext} onclick={() => list.next()}>Next</Button>
      </div>
    </div>

    <Table {columns} rows={list.items} rowKey={(post) => post.id} caption="Posts">
      {#snippet row(post)}
        <td>
          <span class="post-title">{post.title}</span>
          {#if post.body}<span class="post-body">{post.body}</span>{/if}
        </td>
        <td>
          <Badge tone={post.published ? 'accent' : 'neutral'}>
            {post.published ? 'Published' : 'Draft'}
          </Badge>
        </td>
        <td class="num">{post.views}</td>
        <td class="mono">{dateFormat.format(new Date(post.createdAt))}</td>
        <td>
          <Toggle
            label={`Published: ${post.title}`}
            hideLabel
            checked={post.published}
            disabled={!canWrite}
            onchange={(value) => list.setPublished(post, value)}
          />
        </td>
        <td class="actions">
          {#if canWrite}
            <Button
              size="sm"
              variant="danger"
              aria-label={`Delete ${post.title}`}
              onclick={() => remove(post)}>Delete</Button
            >
          {/if}
        </td>
      {/snippet}
      {#snippet empty()}
        <EmptyState
          label={list.loaded ? 'No results' : 'Loading'}
          title={list.loaded ? 'No posts yet' : 'Loading posts'}
          message={list.query ? `Nothing matches "${list.query}".` : undefined}
        />
      {/snippet}
    </Table>
  </Panel>
</div>

{#if canWrite}
  <Drawer bind:open={drawerOpen} title="New post" eyebrow="01 — Create">
    <PostForm onsubmit={create} oncancel={() => (drawerOpen = false)} />
  </Drawer>
{/if}

<style>
  .view {
    display: grid;
    gap: var(--space-gap);
  }

  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--line);
  }

  .titles {
    display: grid;
    gap: 10px;
  }

  h1 {
    font-size: var(--size-title);
  }

  .head-actions {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .tiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1px;
    background: var(--ink-10);
    border: 1px solid var(--glass-border);
    outline: 1px solid var(--glass-outline);
    -webkit-backdrop-filter: blur(24px) saturate(170%);
    backdrop-filter: blur(24px) saturate(170%);
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid var(--line);
  }

  .toolbar :global(.field) {
    flex: 1 1 260px;
    max-width: 420px;
  }

  .pager {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .range {
    margin-right: 6px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-60);
  }

  .post-title {
    display: block;
    font-weight: 600;
  }

  .post-body {
    display: block;
    max-width: 52ch;
    overflow: hidden;
    font-size: 12px;
    color: var(--ink-60);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .num,
  .mono {
    font-family: var(--font-mono);
    font-size: 12px;
    white-space: nowrap;
  }

  .num,
  .actions {
    text-align: right;
  }

  @media (max-width: 640px) {
    h1 {
      font-size: 40px;
    }
  }
</style>
