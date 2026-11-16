export const moduleInfo = {
  id: 'weather',
  title: 'Weather',
  index: 1,
  readScope: 'posts:read',
  writeScope: 'posts:write',
  topics: ['posts']
} as const;

export const devScopes = [moduleInfo.readScope, moduleInfo.writeScope];
