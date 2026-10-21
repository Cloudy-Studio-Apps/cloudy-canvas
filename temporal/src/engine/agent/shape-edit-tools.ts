import type { ShapePatch } from "../document";
import type { AgentTool } from "./agent-tool.types";
import { asUndoStep, requireBoard } from "./board-access";
import { createShapesTool } from "./create-shapes-tool";
import { shapePatch } from "./shape-patch";
import { optionalBoolean, recordList, stringArg, stringList } from "./tool-args";

const IDS_SCHEMA = { type: "array", items: { type: "string" } };

export const shapeEditTools: AgentTool[] = [
  createShapesTool,
  {
    name: "update_shapes",
    description:
      "Changes fields of existing shapes as one undo step, e.g. { id, patch: { x, y, text, color } }. " +
      "Field names are the ones get_shapes returns. Tables, enums and ER shapes can only be moved " +
      "here; edit their content with the DBML and ER tools.",
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
      const patches = new Map<string, ShapePatch>();
      for (const update of recordList(args, "updates")) {
        const id = stringArg(update, "id");
        const shape = engine.doc.get(id);
        if (!shape) throw new Error(`No shape with id ${id}.`);
        const patch = update.patch;
        if (typeof patch !== "object" || patch === null || Array.isArray(patch)) {
          throw new Error(`"patch" for ${id} must be an object.`);
        }
        patches.set(id, shapePatch(shape, patch as Record<string, unknown>));
      }
      asUndoStep(engine, () => engine.doc.updateMany(patches));
      return { updated: [...patches.keys()] };
    },
  },
  {
    name: "delete_shapes",
    description:
      "Deletes shapes as one undo step. A section takes the shapes inside it, an ER shape its " +
      "attributes; connectors attached to deleted shapes stay with a free end.",
    inputSchema: { type: "object", required: ["ids"], properties: { ids: IDS_SCHEMA } },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      return { deleted: engine.deleteShapes(stringList(args, "ids")) };
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
      const ids = stringList(args, "ids").filter((id) => engine.getShape(id));
      const [first] = ids;
      if (optionalBoolean(args, "zoom") && first && ids.length === 1) engine.zoomToShape(first);
      else engine.select(ids);
      return { selected: engine.selectedIds() };
    },
  },
];
