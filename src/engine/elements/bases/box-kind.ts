import type { AnyElement } from "../element.types";
import { ElementKind } from "../element-kind";

/** Rectangular elements: hit anywhere inside their bounds, and resizable with the handles. */
export abstract class BoxKind<E extends AnyElement> extends ElementKind<E> {
  override readonly resizable: boolean = true;
}
