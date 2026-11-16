import { newCorrelationId, type ApiClient, type Page } from '@dashboard/sdk';

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

export type PostsQuery = {
  take: number;
  skip: number;
  q?: string;
  published?: boolean;
};

export type PostEvents = {
  'posts.created': Post;
  'posts.updated': Post;
  'posts.deleted': { id: string };
};

const path = (id?: string) => (id ? `/api/v1/posts/${encodeURIComponent(id)}` : '/api/v1/posts');

export function postsApi(client: ApiClient) {
  return {
    list: (query: PostsQuery, signal?: AbortSignal) =>
      client.get<Page<Post>>(path(), { query, signal }),
    get: (id: string) => client.get<Post>(path(id)),
    create: (input: PostInput) =>
      client.post<Post>(path(), input, { correlationId: newCorrelationId() }),
    update: (id: string, patch: Partial<PostInput>) =>
      client.patch<Post>(path(id), patch, { correlationId: newCorrelationId() }),
    remove: (id: string) => client.delete(path(id), { correlationId: newCorrelationId() })
  };
}

export type PostsApi = ReturnType<typeof postsApi>;
