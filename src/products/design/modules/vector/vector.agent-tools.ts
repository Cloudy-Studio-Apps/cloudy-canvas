import { asUndoStep, stringList } from "@canvas";

import { requireDesign, requireNodes, type DesignAgentTool } from "../../agent";
import { shapeToVector } from "./shape-to-vector";
import type { VectorElement } from "./vector.types";

/** Turning shapes into vectors, as editing their points does. */
export const vectorTools: DesignAgentTool[] = [
  {
    name: "convert_to_vector",
    description:
      "Turns rectangles, ellipses, polygons and stars into vectors with the same id, place and " +
      "look, as editing their points does, in one undo step. Then change their points with " +
      "update_nodes (network). Ids that are already vectors are left alone. Returns the ids " +
      "converted.",
    inputSchema: {
      type: "object",
      required: ["ids"],
      properties: { ids: { type: "array", items: { type: "string" } } },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const ids = requireNodes(engine, stringList(args, "ids"));
      const vectors: VectorElement[] = [];
      for (const id of ids) {
        const el = engine.getElement(id)!;
        if (el.type === "vector") continue;
        const vector = shapeToVector(el, engine.kinds);
        if (!vector) throw new Error(`A ${engine.kinds.kindOf(el).label} can't become a vector.`);
        vectors.push(vector);
      }
      asUndoStep(engine.doc, () => {
        engine.doc.remove(vectors.map((vector) => vector.id));
        for (const vector of vectors) engine.doc.add(vector);
      });
      return { converted: vectors.map((vector) => vector.id) };
    },
  },
];
