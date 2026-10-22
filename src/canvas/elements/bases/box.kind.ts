import type { CanvasElement } from "../element.types";
import { ElementKind } from "../element.kind";

/**
 * Rectangular elements: hit anywhere inside their bounds, resizable and scalable with the handles,
 * and connectable.
 */
export abstract class BoxKind<
  E extends CanvasElement,
  O extends object = object,
> extends ElementKind<E, O> {
  override readonly resizable: boolean = true;
  override readonly scalable: boolean = true;
  override readonly connectable: boolean = true;
}
