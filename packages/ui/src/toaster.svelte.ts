export type ToastTone = 'info' | 'success' | 'error';

export interface ToastInput {
  tone?: ToastTone;
  title: string;
  message?: string;
  meta?: string;
  timeoutMs?: number;
}

export interface ToastItem extends Required<Omit<ToastInput, 'message' | 'meta'>> {
  id: number;
  message?: string;
  meta?: string;
}

export interface ErrorLike {
  message: string;
  requestId?: string;
}

export class ToastStore {
  items = $state<ToastItem[]>([]);
  #next = 1;
  #timers = new Map<number, ReturnType<typeof setTimeout>>();

  push(input: ToastInput): number {
    const id = this.#next++;
    const item: ToastItem = { tone: 'info', timeoutMs: 6000, ...input, id };
    this.items = [...this.items, item];
    if (item.timeoutMs > 0) {
      this.#timers.set(
        id,
        setTimeout(() => this.dismiss(id), item.timeoutMs)
      );
    }
    return id;
  }

  error(error: ErrorLike, title = 'Something went wrong'): number {
    return this.push({
      tone: 'error',
      title,
      message: error.message,
      meta: error.requestId ? `Request ${error.requestId}` : undefined,
      timeoutMs: 10000
    });
  }

  success(title: string, message?: string): number {
    return this.push({ tone: 'success', title, message });
  }

  dismiss(id: number): void {
    clearTimeout(this.#timers.get(id));
    this.#timers.delete(id);
    this.items = this.items.filter((item) => item.id !== id);
  }

  clear(): void {
    for (const id of this.#timers.keys()) this.dismiss(id);
    this.items = [];
  }
}

export function createToaster(): ToastStore {
  return new ToastStore();
}
