import { describe, expect, it } from 'vitest';
import { filterByScope, hasScope } from './scopes';
import { pageInfo } from './types';

describe('hasScope', () => {
  it('matches exact and wildcard features', () => {
    expect(hasScope({ features: ['posts:read'] }, 'posts:read')).toBe(true);
    expect(hasScope({ features: ['posts:read'] }, 'posts:write')).toBe(false);
    expect(hasScope({ features: ['posts:*'] }, 'posts:write')).toBe(true);
    expect(hasScope(null, 'posts:read')).toBe(false);
  });

  it('filters manifest entries by the user scopes', () => {
    const entries = [
      { id: 'posts', scope: 'posts:read' },
      { id: 'tv', scope: 'tv:watch' }
    ];
    expect(filterByScope(entries, { features: ['posts:read'] }).map((e) => e.id)).toEqual([
      'posts'
    ]);
  });
});

describe('pageInfo', () => {
  it('describes the current window', () => {
    expect(pageInfo({ total: 23, take: 10, skip: 10 })).toEqual({
      from: 11,
      to: 20,
      hasPrev: true,
      hasNext: true
    });
    expect(pageInfo({ total: 0, take: 10, skip: 0 })).toEqual({
      from: 0,
      to: 0,
      hasPrev: false,
      hasNext: false
    });
  });
});
