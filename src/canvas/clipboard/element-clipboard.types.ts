import type { CanvasProduct } from "../canvas-product.types";
import type { CanvasDocument } from "../document";
import type { CanvasElement } from "../elements";
import type { Rect } from "../geometry.types";

/** What `ElementClipboard` needs from the engine. */
export interface ElementClipboardHost<O extends object> {
  readonly product: CanvasProduct<O>;
  readonly doc: CanvasDocument;
  /** The scene's elements (derived geometry resolved). */
  elements(): readonly CanvasElement[];
  getElement(id: string): CanvasElement | undefined;
  /** The ids plus what moves with them (e.g. a section's contents). */
  withMembers(ids: Iterable<string>): Set<string>;
  visibleRect(): Rect;
  getOptions(): O;
  select(ids: Iterable<string>): void;
}
