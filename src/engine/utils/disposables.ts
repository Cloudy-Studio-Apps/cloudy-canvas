type Target = Pick<EventTarget, "addEventListener" | "removeEventListener">;

/** Collects teardown callbacks so a component can release everything in one call. */
export class Disposables {
  private items: (() => void)[] = [];

  add(dispose: () => void): void {
    this.items.push(dispose);
  }

  /** Adds an event listener that is removed on `dispose()`. */
  listen<K extends keyof HTMLElementEventMap>(
    target: Target,
    type: K,
    handler: (event: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ): void {
    const listener = handler as EventListener;
    target.addEventListener(type, listener, options);
    this.add(() => target.removeEventListener(type, listener, options));
  }

  dispose(): void {
    const items = this.items;
    this.items = [];
    for (const dispose of items) dispose();
  }
}
