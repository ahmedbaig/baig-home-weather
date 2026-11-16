export const sample = {
  latitude: -33.87,
  longitude: 151.21,
  timezone: 'Australia/Sydney',
  current: {
    time: '2026-11-16T14:00',
    temperature_2m: 24.6,
    apparent_temperature: 25.9,
    relative_humidity_2m: 61,
    weather_code: 2,
    wind_speed_10m: 18.4,
    is_day: 1
  },
  daily: {
    time: ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20'],
    weather_code: [2, 61, 3, 0, 95],
    temperature_2m_max: [27.1, 22.4, 23.8, 29.5, 26.0],
    temperature_2m_min: [18.2, 17.6, 16.9, 19.4, 20.1],
    precipitation_probability_max: [10, 80, 35, 0, 70]
  }
};

export type Forecast = typeof sample;
