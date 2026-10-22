import { optionalRecord, optionalString, rectsIntersect, stringList, type Rect } from "@canvas";

import { requireDesign, type DesignAgentTool } from "../../../agent";
import { isDesignNode } from "../node";
import { summarizeNode } from "./summarize-node";

const NO_ARGS = { type: "object", properties: {} };

export const designReadTools: DesignAgentTool[] = [
  {
    name: "get_design",
    description:
      "The design open in Cloudy Canvas: id, name (its title, or its file name), title and " +
      "description (set with set_design_info), file path, unsaved changes, the page on screen " +
      "(`currentPage`, see list_pages), layer counts by type on it, selection and undo state. " +
      "Returns { open: false } when no design is open.",
    inputSchema: NO_ARGS,
    run: (host) => {
      const design = host.design();
      if (!design) return { open: false };
      const { engine } = design;
      const nodesByType: Record<string, number> = {};
      for (const el of engine.elements()) nodesByType[el.type] = (nodesByType[el.type] ?? 0) + 1;
      const { canUndo, canRedo } = engine.getState();
      const { title, description } = engine.doc.meta();
      return {
        open: true,
        id: design.id,
        name: title || design.name,
        title,
        description,
        path: design.path,
        dirty: design.dirty,
        currentPage: engine.scope,
        nodeCount: engine.elements().length,
        nodesByType,
        selection: engine.selectedIds(),
        canUndo,
        canRedo,
      };
    },
  },
  {
    name: "list_nodes",
    description:
      "Lists the design's layers in drawing order (bottom to top) as summaries: id, type, bounds, " +
      "label (the layer's name), parentId. Filter by type, by parent (null: the top of the page) " +
      "or by a world-space area. Use get_nodes for every field, get_layer_tree for the tree.",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string", description: "Only this type, e.g. frame or text." },
        parent: {
          type: ["string", "null"],
          description: "Only the direct children of this layer (null: the top of the page).",
        },
        within: {
          type: "object",
          description: "Only layers overlapping this area.",
          properties: {
            x: { type: "number" },
            y: { type: "number" },
            w: { type: "number" },
            h: { type: "number" },
          },
          required: ["x", "y", "w", "h"],
        },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const type = optionalString(args, "type");
      const parent = args.parent === null ? null : optionalString(args, "parent");
      const within = optionalRecord(args, "within") as Rect | undefined;
      return engine
        .elements()
        .filter(
          (el) =>
            (!type || el.type === type) &&
            (parent === undefined || (isDesignNode(el) && el.parentId === parent)) &&
            (!within || rectsIntersect(el, within)),
        )
        .map((el) => summarizeNode(engine.kinds, el));
    },
  },
  {
    name: "get_nodes",
    description:
      "Every field of the given layers (fills and strokes are paint arrays; a vector's network " +
      "and a line's points are relative to its x, y).",
    inputSchema: {
      type: "object",
      required: ["ids"],
      properties: { ids: { type: "array", items: { type: "string" } } },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      return stringList(args, "ids").map((id) => engine.getElement(id) ?? { id, missing: true });
    },
  },
  {
    name: "get_design_selection",
    description: "The layers the user has selected in the design, as summaries.",
    inputSchema: NO_ARGS,
    run: (host) => {
      const { engine } = requireDesign(host);
      return engine
        .selectedIds()
        .map((id) => engine.getElement(id))
        .filter((el) => el !== undefined)
        .map((el) => summarizeNode(engine.kinds, el));
    },
  },
];
