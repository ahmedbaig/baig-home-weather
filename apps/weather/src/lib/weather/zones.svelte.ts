export interface Zone {
  id: string;
  label: string;
}

export const zoneChoices: Zone[] = [
  { id: 'Australia/Sydney', label: 'Sydney' },
  { id: 'Australia/Perth', label: 'Perth' },
  { id: 'Pacific/Auckland', label: 'Auckland' },
  { id: 'Asia/Tokyo', label: 'Tokyo' },
  { id: 'Asia/Singapore', label: 'Singapore' },
  { id: 'Asia/Kolkata', label: 'Mumbai' },
  { id: 'Asia/Karachi', label: 'Karachi' },
  { id: 'Asia/Dubai', label: 'Dubai' },
  { id: 'Europe/London', label: 'London' },
  { id: 'Europe/Berlin', label: 'Berlin' },
  { id: 'America/New_York', label: 'New York' },
  { id: 'America/Los_Angeles', label: 'Los Angeles' },
  { id: 'UTC', label: 'UTC' }
];

const KEY = 'weather.zones';
const defaults = ['Australia/Sydney', 'Pacific/Auckland', 'Europe/London', 'UTC'];

function read(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (Array.isArray(value) && value.every((id) => typeof id === 'string')) return value;
  } catch {
    return defaults;
  }
  return defaults;
}

function write(ids: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    return;
  }
}

export class Zones {
  ids = $state<string[]>(read());
  readonly list = $derived(
    this.ids.map((id) => zoneChoices.find((zone) => zone.id === id) ?? { id, label: id })
  );
  readonly available = $derived(zoneChoices.filter((zone) => !this.ids.includes(zone.id)));

  add(id: string): void {
    if (this.ids.includes(id)) return;
    this.ids = [...this.ids, id];
    write(this.ids);
  }

  remove(id: string): void {
    this.ids = this.ids.filter((item) => item !== id);
    write(this.ids);
  }
}
