import type { CanvasElement } from "../element.types";
import { ElementKind } from "../element.kind";

/** Rectangular elements: hit anywhere inside their bounds, and resizable with the handles. */
export abstract class BoxKind<
  E extends CanvasElement,
  O extends object = object,
> extends ElementKind<E, O> {
  override readonly resizable: boolean = true;
}
