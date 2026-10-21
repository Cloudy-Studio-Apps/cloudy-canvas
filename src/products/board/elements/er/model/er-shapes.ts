import type { CanvasDocument } from "@canvas";

import { isErElement } from "../base/is-er-element";
import type { ErDiagramFields, ErElement } from "../base/er.types";
import type { ErEntityElement } from "../entity/entity.types";
import type { ErDiagramInfo } from "./er-shapes.types";
import type { ErShapes } from "./lang";

/** Entity names an unnamed diagram is labeled with. */
const LABEL_NAMES = 2;

export function emptyErShapes(): ErShapes {
  return { entities: [], relations: [], attributes: [], isas: [], aggregates: [], constraints: [] };
}

/** The ER shapes of one diagram (or of the whole board), by kind, in board order. */
export function erShapes(doc: CanvasDocument, diagram?: string): ErShapes {
  const shapes = doc.all().filter(isErElement);
  return groupErShapes(
    diagram === undefined ? shapes : shapes.filter((shape) => shape.diagram === diagram),
  );
}

/** The board's ER diagrams, in the board order of their first shape. */
export function erDiagrams(doc: CanvasDocument): ErDiagramInfo[] {
  const byId = new Map<string, ErElement[]>();
  for (const shape of doc.all().filter(isErElement)) {
    const list = byId.get(shape.diagram);
    if (list) list.push(shape);
    else byId.set(shape.diagram, [shape]);
  }
  return [...byId].map(([id, shapes]) => {
    const name = shapes[0]?.diagramName ?? "";
    const { entities } = groupErShapes(shapes);
    return { id, name, label: name || diagramLabel(entities), entityCount: entities.length };
  });
}

function diagramLabel(entities: readonly ErEntityElement[]): string {
  const names = entities.slice(0, LABEL_NAMES).map((entity) => entity.name);
  if (names.length === 0) return "Untitled diagram";
  return entities.length > LABEL_NAMES ? `${names.join(", ")}…` : names.join(", ");
}

export function groupErShapes(shapes: readonly ErElement[]): ErShapes {
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

export function allErShapes(shapes: ErShapes): ErElement[] {
  const { entities, relations, attributes, isas, aggregates, constraints } = shapes;
  return [...entities, ...relations, ...attributes, ...isas, ...aggregates, ...constraints];
}

/** Shapes the layout places: everything but aggregations and constraints, whose geometry is derived. */
export function placedErShapes({ entities, relations, attributes, isas }: ErShapes): ErElement[] {
  return [...entities, ...relations, ...attributes, ...isas];
}

/** The diagram fields to write on a diagram's shapes: its id and current name. */
export function diagramScope(shapes: ErShapes, diagram: string): ErDiagramFields {
  const diagramName = allErShapes(shapes).find((s) => s.diagramName)?.diagramName ?? "";
  return { diagram, diagramName };
}
