export function uuidv7(now: number = Date.now()): string {
  const time = now.toString(16).padStart(12, '0').slice(-12);
  const random = Array.from(crypto.getRandomValues(new Uint8Array(10)), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
  const version = `7${random.slice(1, 4)}`;
  const variant = `${((parseInt(random.slice(4, 5), 16) & 0x3) | 0x8).toString(16)}${random.slice(5, 8)}`;
  return `${time.slice(0, 8)}-${time.slice(8, 12)}-${version}-${variant}-${random.slice(8, 20)}`;
}

export const pageCorrelationId = uuidv7();

export const newCorrelationId = (): string => uuidv7();
