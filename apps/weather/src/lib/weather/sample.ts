import type { Forecast, ForecastLoader } from './types';

export const sample: Forecast = {
  latitude: -33.87,
  longitude: 151.21,
  timezone: 'Australia/Sydney',
  fetchedAt: '2026-11-16T03:00:00Z',
  current: {
    time: '2026-11-16T14:00',
    temperature_2m: 24.6,
    apparent_temperature: 25.9,
    relative_humidity_2m: 61,
    weather_code: 2,
    wind_speed_10m: 18.4,
    wind_direction_10m: 45,
    precipitation: 0,
    uv_index: 8.2,
    is_day: 1
  },
  daily: {
    time: [
      '2026-11-16',
      '2026-11-17',
      '2026-11-18',
      '2026-11-19',
      '2026-11-20',
      '2026-11-21',
      '2026-11-22'
    ],
    weather_code: [2, 61, 3, 0, 95, 1, 80],
    temperature_2m_max: [27.1, 22.4, 23.8, 29.5, 26.0, 28.3, 24.1],
    temperature_2m_min: [18.2, 17.6, 16.9, 19.4, 20.1, 18.8, 17.3],
    precipitation_probability_max: [10, 80, 35, 0, 70, 5, 60],
    precipitation_sum: [0, 9.2, 0.4, 0, 12.5, 0, 4.1],
    uv_index_max: [10, 5, 7, 11, 6, 11, 6],
    sunrise: [
      '2026-11-16T05:41',
      '2026-11-17T05:40',
      '2026-11-18T05:40',
      '2026-11-19T05:39',
      '2026-11-20T05:39',
      '2026-11-21T05:38',
      '2026-11-22T05:38'
    ],
    sunset: [
      '2026-11-16T19:43',
      '2026-11-17T19:44',
      '2026-11-18T19:45',
      '2026-11-19T19:46',
      '2026-11-20T19:47',
      '2026-11-21T19:48',
      '2026-11-22T19:48'
    ]
  }
};

export const sampleLoader: ForecastLoader = async () => ({
  ...sample,
  fetchedAt: new Date().toISOString()
});
