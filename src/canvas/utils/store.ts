import { Emitter } from "./emitter";
import { shallowEqual } from "./shallow-equal";

/**
 * Immutable snapshot store for UI hosts (works with React's `useSyncExternalStore`).
 * Listeners only fire when the snapshot actually changes (shallow comparison).
 */
export class Store<T extends object> {
  private readonly emitter = new Emitter();

  constructor(private snapshot: T) {}

  get = (): T => this.snapshot;

  subscribe = (listener: () => void): (() => void) => this.emitter.subscribe(listener);

  set(next: T): void {
    if (shallowEqual(this.snapshot, next)) return;
    this.snapshot = next;
    this.emitter.emit();
  }

  destroy(): void {
    this.emitter.clear();
  }
}
