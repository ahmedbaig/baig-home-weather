import { randomUUID } from 'node:crypto';
import { errors, type FieldError } from './http.ts';

export interface Post {
  id: string;
  authorId: string;
  title: string;
  body: string;
  views: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostInput {
  title: string;
  body: string;
  published: boolean;
}

export interface ListQuery {
  take: number;
  skip: number;
  published?: boolean;
  q?: string;
}

const seedTitles = [
  'Welcome to the dashboard',
  'How modules are mounted',
  'Scopes decide what you see',
  'Live updates over SSE',
  'Error envelopes in practice',
  'Paper glass design notes',
  'Pagination with take and skip',
  'Request and correlation ids',
  'Running without a backend',
  'Adding a new module',
  'Square corners everywhere',
  'Status dots are the only circles'
];

export function validate(input: Record<string, unknown>, partial: boolean): Partial<PostInput> {
  const fields: FieldError[] = [];
  const result: Partial<PostInput> = {};

  if (!partial || 'title' in input) {
    const title = typeof input.title === 'string' ? input.title.trim() : '';
    if (!title) fields.push({ field: 'title', rule: 'required', message: 'Title is required' });
    else if (title.length < 3)
      fields.push({ field: 'title', rule: 'min', message: 'Title must be at least 3 characters' });
    else if (title.length > 120)
      fields.push({ field: 'title', rule: 'max', message: 'Title must be at most 120 characters' });
    else result.title = title;
  }

  if (!partial || 'body' in input) {
    const body = input.body ?? '';
    if (typeof body !== 'string')
      fields.push({ field: 'body', rule: 'type', message: 'Body must be text' });
    else if (body.length > 5000)
      fields.push({ field: 'body', rule: 'max', message: 'Body must be at most 5000 characters' });
    else result.body = body;
  }

  if (!partial || 'published' in input) {
    const published = input.published ?? false;
    if (typeof published !== 'boolean')
      fields.push({ field: 'published', rule: 'type', message: 'Published must be true or false' });
    else result.published = published;
  }

  if (fields.length > 0) throw errors.validation(fields);
  return result;
}

export function createPostStore(now: () => Date = () => new Date()) {
  const posts = new Map<string, Post>();

  const start = now().getTime();
  seedTitles.forEach((title, index) => {
    const at = new Date(start - (seedTitles.length - index) * 3_600_000).toISOString();
    const post: Post = {
      id: randomUUID(),
      authorId: 'seed',
      title,
      body: `${title}. Sample content for the example module.`,
      views: (index * 37) % 400,
      published: index % 3 !== 0,
      createdAt: at,
      updatedAt: at
    };
    posts.set(post.id, post);
  });

  function find(id: string): Post {
    const post = posts.get(id);
    if (!post) throw errors.notFound('Post');
    return post;
  }

  return {
    list({ take, skip, published, q }: ListQuery) {
      const needle = q?.trim().toLowerCase();
      const matches = [...posts.values()]
        .filter((post) => published === undefined || post.published === published)
        .filter(
          (post) =>
            !needle ||
            post.title.toLowerCase().includes(needle) ||
            post.body.toLowerCase().includes(needle)
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return { items: matches.slice(skip, skip + take), total: matches.length, take, skip };
    },
    get(id: string): Post {
      const post = find(id);
      post.views += 1;
      return post;
    },
    create(authorId: string, input: PostInput): Post {
      const at = now().toISOString();
      const post: Post = {
        id: randomUUID(),
        authorId,
        views: 0,
        createdAt: at,
        updatedAt: at,
        ...input
      };
      posts.set(post.id, post);
      return post;
    },
    update(id: string, input: Partial<PostInput>): Post {
      const post = { ...find(id), ...input, updatedAt: now().toISOString() };
      posts.set(id, post);
      return post;
    },
    remove(id: string): void {
      find(id);
      posts.delete(id);
    }
  };
}

export type PostStore = ReturnType<typeof createPostStore>;
