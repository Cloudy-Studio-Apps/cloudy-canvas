import type { CanvasElement } from "../elements";

/**
 * A way of working on the canvas that a product's module registers (the board's ER mode): the
 * tool it starts with, the tools that work in it and what can be reached. The engine holds the
 * current one (`engine.setMode`, `EngineState.mode`); the editor shows its toolbar and a switcher.
 */
export interface CanvasMode {
  id: string;
  /** The tool it starts with, and the one Esc goes back to before leaving it. */
  tool: string;
  /** The other tools that work in it; picking any other waits. Unset: every tool works. */
  tools?: readonly string[];
  /**
   * Only what it accepts can be pointed at, selected, marqueed or Ctrl+A'd; the rest is dimmed
   * and leaves the selection. Unset: everything.
   */
  isolate?: (el: CanvasElement) => boolean;
}
