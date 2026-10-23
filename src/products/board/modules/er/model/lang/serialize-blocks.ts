import { formatName } from "../../../db/schema/dbml";
import { ER_ENTITY_COLOR, ER_RELATION_COLOR } from "../../../../palette";
import type { ErAggregateElement } from "../../aggregate/aggregate.types";
import type { ErAttributeElement } from "../../attribute/attribute.types";
import type { ErConstraintElement } from "../../constraint/constraint.types";
import type { ErEntityElement } from "../../entity/entity.types";
import type { ErIsaElement } from "../../isa/isa.types";
import type { ErRelationElement } from "../../relation/relation.types";
import { serializeAttributes } from "./serialize-attributes";

const INDENT = "  ";

type ByOwner = ReadonlyMap<string, ErAttributeElement[]>;
type Names = ReadonlyMap<string, string>;

export function serializeEntity(entity: ErEntityElement, byOwner: ByOwner): string {
  const settings = [
    ...(entity.weak ? ["weak"] : []),
    ...(entity.color !== ER_ENTITY_COLOR ? [`color: ${entity.color}`] : []),
  ];
  return block(
    `Entity ${formatName(entity.name)}${list(settings)}`,
    serializeAttributes(entity.id, byOwner, 1),
  );
}

export function serializeRelation(
  relation: ErRelationElement,
  byOwner: ByOwner,
  names: Names,
): string {
  const settings = [
    ...(relation.identifying ? ["identifying"] : []),
    ...(relation.idMark ? ["id"] : []),
    ...(relation.color !== ER_RELATION_COLOR ? [`color: ${relation.color}`] : []),
  ];
  const participants = relation.participants.flatMap((p) => {
    const name = names.get(p.entityId);
    if (name === undefined) return [];
    const role = p.role ? ` as ${formatName(p.role)}` : "";
    const arrow = p.arrow ? " [arrow]" : "";
    const viaName = p.via ? byOwner.get(p.entityId)?.find((a) => a.id === p.via)?.name : undefined;
    const via = viaName ? `.${formatName(viaName)}` : "";
    return [`${INDENT}${formatName(name)}${via}${cardinality(p.min, p.max)}${role}${arrow}`];
  });
  return block(`Relation ${formatName(relation.name)}${list(settings)}`, [
    ...participants,
    ...serializeAttributes(relation.id, byOwner, 1),
  ]);
}

export function serializeIsa(isa: ErIsaElement, byOwner: ByOwner, names: Names): string | null {
  const parent = names.get(isa.parentId);
  if (parent === undefined) return null;
  const discriminator = byOwner.get(isa.id)?.[0];
  const settings = [
    ...(isa.exclusive ? ["exclusive"] : []),
    ...(isa.total ? ["total"] : []),
    ...(discriminator ? [`by: ${formatName(discriminator.name)}`] : []),
  ];
  const children = isa.children.flatMap((child) => {
    const name = names.get(child.entityId);
    return name === undefined
      ? []
      : [`${INDENT}${formatName(name)}${cardinality(child.min, child.max)}`];
  });
  const head = `Isa ${formatName(parent)}${cardinality(isa.parentMin, isa.parentMax)}${list(settings)}`;
  return block(head, children);
}

export function serializeAggregate(
  aggregate: ErAggregateElement,
  byOwner: ByOwner,
  names: Names,
): string | null {
  const relation = names.get(aggregate.relationId);
  if (relation === undefined) return null;
  return block(`Aggregate ${formatName(aggregate.name)}`, [
    `${INDENT}${formatName(relation)}`,
    ...serializeAttributes(aggregate.id, byOwner, 1),
  ]);
}

export function serializeConstraint(constraint: ErConstraintElement, names: Names): string | null {
  const from = names.get(constraint.fromId);
  const to = names.get(constraint.toId);
  if (from === undefined || to === undefined) return null;
  const directed = constraint.rule === "inclusive" || constraint.rule === "inclusion";
  const pair = `${formatName(from)}${directed ? " -> " : ", "}${formatName(to)}`;
  if (constraint.rule === "exclusion" || constraint.rule === "inclusion") {
    return `Constraint ${constraint.rule}: ${pair}`;
  }
  const entity = names.get(constraint.entityId);
  if (entity === undefined) return null;
  const card = constraint.rule === "inclusive" ? cardinality(constraint.min, constraint.max) : "";
  return `Constraint ${constraint.rule} ${formatName(entity)}${card}: ${pair}`;
}

function cardinality(min: string, max: string): string {
  return min || max ? ` (${min || "0"},${max || "n"})` : "";
}

function list(settings: readonly string[]): string {
  return settings.length ? ` [${settings.join(", ")}]` : "";
}

function block(head: string, lines: readonly string[]): string {
  return lines.length ? [`${head} {`, ...lines, "}"].join("\n") : `${head} {\n}`;
}
