import type { SnapAxis } from "../snapping";

/**
 * Which of the screen's axes a frame's axis runs closest to when the frame is turned by
 * `rotation` degrees: its own, or the other one once it's turned nearer a quarter than not. It
 * maps both ways (a ruler's axis to the frame's too).
 */
export function screenAxis(axis: SnapAxis, rotation: number): SnapAxis {
  const turn = (rotation * Math.PI) / 180;
  const swapped = Math.abs(Math.sin(turn)) > Math.abs(Math.cos(turn));
  return swapped ? (axis === "x" ? "y" : "x") : axis;
}
