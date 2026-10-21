import { isErShape, type BoardDocument, type ErShape } from "../document";
import type { ErShapes } from "./lang";

export function emptyErShapes(): ErShapes {
  return { entities: [], relations: [], attributes: [], isas: [], aggregates: [], constraints: [] };
}

/** Every ER shape on the board, by kind, in board order. */
export function erShapes(doc: BoardDocument): ErShapes {
  return groupErShapes(doc.all().filter(isErShape));
}

export function groupErShapes(shapes: readonly ErShape[]): ErShapes {
  const result = emptyErShapes();
  for (const shape of shapes) {
    if (shape.type === "er-entity") result.entities.push(shape);
    else if (shape.type === "er-relation") result.relations.push(shape);
    else if (shape.type === "er-attribute") result.attributes.push(shape);
    else if (shape.type === "er-isa") result.isas.push(shape);
    else if (shape.type === "er-aggregate") result.aggregates.push(shape);
    else result.constraints.push(shape);
  }
  return result;
}

export function allErShapes(shapes: ErShapes): ErShape[] {
  const { entities, relations, attributes, isas, aggregates, constraints } = shapes;
  return [...entities, ...relations, ...attributes, ...isas, ...aggregates, ...constraints];
}

/** Shapes the layout places: everything but aggregations and constraints, whose geometry is derived. */
export function placedErShapes({ entities, relations, attributes, isas }: ErShapes): ErShape[] {
  return [...entities, ...relations, ...attributes, ...isas];
}
