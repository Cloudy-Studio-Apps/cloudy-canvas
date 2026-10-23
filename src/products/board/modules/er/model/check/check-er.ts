import type { ErStandardInfo } from "../../base/er.types";
import type { ErShapes } from "../lang";
import type { ErIssue, ErIssueSeverity } from "./check-er.types";

const ORDER: Record<ErIssueSeverity, number> = { error: 0, warning: 1, info: 2 };

/**
 * Checks a diagram against the rules of the ER model and of the standard it follows: keys, weak
 * entities and their identifying relations, relations, hierarchies, and constructs the standard
 * doesn't have. Errors first.
 */
export function checkErDiagram(shapes: ErShapes, standard: ErStandardInfo): ErIssue[] {
  const issues: ErIssue[] = [];
  const add = (rule: string, severity: ErIssueSeverity, shapeId: string, message: string) =>
    issues.push({ rule, severity, shapeId, message });
  const names = new Map<string, string>(
    [...shapes.entities, ...shapes.aggregates].map((e) => [e.id, e.name]),
  );
  const ownAttributes = (id: string) => shapes.attributes.filter((a) => a.ownerId === id);
  const subtypes = new Set(shapes.isas.flatMap((isa) => isa.children.map((c) => c.entityId)));

  for (const entity of shapes.entities) {
    const attributes = ownAttributes(entity.id);
    const identifying = shapes.relations.filter(
      (r) => (r.identifying || r.idMark) && r.participants.some((p) => p.entityId === entity.id),
    );
    if (entity.weak) {
      if (identifying.length === 0) {
        add(
          "weak-identifying",
          "error",
          entity.id,
          `${entity.name} is weak, but no identifying relation joins it to its owner.`,
        );
      }
      if (!attributes.some((a) => a.key === "partial")) {
        add(
          "weak-partial-key",
          "warning",
          entity.id,
          `${entity.name} is weak and has no partial key (~name).`,
        );
      }
      for (const relation of identifying) {
        const own = relation.participants.find((p) => p.entityId === entity.id);
        if (own && (own.min !== "1" || own.max !== "1")) {
          add(
            "weak-total",
            "warning",
            relation.id,
            `${entity.name} should take part (1,1) in ${relation.name}, its identifying relation.`,
          );
        }
      }
    } else {
      // A subtype inherits its parent's key.
      if (!subtypes.has(entity.id) && !attributes.some((a) => a.key === "pk")) {
        add("entity-key", "warning", entity.id, `${entity.name} has no key attribute.`);
      }
      for (const attribute of attributes.filter((a) => a.key === "partial")) {
        add(
          "partial-key-strong",
          "warning",
          attribute.id,
          `${attribute.name} is a partial key, but ${entity.name} isn't weak.`,
        );
      }
    }
  }

  for (const attribute of shapes.attributes) {
    if (attribute.key !== "pk") continue;
    if (attribute.derived)
      add("key-derived", "warning", attribute.id, `${attribute.name} is a key but derived.`);
    if (attribute.multivalued)
      add(
        "key-multivalued",
        "warning",
        attribute.id,
        `${attribute.name} is a key but multivalued.`,
      );
  }

  for (const relation of shapes.relations) {
    const { participants } = relation;
    if (participants.length < 2) {
      add(
        "relation-participants",
        "error",
        relation.id,
        `${relation.name} joins fewer than two entities.`,
      );
    }
    const ids = participants.map((p) => p.entityId);
    const repeated = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (repeated.length > 0 && participants.some((p) => repeated.includes(p.entityId) && !p.role)) {
      add(
        "relation-roles",
        "warning",
        relation.id,
        `${relation.name} relates ${names.get(repeated[0]!) ?? "an entity"} to itself; give each side a role.`,
      );
    }
    if (participants.length >= 3 && participants.every((p) => p.max === "1")) {
      add(
        "relation-all-one",
        "warning",
        relation.id,
        `Every side of ${relation.name} is at most one; a relation of three or more is usually many on some side.`,
      );
    }
    for (const p of participants.filter((p) => !p.max)) {
      add(
        "relation-cardinality",
        "info",
        relation.id,
        `${names.get(p.entityId) ?? "A participant"} has no cardinality in ${relation.name}.`,
      );
    }
  }

  for (const isa of shapes.isas) {
    const parent = names.get(isa.parentId) ?? "its parent";
    if (isa.children.length < 2) {
      add(
        "isa-children",
        "warning",
        isa.id,
        `The hierarchy under ${parent} has ${isa.children.length === 0 ? "no children" : "one child"}; it usually has two or more.`,
      );
    }
    if (!standard.supports.hierarchies) {
      add("standard-hierarchies", "info", isa.id, `Hierarchies aren't part of ${standard.label}.`);
    }
  }
  if (!standard.supports.aggregations) {
    for (const aggregate of shapes.aggregates) {
      add(
        "standard-aggregations",
        "info",
        aggregate.id,
        `Aggregations aren't part of ${standard.label}.`,
      );
    }
  }
  if (!standard.supports.constraints) {
    for (const constraint of shapes.constraints) {
      add(
        "standard-constraints",
        "info",
        constraint.id,
        `Constraints between relations aren't part of ${standard.label}.`,
      );
    }
  }

  return issues.sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);
}
