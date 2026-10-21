import { generateKeyBetween } from "fractional-indexing";

import {
  asUndoStep,
  buildElement,
  creatableTypes,
  optionalString,
  recordList,
  type CanvasElement,
} from "@canvas";

import { boardKinds, geoVariants } from "../elements";
import { requireBoard } from "./board-access";
import type { BoardAgentTool } from "./board-agent.types";

export const createShapesTool: BoardAgentTool = {
  name: "create_shapes",
  description:
    "Adds shapes to the open board as one undo step and returns their ids. Coordinates are world " +
    "units, x/y the top-left corner (a sticky is 200x200). Colors are hex strings.",
  // A getter, so the schema lists the types and variants registered when an agent asks (plugins too).
  get inputSchema() {
    return {
      type: "object",
      required: ["shapes"],
      properties: {
        shapes: {
          type: "array",
          items: {
            type: "object",
            required: ["type"],
            properties: {
              type: { enum: creatableTypes(boardKinds) },
              key: { type: "string", description: "Name to find this shape in the result." },
              x: { type: "number" },
              y: { type: "number" },
              w: { type: "number" },
              h: { type: "number" },
              text: { type: "string", description: "Sticky text or shape label." },
              color: { type: "string", description: "Sticky color." },
              kind: { enum: geoVariants.keys(), description: "Geo shape kind." },
              fill: { type: "string", description: 'Geo fill, or "transparent".' },
              stroke: { type: "string", description: 'Geo outline, or "transparent".' },
            },
          },
        },
      },
    };
  },
  run: (host, args) => {
    const { engine } = requireBoard(host);
    const specs = recordList(args, "shapes");
    // Build everything first, so an invalid spec fails the call before anything is added.
    const built: CanvasElement[] = [];
    let index = engine.doc.nextIndex();
    const created = specs.map((spec, i) => {
      const el = buildElement(engine.kinds, spec, index);
      index = generateKeyBetween(index, null);
      built.push(el);
      const key = optionalString(spec, "key");
      return { index: i, ...(key ? { key } : {}), id: el.id, type: el.type };
    });
    asUndoStep(engine.doc, () => {
      for (const el of built) engine.doc.add(el);
    });
    return { created };
  },
};
