import { stringArg } from "@canvas";

import { requireBoard } from "./board-access";
import type { BoardAgentTool } from "./board-agent.types";

const NO_ARGS = { type: "object", properties: {} };

export const viewTools: BoardAgentTool[] = [
  {
    name: "zoom_to_fit",
    description: "Fits the whole board in your own view (the user sees it when they follow you).",
    inputSchema: NO_ARGS,
    run: (host) => {
      requireBoard(host).engine.zoomToFit();
      return "Done.";
    },
  },
  {
    name: "zoom_to_shape",
    description:
      "Shows one shape in your own view and selects it (your selection, not the user's).",
    inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string" } } },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      const id = stringArg(args, "id");
      if (!engine.getElement(id)) throw new Error(`No shape with id ${id}.`);
      engine.zoomToElement(id);
      return "Done.";
    },
  },
  {
    name: "undo",
    description:
      "Undoes your last change on the board (yours only: the user and other agents have their own undo).",
    inputSchema: NO_ARGS,
    run: (host) => {
      const { engine } = requireBoard(host);
      if (!engine.canUndo()) return "Nothing to undo.";
      engine.undo();
      return "Undone.";
    },
  },
  {
    name: "redo",
    description: "Redoes your last undone change on the board.",
    inputSchema: NO_ARGS,
    run: (host) => {
      const { engine } = requireBoard(host);
      if (!engine.canRedo()) return "Nothing to redo.";
      engine.redo();
      return "Redone.";
    },
  },
];
