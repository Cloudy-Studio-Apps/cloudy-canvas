import type { ArrangeToolsOptions } from "@canvas";

import { requireBoard, requireShapes } from "../../../mcp/board-access";
import type { AgentHost } from "../../../mcp/board-mcp.types";

/** How the shared `arrange` and `style` tools reach the board's shapes. */
export const BOARD_ARRANGE_OPTIONS: ArrangeToolsOptions<AgentHost> = {
  resolve: (host, ids) => {
    const { engine } = requireBoard(host);
    return { engine, ids: requireShapes(engine, ids) };
  },
};
