import type { CanvasElement } from "@canvas";

import type { ErElement, ErNamedElement } from "./er.types";

export function isErElement(el: CanvasElement | undefined): el is ErElement {
  return el?.type.startsWith("er-") ?? false;
}

/** ER elements whose name is edited in place. */
export function isErNamed(el: CanvasElement | undefined): el is ErNamedElement {
  return (
    el?.type === "er-entity" ||
    el?.type === "er-relation" ||
    el?.type === "er-attribute" ||
    el?.type === "er-aggregate"
  );
}
