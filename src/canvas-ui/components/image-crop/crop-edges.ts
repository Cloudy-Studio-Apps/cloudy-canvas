import type { CropEdge } from "./image-crop-overlay.types";

/** The crop box's corners, then its sides, with their resize cursors. */
export const CROP_EDGES: readonly { edge: CropEdge; cursor: string }[] = [
  { edge: { x: -1, y: -1 }, cursor: "nwse-resize" },
  { edge: { x: 1, y: -1 }, cursor: "nesw-resize" },
  { edge: { x: 1, y: 1 }, cursor: "nwse-resize" },
  { edge: { x: -1, y: 1 }, cursor: "nesw-resize" },
  { edge: { x: 0, y: -1 }, cursor: "ns-resize" },
  { edge: { x: 1, y: 0 }, cursor: "ew-resize" },
  { edge: { x: 0, y: 1 }, cursor: "ns-resize" },
  { edge: { x: -1, y: 0 }, cursor: "ew-resize" },
];

/** Where `edge`'s grip sits in the box (normalized). */
export function edgePoint(edge: CropEdge): { x: number; y: number } {
  return { x: (edge.x + 1) / 2, y: (edge.y + 1) / 2 };
}
