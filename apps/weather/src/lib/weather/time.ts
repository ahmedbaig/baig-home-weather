export interface ZoneTime {
  time: string;
  date: string;
  minutes: number;
  offsetMinutes: number;
}

export function zoneTime(nowMs: number, timezone: string): ZoneTime {
  const now = new Date(nowMs);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-AU', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value])
  );
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    hour,
    minute
  );
  const offsetMinutes = Math.round((asUtc - Math.floor(now.getTime() / 60_000) * 60_000) / 60_000);
  return {
    time: `${parts.hour}:${parts.minute}`,
    date: now.toLocaleDateString('en-AU', {
      timeZone: timezone,
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }),
    minutes: hour * 60 + minute,
    offsetMinutes
  };
}

export function offsetLabel(diffMinutes: number): string {
  if (diffMinutes === 0) return 'home';
  const sign = diffMinutes > 0 ? '+' : '−';
  const hours = Math.abs(diffMinutes) / 60;
  return `${sign}${Number.isInteger(hours) ? hours : hours.toFixed(1)} h`;
}
