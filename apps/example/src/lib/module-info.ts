export const moduleInfo = {
  id: 'posts',
  title: 'Posts',
  index: 1,
  readScope: 'posts:read',
  writeScope: 'posts:write',
  topics: ['posts']
} as const;

export const devScopes = [moduleInfo.readScope, moduleInfo.writeScope];
