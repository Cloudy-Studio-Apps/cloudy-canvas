import { stringArg } from "@canvas";

import { requireBoard } from "./board-access";
import type { AgentBoard, BoardAgentTool } from "./board-agent.types";

const NO_ARGS = { type: "object", properties: {} };

export const fileTools: BoardAgentTool[] = [
  {
    name: "list_recent_boards",
    description:
      "Boards recently opened or saved in Cloudy Canvas, newest first, with their title and " +
      "description when they have one. Boards marked missing were moved or deleted and can't " +
      "be opened.",
    inputSchema: NO_ARGS,
    run: async (host) => {
      const files = await host.recentFiles();
      return files
        .filter((file) => file.type === "board")
        .map(({ id, name, title, description, path, updatedAt, missing }) => ({
          id,
          name,
          ...(title && { title }),
          ...(description && { description }),
          path,
          updatedAt,
          ...(missing && { missing: true }),
        }));
    },
  },
  {
    name: "open_board",
    description:
      "Opens a board from list_recent_boards in the app window. Unsaved changes on the current " +
      "board stay unsaved, so call save_board first if needed.",
    inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string" } } },
    run: async (host, args) => boardInfo(await host.openBoard(stringArg(args, "id"))),
  },
  {
    name: "new_board",
    description: "Opens a new empty board in the app window. It's saved with save_board.",
    inputSchema: NO_ARGS,
    run: async (host) => boardInfo(await host.newBoard()),
  },
  {
    name: "save_board",
    description:
      "Saves the open board to its .cboard file. A board that was never saved asks the user " +
      "where to save it, so the call returns before the file is written.",
    inputSchema: NO_ARGS,
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

function boardInfo({ id, name, path, engine }: AgentBoard) {
  const { title, description } = engine.doc.meta();
  return { id, name: title || name, title, description, path };
}
