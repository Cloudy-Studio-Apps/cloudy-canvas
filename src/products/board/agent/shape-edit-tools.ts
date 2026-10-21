import {
  asUndoStep,
  elementPatch,
  optionalBoolean,
  recordList,
  stringArg,
  stringList,
  type ElementPatch,
} from "@canvas";

import { requireBoard } from "./board-access";
import type { BoardAgentTool } from "./board-agent.types";
import { createShapesTool } from "./create-shapes-tool";

const IDS_SCHEMA = { type: "array", items: { type: "string" } };

export const shapeEditTools: BoardAgentTool[] = [
  createShapesTool,
  {
    name: "update_shapes",
    description:
      "Changes fields of existing shapes as one undo step, e.g. { id, patch: { x, y, text, color } }. " +
      "Field names are the ones get_shapes returns. Marker strokes can only be moved.",
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
      const { engine } = requireBoard(host);
      const patches = new Map<string, ElementPatch>();
      for (const update of recordList(args, "updates")) {
        const id = stringArg(update, "id");
        const el = engine.doc.get(id);
        if (!el) throw new Error(`No shape with id ${id}.`);
        const patch = update.patch;
        if (typeof patch !== "object" || patch === null || Array.isArray(patch)) {
          throw new Error(`"patch" for ${id} must be an object.`);
        }
        patches.set(id, elementPatch(engine.kinds, el, patch as Record<string, unknown>));
      }
      asUndoStep(engine.doc, () => engine.doc.updateMany(patches));
      return { updated: [...patches.keys()] };
    },
  },
  {
    name: "delete_shapes",
    description: "Deletes shapes as one undo step. A section takes the shapes inside it.",
    inputSchema: { type: "object", required: ["ids"], properties: { ids: IDS_SCHEMA } },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      return { deleted: engine.deleteElements(stringList(args, "ids")) };
    },
  },
  {
    name: "select_shapes",
    description:
      "Selects shapes in the editor, e.g. to show the user what changed. Empty clears it.",
    inputSchema: {
      type: "object",
      required: ["ids"],
      properties: {
        ids: IDS_SCHEMA,
        zoom: { type: "boolean", description: "Fit the view to the shape when selecting one." },
      },
    },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      const ids = stringList(args, "ids").filter((id) => engine.getElement(id));
      const [first] = ids;
      if (optionalBoolean(args, "zoom") && first && ids.length === 1) engine.zoomToElement(first);
      else engine.select(ids);
      return { selected: engine.selectedIds() };
    },
  },
];
