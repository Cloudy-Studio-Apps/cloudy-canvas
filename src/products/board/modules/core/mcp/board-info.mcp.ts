import { asUndoStep, optionalString } from "@canvas";

import { requireBoard } from "../../../mcp/board-access";
import type { BoardMcpTool } from "../../../mcp/board-mcp.types";

export const boardInfoTools: BoardMcpTool[] = [
  {
    name: "set_board_info",
    description:
      "Sets the open board's title and/or description, saved in the board file. The title is " +
      "shown instead of the file name (the file isn't renamed); the description says what the " +
      "board is about. An empty string clears one. Autosave writes it when it's on; otherwise " +
      "call save_board.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "The board's title." },
        description: { type: "string", description: "What the board is about." },
      },
    },
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
];
