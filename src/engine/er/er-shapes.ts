import { isErShape, type BoardDocument, type ErShape } from "../document";
import type { ErShapes } from "./lang";

/** Every ER shape on the board, by kind, in board order. */
export function erShapes(doc: BoardDocument): ErShapes {
  return groupErShapes(doc.all().filter(isErShape));
}

export function groupErShapes(shapes: readonly ErShape[]): ErShapes {
  const result: ErShapes = { entities: [], relations: [], attributes: [] };
  for (const shape of shapes) {
    if (shape.type === "er-entity") result.entities.push(shape);
    else if (shape.type === "er-relation") result.relations.push(shape);
    else result.attributes.push(shape);
  }
  return result;
}

export function allErShapes({ entities, relations, attributes }: ErShapes): ErShape[] {
  return [...entities, ...relations, ...attributes];
}
