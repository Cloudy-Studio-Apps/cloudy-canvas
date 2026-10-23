import type { Disposables } from "../../utils";

/** What selecting with the pointer reaches of a rich editing session. */
export interface PointerSelectHost {
  textarea: HTMLTextAreaElement;
  /** The element the pointer is captured by while dragging. */
  root: HTMLElement;
  text: string;
  /** The character boundary under the pointer, `null` without a layout. */
  indexAt(event: PointerEvent): number | null;
  /** The selection changed. */
  changed(): void;
  /** Where the drag's listeners are kept, so ending the session removes them. */
  listeners: Disposables;
}
