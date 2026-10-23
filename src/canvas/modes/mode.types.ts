import type { CanvasElement } from "../elements";
import type { Keybindings } from "../input";

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
  /**
   * Shortcuts that only exist while it's on, matched before the product's (e.g. the ER mode's N
   * for an entity). Their commands are host commands without keys of their own.
   */
  keybindings?: Keybindings;
}
