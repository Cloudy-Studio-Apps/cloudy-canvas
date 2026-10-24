import type { CanvasDocument } from "../document";
import type { CanvasElement } from "../elements";
import type { Keybindings } from "../input";

/** What a mode's `faded` rule sees: the scene's elements, the document and the active tool. */
export interface ModeFadeContext {
  elements: readonly CanvasElement[];
  doc: CanvasDocument;
  tool: string;
  /** The scope on screen (a design's page), `null` without scopes. */
  scope: string | null;
}

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
   * The ids it shows dimmed, worked out again on every scene change and tool switch (e.g. the
   * design's Catalog mode dims what isn't in the brochure). Unset: what `isolate` leaves out.
   */
  faded?: (context: ModeFadeContext) => Iterable<string>;
  /**
   * The only engine commands that run while it's on, besides its keybindings' and `tool.<id>`
   * (a mode that only organizes keeps Delete, Undo and the zoom). Unset: every command.
   */
  commands?: readonly string[];
  /**
   * Shortcuts that only exist while it's on, matched before the product's (e.g. the ER mode's N
   * for an entity). Their commands are host commands without keys of their own.
   */
  keybindings?: Keybindings;
}
