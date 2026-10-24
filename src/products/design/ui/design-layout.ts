import type { CanvasInset, CanvasInsetInput } from "./design-layout.types";

/** Widths of the design editor's docked panels, in pixels; the canvas fills what's between. */
export const DESIGN_LAYOUT = {
  /** The rail of left panel tabs. */
  rail: 48,
  leftPanel: 240,
  rightPanel: 256,
} as const;

/**
 * Where the canvas sits: right of the rail and the left panel when it's open, left of the
 * properties panel when it's open; the whole window with the UI hidden.
 */
export function canvasInset({ leftOpen, rightOpen, hidden }: CanvasInsetInput): CanvasInset {
  if (hidden) return { left: 0, right: 0 };
  return {
    left: DESIGN_LAYOUT.rail + (leftOpen ? DESIGN_LAYOUT.leftPanel : 0),
    right: rightOpen ? DESIGN_LAYOUT.rightPanel : 0,
  };
}
