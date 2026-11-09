import { arrangeTools as canvasArrangeTools } from "@canvas";

import type { BoardMcpTool } from "../../../mcp/board-mcp.types";
import { BOARD_ARRANGE_OPTIONS } from "./arrange-options";

/**
 * The board's side of the shared `arrange` topic: `arrange_align`, `arrange_distribute`,
 * `arrange_tidy_up`, `arrange_scale`.
 */
export const arrangeTools: BoardMcpTool[] = canvasArrangeTools(BOARD_ARRANGE_OPTIONS);
