import type { User } from './types';

export function hasScope(user: Pick<User, 'features'> | null | undefined, scope: string): boolean {
  if (!user) return false;
  if (user.features.includes(scope)) return true;
  const [area] = scope.split(':');
  return user.features.includes(`${area}:*`) || user.features.includes('*');
}

export function filterByScope<T extends { scope: string }>(
  entries: T[],
  user: Pick<User, 'features'> | null | undefined
): T[] {
  return entries.filter((entry) => hasScope(user, entry.scope));
}
