/** How close to a list's top or bottom edge (px) the pointer scrolls it while dragging. */
const SCROLL_EDGE = 28;
/** The fastest it scrolls, in px per frame. */
const SCROLL_SPEED = 14;

/** The pixels a list in `box` scrolls this frame with the pointer at `pointerY`: 0 for none. */
export function edgeScrollStep(pointerY: number, box: DOMRect): number {
  const near =
    pointerY < box.top + SCROLL_EDGE
      ? -(box.top + SCROLL_EDGE - pointerY)
      : pointerY > box.bottom - SCROLL_EDGE
        ? pointerY - (box.bottom - SCROLL_EDGE)
        : 0;
  if (near === 0) return 0;
  return Math.sign(near) * Math.min(SCROLL_SPEED, Math.ceil(Math.abs(near) / 2));
}
