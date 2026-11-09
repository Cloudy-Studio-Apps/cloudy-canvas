import type { ArrangeToolsOptions } from "@canvas";

import { requireDesign, requireNodes, type DesignAgentHost } from "../../../mcp";

/** How the shared `arrange` and `style` tools reach the design's layers. */
export const DESIGN_ARRANGE_OPTIONS: ArrangeToolsOptions<DesignAgentHost> = {
  resolve: (host, ids) => {
    const { engine } = requireDesign(host);
    return { engine, ids: requireNodes(engine, ids) };
  },
};
