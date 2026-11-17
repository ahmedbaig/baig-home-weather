export type Sky = 'clear' | 'partly' | 'cloud' | 'fog' | 'rain' | 'storm';

const table: Record<number, [string, Sky]> = {
  0: ['Clear', 'clear'],
  1: ['Mostly clear', 'partly'],
  2: ['Partly cloudy', 'partly'],
  3: ['Overcast', 'cloud'],
  45: ['Fog', 'fog'],
  48: ['Fog', 'fog'],
  51: ['Light drizzle', 'rain'],
  53: ['Drizzle', 'rain'],
  55: ['Heavy drizzle', 'rain'],
  61: ['Light rain', 'rain'],
  63: ['Rain', 'rain'],
  65: ['Heavy rain', 'rain'],
  80: ['Showers', 'rain'],
  81: ['Showers', 'rain'],
  82: ['Heavy showers', 'rain'],
  95: ['Thunderstorm', 'storm'],
  96: ['Thunderstorm, hail', 'storm'],
  99: ['Thunderstorm, hail', 'storm']
};

export function describe(code: number): string {
  return table[code]?.[0] ?? `Code ${code}`;
}

export function sky(code: number): Sky {
  return table[code]?.[1] ?? 'cloud';
}
