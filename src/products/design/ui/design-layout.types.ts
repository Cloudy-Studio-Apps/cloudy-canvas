/** What decides where the canvas sits between the docked panels. */
export interface CanvasInsetInput {
  leftOpen: boolean;
  rightOpen: boolean;
  /** The UI is hidden (Ctrl+\): the canvas fills the window. */
  hidden: boolean;
}

/** The canvas's distance from the window's left and right edges, in pixels. */
export interface CanvasInset {
  left: number;
  right: number;
}
