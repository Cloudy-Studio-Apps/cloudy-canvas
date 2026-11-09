import { CLIPBOARD_PNG_COPY_TOOL } from "@canvas";

import { optionalShapeIds, requireBoard } from "../../../mcp/board-access";
import type { BoardMcpTool } from "../../../mcp/board-mcp.types";

/** The board's side of the shared `clipboard` topic: `clipboard_png_copy`. */
export const clipboardTools: BoardMcpTool[] = [
  {
    ...CLIPBOARD_PNG_COPY_TOOL,
    run: async (host, args) => {
      const { engine } = requireBoard(host);
      const ids = optionalShapeIds(engine, args);
      if (!ids && engine.selectedIds().length === 0) {
        throw new Error('Nothing is selected: pass "ids".');
      }
      await engine.copyAsPng(ids);
      return "Copied to the clipboard.";
    },
  },
];
