export class Clock {
  now = $state(Date.now());

  start(everyMs = 1000): () => void {
    const timer = setInterval(() => (this.now = Date.now()), everyMs);
    return () => clearInterval(timer);
  }
}
