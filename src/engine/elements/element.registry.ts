import { Registry } from "../utils/registry";
import type { CanvasElement } from "./element.types";
import type { ElementKind } from "./element.kind";
import { GeoKind } from "./geo/geo.kind";
import { StickyKind } from "./sticky/sticky.kind";
import { StrokeKind } from "./stroke/stroke.kind";

/**
 * Every element kind, keyed by type. The built-ins are registered here; plugins call
 * `elementKinds.register(new MyKind())` before the board opens.
 */
export const elementKinds = new Registry<ElementKind>("element kind", (kind) => kind.type);
elementKinds.register(new StickyKind());
elementKinds.register(new StrokeKind());
elementKinds.register(new GeoKind());

/**
 * The kind that handles an element. Only call it with elements from the document or scene, which
 * hold registered types only (see `isElement`).
 */
export function kindOf<E extends CanvasElement>(el: E): ElementKind<E> {
  const kind = elementKinds.get(el.type);
  if (!kind) throw new Error(`No element kind is registered for "${el.type}".`);
  return kind as unknown as ElementKind<E>;
}

/**
 * Whether stored data is an element this app can handle. Boards may hold types that aren't
 * registered (a plugin that isn't installed, a newer version); those stay in the document
 * untouched but aren't shown.
 */
export function isElement(value: unknown): value is CanvasElement {
  if (typeof value !== "object" || value === null) return false;
  const { type } = value as { type?: unknown };
  return typeof type === "string" && elementKinds.has(type);
}
