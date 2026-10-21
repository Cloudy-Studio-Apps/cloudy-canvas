import type { Size } from "@canvas";

import type { ErElement } from "../../base/er.types";
import { keepCenter } from "../../base/keep-center";

/** A copy of the list with the shape `id` replaced by `fn(shape)`. */
export function replaceIn<T extends ErElement>(
  list: readonly T[],
  id: string,
  fn: (shape: T) => T,
): T[] {
  return list.map((shape) => (shape.id === id ? fn(shape) : shape));
}

/** The shape resized to `size`, staying centered where it was. */
export function resized<T extends ErElement>(shape: T, size: Size): T {
  return { ...shape, ...keepCenter(shape, size), ...size };
}
