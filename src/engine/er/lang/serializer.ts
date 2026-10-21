import { attributesByOwner } from "./serialize-attributes";
import {
  serializeAggregate,
  serializeConstraint,
  serializeEntity,
  serializeIsa,
  serializeRelation,
} from "./serialize-blocks";
import type { ErShapes } from "./serializer.types";

/**
 * The ER model as text: the style line (for the lollipop look), then entities, hierarchies,
 * relations, aggregations and constraints, each in board order.
 */
export function serializeEr(shapes: ErShapes): string {
  const { entities, relations, attributes, isas, aggregates, constraints } = shapes;
  const byOwner = attributesByOwner(attributes);
  const names = new Map<string, string>(
    [...entities, ...relations, ...aggregates].map((shape) => [shape.id, shape.name]),
  );
  const lollipop = attributes.length > 0 && attributes.every((a) => a.look === "lollipop");
  const blocks = [
    ...(lollipop ? ["Diagram [style: lollipop]"] : []),
    ...entities.map((entity) => serializeEntity(entity, byOwner)),
    ...isas.map((isa) => serializeIsa(isa, byOwner, names)),
    ...relations.map((relation) => serializeRelation(relation, byOwner, names)),
    ...aggregates.map((aggregate) => serializeAggregate(aggregate, byOwner, names)),
  ].filter((text): text is string => text !== null);
  const rules = constraints
    .map((constraint) => serializeConstraint(constraint, names))
    .filter((text): text is string => text !== null);
  return [...blocks, ...(rules.length ? [rules.join("\n")] : [])].join("\n\n");
}
