import type { Place } from './weather/types';

export const moduleInfo = {
  id: 'weather',
  title: 'Weather',
  index: 2,
  readScope: 'weather:read',
  topics: ['weather']
} as const;

export const home: Place = { name: 'Sydney', latitude: -33.87, longitude: 151.21 };

export const devScopes = [moduleInfo.readScope];
