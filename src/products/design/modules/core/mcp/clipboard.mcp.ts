import { CLIPBOARD_PNG_COPY_TOOL } from "@canvas";

import { optionalNodeIds, requireDesign, type DesignMcpTool } from "../../../mcp";

/** The design's side of the shared `clipboard` topic: `clipboard_png_copy`. */
export const clipboardTools: DesignMcpTool[] = [
  {
    ...CLIPBOARD_PNG_COPY_TOOL,
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const ids = optionalNodeIds(engine, args);
      if (!ids && engine.selectedIds().length === 0) {
        throw new Error('Nothing is selected: pass "ids".');
      }
      await engine.copyAsPng(ids);
      return "Copied to the clipboard.";
    },
  },
];
