import {
  asUndoStep,
  buildElement,
  creatableTypes,
  optionalString,
  recordList,
  type CanvasElement,
  keyBetween,
} from "@canvas";

import { requireBoard } from "../../../mcp/board-access";
import type { BoardAgentContext, BoardMcpTool } from "../../../mcp/board-mcp.types";

/** `create_shapes`, listing the board's creatable types. */
export const createShapesTool = ({ kinds }: BoardAgentContext): BoardMcpTool => ({
  name: "create_shapes",
  description:
    "Adds shapes to the open board as one undo step and returns their ids. Coordinates are world " +
    "units, x/y the top-left corner (a sticky is 200x200). Give a shape a `key` to connect it " +
    "with a connector in the same call. Colors are hex strings. Stickers are stamped with " +
    "stamp_stickers instead.",
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
              type: { enum: creatableTypes(kinds) },
              key: {
                type: "string",
                description:
                  "Name to find this shape in the result, or to connect it in the same call.",
              },
              x: { type: "number" },
              y: { type: "number" },
              w: { type: "number" },
              h: { type: "number" },
              text: { type: "string", description: "Sticky text, shape label or section title." },
              color: {
                type: "string",
                description: "Sticky, text, section, table header, connector or stroke color.",
              },
              // Type-specific fields (e.g. a connector's ends).
              ...Object.assign({}, ...kinds.all().map((kind) => kind.specProperties)),
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
    const keyed = new Map<string, CanvasElement>();
    // Connectors may refer to shapes by id, or by the key of a shape created earlier in the call.
    const lookup = (ref: string) =>
      keyed.get(ref) ?? built.find((el) => el.id === ref) ?? engine.getElement(ref);
    let index = engine.doc.nextIndex();
    const created = specs.map((spec, i) => {
      const el = buildElement(engine.kinds, spec, index, lookup);
      index = keyBetween(index, null);
      built.push(el);
      const key = optionalString(spec, "key");
      if (key) keyed.set(key, el);
      return { index: i, ...(key ? { key } : {}), id: el.id, type: el.type };
    });
    asUndoStep(engine.doc, () => {
      for (const el of built) engine.doc.add(el);
    });
    return { created };
  },
});
