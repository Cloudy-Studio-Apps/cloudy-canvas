import type { PaintTab } from "./paint-picker.types";

/** The picker's tabs, one per kind of paint, in Figma's order. */
export const PAINT_TABS: readonly PaintTab[] = [
  { id: "solid", label: "Solid", ready: true },
  { id: "linear", label: "Linear", ready: true },
  { id: "radial", label: "Radial", ready: true },
  { id: "angular", label: "Angular", ready: true },
  { id: "diamond", label: "Diamond", ready: true },
  { id: "image", label: "Image", ready: true },
  { id: "pattern", label: "Pattern", ready: false },
];
