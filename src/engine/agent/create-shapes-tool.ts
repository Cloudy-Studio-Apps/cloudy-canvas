import { generateKeyBetween } from "fractional-indexing";

import { geoVariants, type CanvasElement } from "../elements";
import type { AgentTool } from "./agent-tool.types";
import { asUndoStep, requireBoard } from "./board-access";
import { buildElement, creatableTypes } from "./build-element";
import { optionalString, recordList } from "./tool-args";

export const createShapesTool: AgentTool = {
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
              type: { enum: creatableTypes() },
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
      const el = buildElement(spec, index);
      index = generateKeyBetween(index, null);
      built.push(el);
      const key = optionalString(spec, "key");
      return { index: i, ...(key ? { key } : {}), id: el.id, type: el.type };
    });
    asUndoStep(engine, () => {
      for (const el of built) engine.doc.add(el);
    });
    return { created };
  },
};
