import { formatName } from "../../db/dbml";
import type { ErRelationShape } from "../../document";
import { attributesByOwner, serializeAttributes } from "./serialize-attributes";
import type { ErShapes } from "./serializer.types";

const INDENT = "  ";

/** The ER model as text: entities, then relations, each in board order. */
export function serializeEr({ entities, relations, attributes }: ErShapes): string {
  const byOwner = attributesByOwner(attributes);
  const names = new Map(entities.map((e) => [e.id, e.name]));
  const blocks = [
    ...entities.map((entity) =>
      block(
        `Entity ${formatName(entity.name)}${entity.weak ? " [weak]" : ""}`,
        serializeAttributes(entity.id, byOwner, 1),
      ),
    ),
    ...relations.map((relation) =>
      block(
        `Relation ${formatName(relation.name)}${relation.identifying ? " [identifying]" : ""}`,
        [...participantLines(relation, names), ...serializeAttributes(relation.id, byOwner, 1)],
      ),
    ),
  ];
  return blocks.join("\n\n");
}

function block(head: string, lines: string[]): string {
  return lines.length ? [`${head} {`, ...lines, "}"].join("\n") : `${head} {\n}`;
}

function participantLines(relation: ErRelationShape, names: ReadonlyMap<string, string>): string[] {
  return relation.participants.flatMap((participant) => {
    const name = names.get(participant.entityId);
    if (name === undefined) return [];
    const cardinality =
      participant.min || participant.max
        ? ` (${participant.min || "0"},${participant.max || "n"})`
        : "";
    const role = participant.role ? ` as ${formatName(participant.role)}` : "";
    return [`${INDENT}${formatName(name)}${cardinality}${role}`];
  });
}
