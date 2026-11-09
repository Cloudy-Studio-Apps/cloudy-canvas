import { optionalRecord, optionalString, rectsIntersect, stringList, type Rect } from "@canvas";

import { requireDesign, type DesignMcpTool } from "../../../mcp";
import { isDesignNode } from "../node";
import { siblingMasks } from "../tree";
import { summarizeNode } from "./summarize-node";

export const designReadTools: DesignMcpTool[] = [
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
      const masked = siblingMasks(engine.elements());
      return engine
        .elements()
        .filter(
          (el) =>
            (!type || el.type === type) &&
            (parent === undefined || (isDesignNode(el) && el.parentId === parent)) &&
            (!within || rectsIntersect(el, within)),
        )
        .map((el) => summarizeNode(engine.kinds, el, masked));
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
];
