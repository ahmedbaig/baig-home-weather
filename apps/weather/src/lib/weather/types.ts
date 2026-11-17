export interface Forecast {
  latitude: number;
  longitude: number;
  timezone: string;
  fetchedAt: string;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    precipitation: number;
    uv_index: number;
    is_day: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    precipitation_sum: number[];
    uv_index_max: number[];
    sunrise: string[];
    sunset: string[];
  };
}

export interface Place {
  name: string;
  latitude: number;
  longitude: number;
}

export type ForecastLoader = (place: Place, signal: AbortSignal) => Promise<Forecast>;

export interface DaySummary {
  date: string;
  code: number;
  max: number;
  min: number;
  rainChance: number;
}

export function days(forecast: Forecast): DaySummary[] {
  const d = forecast.daily;
  return d.time.map((date, i) => ({
    date,
    code: d.weather_code[i] ?? 0,
    max: d.temperature_2m_max[i] ?? 0,
    min: d.temperature_2m_min[i] ?? 0,
    rainChance: d.precipitation_probability_max[i] ?? 0
  }));
}
