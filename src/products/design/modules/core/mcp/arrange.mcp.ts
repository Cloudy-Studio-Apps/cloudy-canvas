import { arrangeTools as canvasArrangeTools } from "@canvas";

import type { DesignMcpTool } from "../../../mcp";
import { DESIGN_ARRANGE_OPTIONS } from "./arrange-options";

/**
 * The design's side of the shared `arrange` topic: `arrange_align`, `arrange_distribute`,
 * `arrange_tidy_up`, `arrange_scale`.
 */
export const arrangeTools: DesignMcpTool[] = canvasArrangeTools(DESIGN_ARRANGE_OPTIONS);
