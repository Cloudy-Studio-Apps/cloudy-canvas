import {
  agentPatches,
  asUndoStep,
  optionalBoolean,
  optionalNumber,
  recordList,
  stringArg,
  stringList,
} from "@canvas";

import { requireDesign, requireNodes, type DesignAgentTool } from "../../../agent";

const IDS_SCHEMA = { type: "array", items: { type: "string" } };

/** Editing layers (`create_nodes` is in `create-nodes.agent-tool.ts`, as it needs the kinds). */
export const nodeEditTools: DesignAgentTool[] = [
  {
    name: "update_nodes",
    description:
      "Changes fields of existing layers as one undo step, e.g. { id, patch: { x, y, name, " +
      "fills } }. Field names are the ones get_nodes returns. Moving a frame, section or group " +
      "moves what it holds. A new w/h resizes as the handles do (texts lay out again, vectors " +
      "stretch). fills/strokes are full paint arrays (see create_nodes); parentId moves a layer " +
      "into a frame or section (null: the top of the page); a text's text and typography relayout " +
      "it; a line takes points [x0, y0, x1, y1] relative to its x, y; a vector takes a network; " +
      "rotation turns it to that angle round its top-left corner (to turn layers round their " +
      "middle, use rotate_nodes).",
    inputSchema: {
      type: "object",
      required: ["updates"],
      properties: {
        updates: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "patch"],
            properties: { id: { type: "string" }, patch: { type: "object" } },
          },
        },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const updates = recordList(args, "updates").map((update) => {
        const id = stringArg(update, "id");
        const patch = update.patch;
        if (typeof patch !== "object" || patch === null || Array.isArray(patch)) {
          throw new Error(`"patch" for ${id} must be an object.`);
        }
        return { id, patch: patch as Record<string, unknown> };
      });
      const patches = agentPatches(engine, updates);
      asUndoStep(engine.doc, () => engine.doc.updateMany(patches));
      return { updated: [...patches.keys()] };
    },
  },
  {
    name: "delete_nodes",
    description: "Deletes layers as one undo step, with what they hold (a frame's layers).",
    inputSchema: { type: "object", required: ["ids"], properties: { ids: IDS_SCHEMA } },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      return { deleted: engine.deleteElements(requireNodes(engine, stringList(args, "ids"))) };
    },
  },
  {
    name: "duplicate_nodes",
    description:
      "Copies layers as one undo step, as Ctrl+D does: what they hold is copied too, and the " +
      "copies stay in the same parent. Returns each id's copy. The copies are offset by dx/dy " +
      "(20 by default).",
    inputSchema: {
      type: "object",
      required: ["ids"],
      properties: { ids: IDS_SCHEMA, dx: { type: "number" }, dy: { type: "number" } },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const ids = requireNodes(engine, stringList(args, "ids"));
      const dx = optionalNumber(args, "dx");
      const dy = optionalNumber(args, "dy");
      const offset = dx === undefined && dy === undefined ? undefined : { x: dx ?? 0, y: dy ?? 0 };
      return { copies: Object.fromEntries(engine.duplicateElements(ids, offset)) };
    },
  },
  {
    name: "select_nodes",
    description:
      "Sets your selection (the user sees it outlined in your colour), e.g. to show what changed. Empty clears it. It doesn't change the user's selection.",
    inputSchema: {
      type: "object",
      required: ["ids"],
      properties: {
        ids: IDS_SCHEMA,
        zoom: {
          type: "boolean",
          description: "Also show the layer in your view when selecting one.",
        },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const ids = stringList(args, "ids").filter((id) => engine.getElement(id));
      const [first] = ids;
      if (optionalBoolean(args, "zoom") && first && ids.length === 1) engine.zoomToElement(first);
      else engine.select(ids);
      return { selected: engine.selectedIds() };
    },
  },
];
