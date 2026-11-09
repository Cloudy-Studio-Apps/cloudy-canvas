import { Disposables } from "../utils";
import type { ListenerTarget } from "../utils/disposables.types";

/**
 * Events that only finish what already started (a drag, a held Space): they always go through, so
 * one a suspend interrupts still ends.
 */
const ENDINGS: ReadonlySet<string> = new Set([
  "pointerup",
  "pointercancel",
  "pointerleave",
  "keyup",
  "blur",
]);

/**
 * The engine's input listeners, kept in `owner` (released with it), that ignore everything that
 * starts input while `suspended()`: a tab in the background takes no keys, clicks, wheel or pinch.
 */
export class SuspendableListeners extends Disposables {
  constructor(
    private readonly owner: Disposables,
    private readonly suspended: () => boolean,
  ) {
    super();
  }

  override add(dispose: () => void): void {
    this.owner.add(dispose);
  }

  override listen<K extends keyof HTMLElementEventMap>(
    target: ListenerTarget,
    type: K,
    handler: (event: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ): void {
    const gated = ENDINGS.has(type)
      ? handler
      : (event: HTMLElementEventMap[K]) => {
          if (!this.suspended()) handler(event);
        };
    this.owner.listen(target, type, gated, options);
  }
}
