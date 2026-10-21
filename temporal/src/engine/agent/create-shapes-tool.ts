import { generateKeyBetween } from "fractional-indexing";

import type { Shape } from "../document";
import type { AgentTool } from "./agent-tool.types";
import { asUndoStep, requireBoard } from "./board-access";
import { buildShape, CREATABLE_TYPES } from "./build-shape";
import { optionalString, recordList } from "./tool-args";

const END_SCHEMA = {
  type: "object",
  description: "Attach to a shape ({ shapeId, side? }) or leave free at a point ({ x, y }).",
  properties: {
    shapeId: { type: "string", description: "Shape id, or the key of a shape in this call." },
    side: { enum: ["top", "right", "bottom", "left"] },
    x: { type: "number" },
    y: { type: "number" },
  },
};

export const createShapesTool: AgentTool = {
  name: "create_shapes",
  description:
    "Adds shapes to the open board as one undo step and returns their ids. Coordinates are world " +
    "units, x/y the top-left corner (a sticky is 200x200). Give a shape a `key` to connect it " +
    "with a connector in the same call. Colors are hex strings.",
  inputSchema: {
    type: "object",
    required: ["shapes"],
    properties: {
      shapes: {
        type: "array",
        items: {
          type: "object",
          required: ["type"],
          properties: {
            type: { enum: CREATABLE_TYPES },
            key: { type: "string", description: "Name to reference this shape in the same call." },
            x: { type: "number" },
            y: { type: "number" },
            w: { type: "number" },
            h: { type: "number" },
            text: { type: "string", description: "Label, sticky text or section title." },
            color: { type: "string", description: "Sticky, text, section or connector color." },
            kind: {
              enum: [
                "rectangle",
                "rounded",
                "ellipse",
                "diamond",
                "triangle",
                "parallelogram",
                "cylinder",
                "star",
              ],
              description: "Geo shape kind.",
            },
            fill: { type: "string", description: 'Geo fill, or "transparent".' },
            stroke: { type: "string", description: 'Geo outline, or "transparent".' },
            fontSize: { type: "number", description: "Text size." },
            from: END_SCHEMA,
            to: END_SCHEMA,
            style: { enum: ["straight", "elbow"] },
            startHead: { enum: ["none", "arrow"] },
            endHead: { enum: ["none", "arrow"] },
          },
        },
      },
    },
  },
  run: (host, args) => {
    const { engine } = requireBoard(host);
    const specs = recordList(args, "shapes");
    // Build everything first, so an invalid spec fails the call before anything is added.
    const built = new Map<string, Shape>();
    const keys = new Map<string, string>();
    const lookup = (ref: string) => {
      const id = keys.get(ref) ?? ref;
      return built.get(id) ?? engine.getShape(id);
    };
    let index = engine.doc.nextIndex();
    const created = specs.map((spec, i) => {
      const shape = buildShape(spec, index, lookup);
      index = generateKeyBetween(index, null);
      built.set(shape.id, shape);
      const key = optionalString(spec, "key");
      if (key) keys.set(key, shape.id);
      return { index: i, ...(key ? { key } : {}), id: shape.id, type: shape.type };
    });
    asUndoStep(engine, () => {
      for (const shape of built.values()) engine.doc.add(shape);
    });
    return { created };
  },
};
