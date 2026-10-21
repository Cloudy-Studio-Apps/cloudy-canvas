import type { ErShape } from "../../document";
import type { Size } from "../../geometry.types";
import { keepCenter } from "../keep-center";

/** A copy of the list with the shape `id` replaced by `fn(shape)`. */
export function replaceIn<T extends ErShape>(
  list: readonly T[],
  id: string,
  fn: (shape: T) => T,
): T[] {
  return list.map((shape) => (shape.id === id ? fn(shape) : shape));
}

/** The shape resized to `size`, staying centered where it was. */
export function resized<T extends ErShape>(shape: T, size: Size): T {
  return { ...shape, ...keepCenter(shape, size), ...size };
}
