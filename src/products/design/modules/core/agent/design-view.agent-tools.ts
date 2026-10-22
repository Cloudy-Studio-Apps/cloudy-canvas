import { stringArg } from "@canvas";

import { requireDesign, requireNodes, type DesignAgentTool } from "../../../agent";

const NO_ARGS = { type: "object", properties: {} };

export const designViewTools: DesignAgentTool[] = [
  {
    name: "zoom_design_to_fit",
    description: "Fits the whole design in the user's view.",
    inputSchema: NO_ARGS,
    run: (host) => {
      requireDesign(host).engine.zoomToFit();
      return "Done.";
    },
  },
  {
    name: "zoom_to_node",
    description: "Fits one layer in the user's view and selects it.",
    inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string" } } },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const [id] = requireNodes(engine, [stringArg(args, "id")]);
      engine.zoomToElement(id!);
      return "Done.";
    },
  },
  {
    name: "undo_design",
    description: "Undoes the last change on the design (the user's or an agent's), like Ctrl+Z.",
    inputSchema: NO_ARGS,
    run: (host) => {
      const { engine } = requireDesign(host);
      if (!engine.getState().canUndo) return "Nothing to undo.";
      engine.undo();
      return "Undone.";
    },
  },
  {
    name: "redo_design",
    description: "Redoes the last undone change on the design, like Ctrl+Shift+Z.",
    inputSchema: NO_ARGS,
    run: (host) => {
      const { engine } = requireDesign(host);
      if (!engine.getState().canRedo) return "Nothing to redo.";
      engine.redo();
      return "Redone.";
    },
  },
];
