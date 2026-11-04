import type { BookLayout } from "./book-layout.types";

/** Whether a book spread is the back cover: the last side alone, on the left of the spine. */
export function isBackCover(layout: BookLayout, spread: readonly number[]): boolean {
  const [first = 0, second] = spread;
  return (
    second === undefined &&
    first === layout.sides.length - 1 &&
    first > 0 &&
    (first + layout.offset) % 2 === 0
  );
}
