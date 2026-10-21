import type { CanvasProduct } from "@canvas";

import { DEFAULT_BOARD_OPTIONS } from "./board-options";
import type { BoardToolOptions } from "./board-options.types";
import { BOARD_KEYBINDINGS } from "./board-keybindings";
import { boardKinds } from "./elements";
import { MarkerTool, ShapeTool, StickyTool } from "./tools";

/** Boards (`.cboard`, FigJam-style): sticky notes, marker strokes and diagram shapes. */
export const boardProduct: CanvasProduct<BoardToolOptions> = {
  id: "board",
  kinds: boardKinds,
  createTools: (ctx) => [new MarkerTool(ctx), new StickyTool(ctx), new ShapeTool(ctx)],
  keybindings: BOARD_KEYBINDINGS,
  defaultOptions: DEFAULT_BOARD_OPTIONS,
};
