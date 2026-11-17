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

const codes = [0, 1, 2, 3, 61, 63, 80, 95, 2, 1];

function wave(seed: number, spread: number): number {
  return Math.round(Math.sin(seed * 12.9898) * spread * 10) / 10;
}

function localParts(date: Date, timezone: string): { day: string; time: string; hour: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value])
  );
  const day = `${parts.year}-${parts.month}-${parts.day}`;
  return { day, time: `${day}T${parts.hour}:00`, hour: Number(parts.hour) };
}

export function mockForecast(
  latitude: number,
  longitude: number,
  timezone = 'Australia/Sydney',
  now = new Date()
): Forecast {
  const { day: today, time, hour } = localParts(now, timezone);
  const start = Date.parse(`${today}T12:00:00Z`);
  const days = Array.from({ length: 7 }, (_, i) => new Date(start + i * 86_400_000));
  const daySeed = (i: number) => Math.floor(start / 86_400_000) + i;
  const weather = days.map((_, i) => codes[Math.abs(daySeed(i)) % codes.length] ?? 0);
  const max = days.map((_, i) => Math.round((25 + wave(daySeed(i), 4)) * 10) / 10);
  const min = days.map((_, i) => Math.round((17 + wave(daySeed(i) + 7, 2.5)) * 10) / 10);
  const rainChance = weather.map((code) => (code >= 61 ? 60 + (code % 30) : code === 3 ? 25 : 5));
  const dayMax = max[0] ?? 25;
  const dayMin = min[0] ?? 17;
  const curve = Math.max(0, Math.sin(((hour - 6) / 24) * 2 * Math.PI));
  const temperature = Math.round((dayMin + (dayMax - dayMin) * curve) * 10) / 10;

  return {
    latitude,
    longitude,
    timezone,
    fetchedAt: now.toISOString(),
    current: {
      time,
      temperature_2m: temperature,
      apparent_temperature: Math.round((temperature + 1.2) * 10) / 10,
      relative_humidity_2m: 55 + Math.round(wave(daySeed(0) + 3, 15)),
      weather_code: weather[0] ?? 0,
      wind_speed_10m: Math.round((14 + wave(daySeed(0) + 5, 8)) * 10) / 10,
      wind_direction_10m: (Math.abs(daySeed(0)) * 47) % 360,
      precipitation: (weather[0] ?? 0) >= 61 ? 1.4 : 0,
      uv_index: hour >= 7 && hour <= 18 ? Math.round(10 * curve * 10) / 10 : 0,
      is_day: hour >= 6 && hour < 20 ? 1 : 0
    },
    daily: {
      time: days.map((date) => date.toISOString().slice(0, 10)),
      weather_code: weather,
      temperature_2m_max: max,
      temperature_2m_min: min,
      precipitation_probability_max: rainChance,
      precipitation_sum: rainChance.map((chance) => (chance >= 60 ? Math.round(chance / 8) : 0)),
      uv_index_max: weather.map((code) => (code >= 61 ? 5 : 10)),
      sunrise: days.map((date) => `${date.toISOString().slice(0, 10)}T05:41`),
      sunset: days.map((date) => `${date.toISOString().slice(0, 10)}T19:43`)
    }
  };
}
