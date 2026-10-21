import type { AnyElement, ElementOf, ElementType } from "./element.types";
import type { ElementKind } from "./element-kind";
import { GeoKind } from "./geo/geo-kind";
import { StickyKind } from "./sticky/sticky-kind";
import { StrokeKind } from "./stroke/stroke-kind";

/** One kind per element type. Adding a type means adding its folder and its kind here. */
export const ELEMENT_KINDS: { readonly [K in ElementType]: ElementKind<ElementOf<K>> } = {
  sticky: new StickyKind(),
  stroke: new StrokeKind(),
  geo: new GeoKind(),
};

/** The kind that handles an element. */
export function kindOf<E extends AnyElement>(el: E): ElementKind<E> {
  return ELEMENT_KINDS[el.type] as unknown as ElementKind<E>;
}

/** Whether a type is registered. */
export function isElementType(type: unknown): type is ElementType {
  return typeof type === "string" && Object.hasOwn(ELEMENT_KINDS, type);
}

/**
 * Whether stored data is an element this version can handle. Boards may hold types that aren't
 * registered (yet); those stay in the document untouched but aren't shown.
 */
export function isElement(value: unknown): value is AnyElement {
  return typeof value === "object" && value !== null && isElementType((value as AnyElement).type);
}
