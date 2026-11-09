import { HISTORY_REDO_TOOL, HISTORY_UNDO_TOOL } from "@canvas";

import { requireDesign, type DesignMcpTool } from "../../../mcp";

/** The design's side of the shared `history` topic: `history_undo`, `history_redo`. */
export const historyTools: DesignMcpTool[] = [
  {
    ...HISTORY_UNDO_TOOL,
    run: (host) => {
      const { engine } = requireDesign(host);
      if (!engine.canUndo()) return "Nothing to undo.";
      engine.undo();
      return "Undone.";
    },
  },
  {
    ...HISTORY_REDO_TOOL,
    run: (host) => {
      const { engine } = requireDesign(host);
      if (!engine.canRedo()) return "Nothing to redo.";
      engine.redo();
      return "Redone.";
    },
  },
];
