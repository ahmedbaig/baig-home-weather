const compass = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export function direction(degrees: number): string {
  return compass[Math.round((((degrees % 360) + 360) % 360) / 45) % 8] ?? 'N';
}

export function round(value: number): string {
  return String(Math.round(value));
}

export function clock(localIso: string): string {
  return localIso.slice(11, 16);
}

export function dayLabel(date: string): { weekday: string; day: string } {
  const parsed = new Date(`${date}T12:00:00Z`);
  return {
    weekday: parsed.toLocaleDateString('en-AU', { weekday: 'short', timeZone: 'UTC' }),
    day: String(parsed.getUTCDate())
  };
}

export function timeIn(iso: string, timezone: string): string {
  return new Date(iso).toLocaleTimeString('en-AU', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  });
}
