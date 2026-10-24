import { stringArg } from "@canvas";

import { requireDesign, requireNodes, type DesignAgentTool } from "../../../agent";

const NO_ARGS = { type: "object", properties: {} };

export const designViewTools: DesignAgentTool[] = [
  {
    name: "zoom_design_to_fit",
    description:
      "Fits the whole page you work on in your own view (the user sees it when they follow you).",
    inputSchema: NO_ARGS,
    run: (host) => {
      requireDesign(host).engine.zoomToFit();
      return "Done.";
    },
  },
  {
    name: "zoom_to_node",
    description:
      "Shows one layer in your own view and selects it (your selection, not the user's).",
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
    description:
      "Undoes your last change on the design (yours only: the user and other agents have their own undo).",
    inputSchema: NO_ARGS,
    run: (host) => {
      const { engine } = requireDesign(host);
      if (!engine.canUndo()) return "Nothing to undo.";
      engine.undo();
      return "Undone.";
    },
  },
  {
    name: "redo_design",
    description: "Redoes your last undone change on the design.",
    inputSchema: NO_ARGS,
    run: (host) => {
      const { engine } = requireDesign(host);
      if (!engine.canRedo()) return "Nothing to redo.";
      engine.redo();
      return "Redone.";
    },
  },
];
