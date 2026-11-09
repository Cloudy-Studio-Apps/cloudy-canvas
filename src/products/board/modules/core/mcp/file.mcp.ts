import {
  ASK_ABOUT_PROJECT,
  fileRefArg,
  isFileCandidates,
  isProjectChoice,
  newFileArgs,
  SEVERAL_FILES_MATCH,
} from "@canvas";

import { requireBoard } from "../../../mcp/board-access";
import type { AgentBoard, BoardMcpTool } from "../../../mcp/board-mcp.types";

const NO_ARGS = { type: "object", properties: {} };

const NAME_PROPERTY = {
  type: "string",
  description: "The whole name, case-insensitive, of a recent board or a board inside a project.",
};

export const fileTools: BoardMcpTool[] = [
  {
    name: "list_recent_boards",
    scope: "app",
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
    scope: "app",
    description:
      "Opens a board in its own tab and moves you there; the user's view doesn't change. Give " +
      "its id (from list_recent_boards) or its name: the name is matched case-insensitively " +
      "against the recent boards and the boards inside the user's projects. If several boards " +
      "match, nothing is opened and you get the candidates: ask the user which one. Unsaved " +
      "changes elsewhere stay unsaved, so call save_board first if needed.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, name: NAME_PROPERTY },
    },
    run: async (host, args) => {
      const opened = await host.openBoard(fileRefArg(args));
      return isFileCandidates(opened)
        ? { message: SEVERAL_FILES_MATCH, candidates: opened.candidates }
        : boardInfo(opened);
    },
  },
  {
    name: "new_board",
    scope: "app",
    description:
      "Creates a new empty board in its own tab and moves you there; the user's view doesn't " +
      "change. It's a draft the app saves by itself unless you save it with save_board. With a " +
      "name, if a project's name matches the name's words (every word of one is among the words " +
      "of the other, case-insensitive), nothing is created and you get matchingProjects: ask " +
      "the user whether to save it in that project, then call again with project set to its id, " +
      'or "none" for a draft.',
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "The name of the new board." },
        project: {
          type: "string",
          description: 'A project id (from matchingProjects) to create it in, or "none".',
        },
      },
    },
    run: async (host, args) => {
      const created = await host.newBoard(newFileArgs(args));
      return isProjectChoice(created)
        ? { message: ASK_ABOUT_PROJECT, matchingProjects: created.matchingProjects }
        : boardInfo(created);
    },
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
  const shown = title || name;
  return {
    id,
    name: shown,
    title,
    description,
    path,
    message: `Opened in the tab "${shown}"; you now work there.`,
  };
}
