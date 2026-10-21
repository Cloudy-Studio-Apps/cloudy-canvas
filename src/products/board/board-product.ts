import type { CanvasProduct } from "@canvas";

import { DEFAULT_BOARD_OPTIONS } from "./board-options";
import type { BoardToolOptions } from "./board-options.types";
import { BOARD_KEYBINDINGS } from "./board-keybindings";
import { boardKinds, DbLinks, pruneRefs } from "./elements";
import { DbTool, MarkerTool, ShapeTool, StickyTool } from "./tools";

/** Boards (`.cboard`, FigJam-style): sticky notes, marker strokes, diagram shapes and database schemas. */
export const boardProduct: CanvasProduct<BoardToolOptions> = {
  id: "board",
  kinds: boardKinds,
  createTools: (ctx) => [
    new MarkerTool(ctx),
    new StickyTool(ctx),
    new ShapeTool(ctx),
    new DbTool(ctx),
  ],
  keybindings: BOARD_KEYBINDINGS,
  defaultOptions: DEFAULT_BOARD_OPTIONS,
  createLinks: () => [new DbLinks()],
  // Relations pointing at deleted tables or columns go with them.
  onRemove: (doc) => pruneRefs(doc),
};
