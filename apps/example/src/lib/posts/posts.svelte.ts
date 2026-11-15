import { ApiError, pageInfo } from '@dashboard/sdk';
import type { Post, PostInput, PostsApi } from './api';

export type FieldErrors = Record<string, string>;

export class PostsList {
  items = $state<Post[]>([]);
  total = $state(0);
  take = $state(10);
  skip = $state(0);
  query = $state('');
  loading = $state(false);
  loaded = $state(false);
  readonly info = $derived(pageInfo({ total: this.total, take: this.take, skip: this.skip }));

  readonly #api: PostsApi;
  readonly #onError: (error: ApiError) => void;
  #controller: AbortController | null = null;

  constructor(api: PostsApi, onError: (error: ApiError) => void) {
    this.#api = api;
    this.#onError = onError;
  }

  async load(): Promise<void> {
    this.#controller?.abort();
    const controller = new AbortController();
    this.#controller = controller;
    this.loading = true;
    try {
      const page = await this.#api.list(
        { take: this.take, skip: this.skip, q: this.query },
        controller.signal
      );
      if (page.items.length === 0 && page.total > 0 && this.skip > 0) {
        this.skip = Math.max(0, this.skip - this.take);
        return this.load();
      }
      this.items = page.items;
      this.total = page.total;
      this.loaded = true;
    } catch (error) {
      if (!controller.signal.aborted) this.#report(error);
    } finally {
      if (this.#controller === controller) this.loading = false;
    }
  }

  search(query: string): Promise<void> {
    this.query = query;
    this.skip = 0;
    return this.load();
  }

  next(): Promise<void> {
    this.skip += this.take;
    return this.load();
  }

  previous(): Promise<void> {
    this.skip = Math.max(0, this.skip - this.take);
    return this.load();
  }

  async create(input: PostInput): Promise<FieldErrors | null> {
    try {
      await this.#api.create(input);
      this.skip = 0;
      await this.load();
      return null;
    } catch (error) {
      this.#report(error);
      return error instanceof ApiError ? error.fieldErrors() : {};
    }
  }

  async setPublished(post: Post, published: boolean): Promise<void> {
    this.#replace({ ...post, published });
    try {
      this.#replace(await this.#api.update(post.id, { published }));
    } catch (error) {
      this.#replace(post);
      this.#report(error);
    }
  }

  async remove(post: Post): Promise<boolean> {
    try {
      await this.#api.remove(post.id);
      await this.load();
      return true;
    } catch (error) {
      this.#report(error);
      return false;
    }
  }

  #replace(post: Post): void {
    this.items = this.items.map((item) => (item.id === post.id ? post : item));
  }

  #report(error: unknown): void {
    if (error instanceof ApiError) this.#onError(error);
    else throw error;
  }
}
