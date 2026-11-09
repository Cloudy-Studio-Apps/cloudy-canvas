import { copyPropertiesTool } from "@canvas";

import type { DesignMcpTool } from "../../../mcp";
import { DESIGN_ARRANGE_OPTIONS } from "./arrange-options";

/** The design's side of the shared `style` topic: `style_copy`. */
export const styleTools: DesignMcpTool[] = [copyPropertiesTool(DESIGN_ARRANGE_OPTIONS)];
