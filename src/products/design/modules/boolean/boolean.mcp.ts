import { asUndoStep, optionalString, stringList, type ElementPatch } from "@canvas";

import { requireDesign, requireNodes, type DesignMcpTool } from "../../mcp";
import { booleanOperation } from "./boolean.constants";
import { booleanNodes } from "./boolean-nodes";
import { flattenNodes } from "./flatten-nodes";
import { outlineStrokes } from "./outline-strokes";

const IDS_SCHEMA = { type: "array", items: { type: "string" } };

/** Booleans, Flatten and Outline stroke, as the toolbar's boolean menu does them. */
export const booleanTools: DesignMcpTool[] = [
  {
    name: "boolean_nodes",
    description:
      "Combines layers into a boolean, as Figma's boolean operations, in one undo step: union " +
      "(all of them), subtract (the bottom one minus the others), intersect (where all overlap) " +
      "or exclude (where an odd number overlap). The layers become its operands (not drawn on " +
      "their own, still editable; lines add the area their strokes cover) and it's painted like " +
      "the bottom one. Booleans among them nest in the new one; given one boolean alone, changes " +
      "its operation instead. Returns the boolean.",
    inputSchema: {
      type: "object",
      required: ["ids", "operation"],
      properties: {
        ids: IDS_SCHEMA,
        operation: { type: "string", enum: ["union", "subtract", "intersect", "exclude"] },
        name: { type: "string" },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const ids = new Set(requireNodes(engine, stringList(args, "ids")));
      const operation = booleanOperation(args.operation);
      const name = optionalString(args, "name");
      const result = asUndoStep(engine.doc, () => {
        const made = booleanNodes(engine.doc, ids, operation, engine.elements(), engine.kinds);
        if (name) for (const id of made) engine.doc.update(id, { name } as ElementPatch);
        return made;
      });
      if (result.length === 0) throw new Error("A boolean needs two or more layers.");
      return { booleans: result };
    },
  },
  {
    name: "flatten_nodes",
    description:
      "Flattens layers into one vector, as Ctrl+E does, in one undo step: a boolean's result, " +
      "shapes, texts (their glyphs) and groups' layers, painted like the bottom layer. One layer " +
      "keeps its id. Returns the vector.",
    inputSchema: { type: "object", required: ["ids"], properties: { ids: IDS_SCHEMA } },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const ids = new Set(requireNodes(engine, stringList(args, "ids")));
      const [vector] = asUndoStep(engine.doc, () =>
        flattenNodes(engine.doc, ids, engine.elements(), engine.kinds),
      );
      if (!vector) throw new Error("None of these layers has a shape to flatten.");
      return { vector };
    },
  },
  {
    name: "outline_strokes",
    description:
      "Turns layers' strokes into filled vectors of the area they cover, as Ctrl+Shift+O does, " +
      "in one undo step. A layer with fills keeps them (the vector goes right above it); a line " +
      "is replaced by its vector. Returns the vectors.",
    inputSchema: { type: "object", required: ["ids"], properties: { ids: IDS_SCHEMA } },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const ids = new Set(requireNodes(engine, stringList(args, "ids")));
      const vectors = asUndoStep(engine.doc, () =>
        outlineStrokes(engine.doc, ids, engine.elements(), engine.kinds),
      );
      if (vectors.length === 0) throw new Error("None of these layers has visible strokes.");
      return { vectors };
    },
  },
];
