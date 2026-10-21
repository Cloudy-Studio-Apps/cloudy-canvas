import { stringArg } from "@canvas";

import { requireBoard } from "./board-access";
import type { BoardAgentTool } from "./board-agent.types";

const NO_ARGS = { type: "object", properties: {} };

export const viewTools: BoardAgentTool[] = [
  {
    name: "zoom_to_fit",
    description: "Fits the whole board in the user's view.",
    inputSchema: NO_ARGS,
    run: (host) => {
      requireBoard(host).engine.zoomToFit();
      return "Done.";
    },
  },
  {
    name: "zoom_to_shape",
    description: "Fits one shape in the user's view and selects it.",
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
    description: "Undoes the last change on the board (the user's or an agent's), like Ctrl+Z.",
    inputSchema: NO_ARGS,
    run: (host) => {
      const { engine } = requireBoard(host);
      if (!engine.getState().canUndo) return "Nothing to undo.";
      engine.undo();
      return "Undone.";
    },
  },
  {
    name: "redo",
    description: "Redoes the last undone change, like Ctrl+Shift+Z.",
    inputSchema: NO_ARGS,
    run: (host) => {
      const { engine } = requireBoard(host);
      if (!engine.getState().canRedo) return "Nothing to redo.";
      engine.redo();
      return "Redone.";
    },
  },
];
