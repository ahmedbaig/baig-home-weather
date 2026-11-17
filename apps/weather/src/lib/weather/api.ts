import type { ApiClient } from '@dashboard/sdk';
import type { ForecastLoader } from './types';

export function forecastLoader(client: ApiClient): ForecastLoader {
  return (place, signal) =>
    client.get('/api/v1/weather/forecast', {
      query: { lat: place.latitude, lon: place.longitude },
      signal
    });
}
