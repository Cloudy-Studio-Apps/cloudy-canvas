import type { CanvasElement, ElementKind } from "../elements";

/** An element's drawing order key: views are stacked by these, compared as strings. */
export type OrderKeyOf = (el: CanvasElement, kind: ElementKind) => string;
