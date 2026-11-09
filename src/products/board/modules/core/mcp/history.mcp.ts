import { HISTORY_REDO_TOOL, HISTORY_UNDO_TOOL } from "@canvas";

import { requireBoard } from "../../../mcp/board-access";
import type { BoardMcpTool } from "../../../mcp/board-mcp.types";

/** The board's side of the shared `history` topic: `history_undo`, `history_redo`. */
export const historyTools: BoardMcpTool[] = [
  {
    ...HISTORY_UNDO_TOOL,
    run: (host) => {
      const { engine } = requireBoard(host);
      if (!engine.canUndo()) return "Nothing to undo.";
      engine.undo();
      return "Undone.";
    },
  },
  {
    ...HISTORY_REDO_TOOL,
    run: (host) => {
      const { engine } = requireBoard(host);
      if (!engine.canRedo()) return "Nothing to redo.";
      engine.redo();
      return "Redone.";
    },
  },
];
