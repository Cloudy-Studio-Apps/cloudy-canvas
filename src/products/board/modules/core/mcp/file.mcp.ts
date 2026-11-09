import {
  asUndoStep,
  FILE_GET_TOOL,
  FILE_INFO_SET_TOOL,
  FILE_SAVE_TOOL,
  optionalString,
} from "@canvas";

import { requireBoard } from "../../../mcp/board-access";
import type { BoardMcpTool } from "../../../mcp/board-mcp.types";

/** The board's side of the shared `file` topic: `file_get`, `file_info_set`, `file_save`. */
export const fileTools: BoardMcpTool[] = [
  {
    ...FILE_GET_TOOL,
    run: (host) => {
      const board = requireBoard(host);
      const { engine } = board;
      const shapesByType: Record<string, number> = {};
      for (const el of engine.elements()) {
        shapesByType[el.type] = (shapesByType[el.type] ?? 0) + 1;
      }
      const { title, description } = engine.doc.meta();
      return {
        open: true,
        id: board.id,
        name: title || board.name,
        title,
        description,
        path: board.path,
        dirty: board.dirty,
        editable: !engine.doc.isReadOnly,
        shapeCount: engine.elements().length,
        shapesByType,
        selection: engine.userSelection(),
        yourSelection: engine.selectedIds(),
        canUndo: engine.canUndo(),
        canRedo: engine.canRedo(),
      };
    },
  },
  {
    ...FILE_INFO_SET_TOOL,
    run: (host, args) => {
      const { engine } = requireBoard(host);
      const title = optionalString(args, "title");
      const description = optionalString(args, "description");
      if (title === undefined && description === undefined) {
        throw new Error('Give "title", "description" or both.');
      }
      asUndoStep(engine.doc, () => engine.doc.setMeta({ title, description }));
      return engine.doc.meta();
    },
  },
  {
    ...FILE_SAVE_TOOL,
    run: async (host) => {
      const board = requireBoard(host);
      if (!board.path) {
        // The save dialog waits for the user; the editor reports a failed save itself.
        board.save().catch(() => undefined);
        return "Asked the user where to save the board.";
      }
      await board.save();
      return `Saved to ${board.path}.`;
    },
  },
];
