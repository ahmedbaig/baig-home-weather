import { ApiError } from '@dashboard/sdk';
import type { Forecast, ForecastLoader, Place } from './types';

export type ForecastStatus = 'idle' | 'loading' | 'ready' | 'error';

export class ForecastStore {
  data = $state<Forecast | null>(null);
  status = $state<ForecastStatus>('idle');
  error = $state<ApiError | null>(null);

  readonly place: Place;
  readonly #load: ForecastLoader;
  #controller: AbortController | null = null;

  constructor(load: ForecastLoader, place: Place) {
    this.#load = load;
    this.place = place;
  }

  async refresh(): Promise<void> {
    this.#controller?.abort();
    const controller = new AbortController();
    this.#controller = controller;
    if (!this.data) this.status = 'loading';
    try {
      this.data = await this.#load(this.place, controller.signal);
      this.error = null;
      this.status = 'ready';
    } catch (error) {
      if (controller.signal.aborted) return;
      if (!(error instanceof ApiError)) throw error;
      this.error = error;
      if (!this.data) this.status = 'error';
    }
  }

  stop(): void {
    this.#controller?.abort();
  }
}
