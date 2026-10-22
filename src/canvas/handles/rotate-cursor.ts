import type { ResizeHandle } from "./handles.types";

/** Each corner's direction from the box's center, in degrees (counterclockwise from east). */
const CORNER_ANGLES: Partial<Record<ResizeHandle, number>> = { ne: 45, nw: 135, sw: 225, se: 315 };

/**
 * A curved double arrow turned toward `angle` (degrees, counterclockwise from east), as a CSS
 * cursor; the arrow's bow faces away from the box.
 */
export function rotateCursor(angle: number): string {
  // The drawn arrow bows toward the top right (45°); turn it from there.
  const turn = 45 - angle;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">` +
    `<g transform="rotate(${turn} 12 12)" fill="none" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="M7 17A9 9 0 0 1 17 7" stroke="white" stroke-width="4"/>` +
    `<path d="M4 14l3 3 3-3M14 4l3 3-3 3" stroke="white" stroke-width="4"/>` +
    `<path d="M7 17A9 9 0 0 1 17 7" stroke="black" stroke-width="1.5"/>` +
    `<path d="M4 14l3 3 3-3M14 4l3 3-3 3" stroke="black" stroke-width="1.5"/>` +
    `</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 12 12, crosshair`;
}

/** The cursor over a corner's rotate zone of a box turned by `rotation` degrees. */
export function cornerRotateCursor(corner: ResizeHandle, rotation: number): string {
  return rotateCursor((CORNER_ANGLES[corner] ?? 45) + rotation);
}
