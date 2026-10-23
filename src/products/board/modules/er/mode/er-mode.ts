import type { CanvasMode } from "@canvas";

import { isErElement } from "../base/is-er-element";

/** The ER mode's id (`engine.setMode`, `EngineState.mode`). */
export const ER_MODE_ID = "er";

/**
 * The ER mode: only the board's ER shapes (every diagram, so linking two still joins them) can be
 * reached, with the select, hand and ER tools; other tools wait until it's left. The editor shows
 * the ER toolbar, palette and panel while it's on.
 */
export const ER_MODE: CanvasMode = {
  id: ER_MODE_ID,
  tool: "select",
  tools: ["hand", "er"],
  isolate: isErElement,
};
