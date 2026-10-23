import { Emitter } from "@canvas";

/**
 * A question a connect gesture leaves for the editor to ask (what to create on empty board, what
 * kind of relation to make): the gesture opens it and an overlay shows it until it's answered or
 * dismissed. Works with React's `useSyncExternalStore`.
 */
export class ErPrompt<T> {
  private request: T | null = null;
  private readonly emitter = new Emitter();

  subscribe = this.emitter.subscribe;

  current = (): T | null => this.request;

  open(request: T): void {
    this.request = request;
    this.emitter.emit();
  }

  close = (): void => {
    if (!this.request) return;
    this.request = null;
    this.emitter.emit();
  };
}
