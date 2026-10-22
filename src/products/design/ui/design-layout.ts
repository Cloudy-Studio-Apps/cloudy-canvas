/** Widths of the design editor's docked panels, in pixels; the canvas fills what's between. */
export const DESIGN_LAYOUT = {
  /** The rail of left panel tabs. */
  rail: 48,
  leftPanel: 240,
  rightPanel: 256,
} as const;

/** Where the canvas sits: right of the rail and the left panel, left of the properties panel. */
export const CANVAS_INSET = {
  left: DESIGN_LAYOUT.rail + DESIGN_LAYOUT.leftPanel,
  right: DESIGN_LAYOUT.rightPanel,
} as const;
