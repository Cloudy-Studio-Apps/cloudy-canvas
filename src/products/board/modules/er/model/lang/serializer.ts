import { formatName } from "../../../db/schema/dbml";
import { attributesByOwner } from "./serialize-attributes";
import {
  serializeAggregate,
  serializeConstraint,
  serializeEntity,
  serializeIsa,
  serializeRelation,
} from "./serialize-blocks";
import type { ErShapes, ErText, TextRange } from "./serializer.types";

/**
 * The ER model as text: the diagram line (its name and the lollipop look), then entities,
 * hierarchies, relations, aggregations and constraints, each in board order.
 */
export function serializeEr(shapes: ErShapes): string {
  return serializeErBlocks(shapes).text;
}

/** The text plus where each entity, hierarchy, relation, aggregation and constraint is written. */
export function serializeErBlocks(shapes: ErShapes): ErText {
  const { entities, relations, attributes, isas, aggregates, constraints } = shapes;
  const byOwner = attributesByOwner(attributes);
  const names = new Map<string, string>(
    [...entities, ...relations, ...aggregates].map((shape) => [shape.id, shape.name]),
  );
  const blocks: (readonly [id: string | null, text: string | null])[] = [
    [null, diagramLine(shapes)],
    ...entities.map((entity) => [entity.id, serializeEntity(entity, byOwner)] as const),
    ...isas.map((isa) => [isa.id, serializeIsa(isa, byOwner, names)] as const),
    ...relations.map(
      (relation) => [relation.id, serializeRelation(relation, byOwner, names)] as const,
    ),
    ...aggregates.map(
      (aggregate) => [aggregate.id, serializeAggregate(aggregate, byOwner, names)] as const,
    ),
  ];
  const rules = constraints.map(
    (constraint) => [constraint.id, serializeConstraint(constraint, names)] as const,
  );

  let text = "";
  const ranges = new Map<string, TextRange>();
  const write = (id: string | null, part: string, separator: string) => {
    if (text) text += separator;
    if (id) ranges.set(id, { from: text.length, to: text.length + part.length });
    text += part;
  };
  for (const [id, part] of blocks) if (part !== null) write(id, part, "\n\n");
  let firstRule = true;
  for (const [id, part] of rules) {
    if (part === null) continue;
    write(id, part, firstRule ? "\n\n" : "\n");
    firstRule = false;
  }
  return { text, ranges };
}

/** `Diagram Name [style: lollipop]`, or null for an unnamed diagram in the Chen look. */
function diagramLine({ entities, relations, attributes }: ErShapes): string | null {
  const name = [...entities, ...relations, ...attributes].find((s) => s.diagramName)?.diagramName;
  const lollipop = attributes.length > 0 && attributes.every((a) => a.look === "lollipop");
  if (!name && !lollipop) return null;
  return [
    "Diagram",
    ...(name ? [formatName(name)] : []),
    ...(lollipop ? ["[style: lollipop]"] : []),
  ].join(" ");
}
