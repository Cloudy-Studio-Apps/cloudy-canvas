import { Registry } from "../utils/registry";
import type { CanvasElement } from "./element.types";
import type { ElementKind } from "./element.kind";

/**
 * The element kinds of one product, keyed by type. Each product creates its own (a design file
 * can't hold sticky notes) and registers its built-ins; plugins call `register(new MyKind())`
 * before a file opens. `O` is the product's tool options.
 */
export class ElementKinds<O extends object = object> extends Registry<
  ElementKind<CanvasElement, O>
> {
  constructor() {
    super("element kind", (kind) => kind.type);
  }

  /**
   * The kind that handles an element. Only call it with elements from the document or scene,
   * which hold registered types only (see `isElement`).
   */
  kindOf<E extends CanvasElement>(el: E): ElementKind<E, O> {
    const kind = this.get(el.type);
    if (!kind) throw new Error(`No element kind is registered for "${el.type}".`);
    return kind as unknown as ElementKind<E, O>;
  }

  /**
   * Whether stored data is an element this product can handle. Files may hold types that aren't
   * registered (a plugin that isn't installed, a newer version); those stay in the document
   * untouched but aren't shown.
   */
  isElement(value: unknown): value is CanvasElement {
    if (typeof value !== "object" || value === null) return false;
    const { type } = value as { type?: unknown };
    return typeof type === "string" && this.has(type);
  }
}
