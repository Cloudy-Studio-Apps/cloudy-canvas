import { copyPropertiesTool } from "@canvas";

import type { BoardMcpTool } from "../../../mcp/board-mcp.types";
import { BOARD_ARRANGE_OPTIONS } from "./arrange-options";

/** The board's side of the shared `style` topic: `style_copy`. */
export const styleTools: BoardMcpTool[] = [copyPropertiesTool(BOARD_ARRANGE_OPTIONS)];
