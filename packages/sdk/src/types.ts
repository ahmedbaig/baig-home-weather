export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  features: string[];
}

export interface SessionResponse {
  user: User;
}

export interface DevLoginInput {
  email: string;
  name: string;
  roles: string[];
  features: string[];
}

export interface Page<T> {
  items: T[];
  total: number;
  take: number;
  skip: number;
}

export interface PageInfo {
  from: number;
  to: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export function pageInfo({
  total,
  take,
  skip
}: Pick<Page<unknown>, 'total' | 'take' | 'skip'>): PageInfo {
  return {
    from: total === 0 ? 0 : skip + 1,
    to: Math.min(skip + take, total),
    hasPrev: skip > 0,
    hasNext: skip + take < total
  };
}
