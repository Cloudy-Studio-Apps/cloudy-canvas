import { forbiddenConstructs } from "../../base/constructs";
import type { ErStandardDefinition } from "../../base/standards";
import type { ErShapes } from "../lang";
import type { ErIssue, ErIssueSeverity } from "./check-er.types";
import { t } from "../../er.i18n";

const ORDER: Record<ErIssueSeverity, number> = { error: 0, warning: 1, info: 2 };

/**
 * Checks a diagram against the rules of the ER model and of the standard it follows: keys, weak
 * entities and their identifying relations, relations, hierarchies, the constructs the standard
 * forbids (errors, one per shape using them: `ErStandardDefinition.forbids`), then the standard's
 * own rules (`ErStandardDefinition.check`). Errors first.
 */
export function checkErDiagram(shapes: ErShapes, standard: ErStandardDefinition): ErIssue[] {
  const issues: ErIssue[] = [];
  const add = (rule: string, severity: ErIssueSeverity, shapeId: string, message: string) =>
    issues.push({ rule, severity, shapeId, message });
  const names = new Map<string, string>(
    [...shapes.entities, ...shapes.aggregates].map((e) => [e.id, e.name]),
  );
  const ownAttributes = (id: string) => shapes.attributes.filter((a) => a.ownerId === id);
  const subtypes = new Set(shapes.isas.flatMap((isa) => isa.children.map((c) => c.entityId)));
  // A union type's category gets a surrogate key.
  const categories = new Set(shapes.unions.map((u) => u.categoryId));

  for (const entity of shapes.entities) {
    const attributes = ownAttributes(entity.id);
    const identifying = shapes.relations.filter(
      (r) => (r.identifying || r.idMark) && r.participants.some((p) => p.entityId === entity.id),
    );
    if (entity.weak) {
      const byExistence = shapes.relations.some(
        (r) => r.existenceMark && r.participants.some((p) => p.entityId === entity.id),
      );
      if (identifying.length === 0 && byExistence) {
        add("weak-existence", "info", entity.id, t("check.weakExistence", { name: entity.name }));
      } else if (identifying.length === 0) {
        add(
          "weak-identifying",
          "error",
          entity.id,
          t("check.weakIdentifying", { name: entity.name }),
        );
      }
      if (!attributes.some((a) => a.key === "partial")) {
        add(
          "weak-partial-key",
          "warning",
          entity.id,
          t("check.weakPartialKey", { name: entity.name }),
        );
      }
      for (const relation of identifying) {
        const own = relation.participants.find((p) => p.entityId === entity.id);
        if (own && (own.min !== "1" || own.max !== "1")) {
          add(
            "weak-total",
            "warning",
            relation.id,
            t("check.weakTotal", { entity: entity.name, relation: relation.name }),
          );
        }
      }
    } else {
      // A subtype inherits its parent's key.
      if (
        !subtypes.has(entity.id) &&
        !categories.has(entity.id) &&
        !attributes.some((a) => a.key === "pk")
      ) {
        add("entity-key", "warning", entity.id, t("check.entityKey", { name: entity.name }));
      }
      for (const attribute of attributes.filter((a) => a.key === "partial")) {
        add(
          "partial-key-strong",
          "warning",
          attribute.id,
          t("check.partialKeyStrong", { name: attribute.name, entity: entity.name }),
        );
      }
    }
  }

  for (const attribute of shapes.attributes) {
    if (attribute.key !== "pk" && attribute.key !== "alternate") continue;
    const isKey = attribute.key === "pk";
    if (attribute.derived) {
      add(
        "key-derived",
        "warning",
        attribute.id,
        t(isKey ? "check.keyDerived" : "check.alternateKeyDerived", { name: attribute.name }),
      );
    }
    if (attribute.multivalued) {
      add(
        "key-multivalued",
        "warning",
        attribute.id,
        t(isKey ? "check.keyMultivalued" : "check.alternateKeyMultivalued", {
          name: attribute.name,
        }),
      );
    }
  }

  for (const relation of shapes.relations) {
    const { participants } = relation;
    if (relation.idMark && relation.existenceMark) {
      add(
        "relation-dependency",
        "error",
        relation.id,
        t("check.relationDependency", { name: relation.name }),
      );
    }
    if (participants.length < 2) {
      add(
        "relation-participants",
        "error",
        relation.id,
        t("check.relationParticipants", { name: relation.name }),
      );
    }
    const ids = participants.map((p) => p.entityId);
    const repeated = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (repeated.length > 0 && participants.some((p) => repeated.includes(p.entityId) && !p.role)) {
      add(
        "relation-roles",
        "warning",
        relation.id,
        t("check.relationRoles", {
          name: relation.name,
          entity: names.get(repeated[0]!) ?? t("check.anEntity"),
        }),
      );
    }
    if (relation.associative && !ownAttributes(relation.id).some((a) => a.key === "pk")) {
      add(
        "associative-key",
        "warning",
        relation.id,
        t("check.associativeKey", { name: relation.name }),
      );
    }
    if (participants.length >= 3 && !relation.associative) {
      add(
        "relation-convert",
        "info",
        relation.id,
        t("check.relationConvert", { name: relation.name, count: participants.length }),
      );
    }
    if (participants.length >= 3 && participants.every((p) => p.max === "1")) {
      add(
        "relation-all-one",
        "warning",
        relation.id,
        t("check.relationAllOne", { name: relation.name }),
      );
    }
    for (const p of participants.filter((p) => !p.max)) {
      add(
        "relation-cardinality",
        "info",
        relation.id,
        t("check.relationCardinality", {
          entity: names.get(p.entityId) ?? t("check.aParticipant"),
          relation: relation.name,
        }),
      );
    }
  }

  for (const isa of shapes.isas) {
    const parent = names.get(isa.parentId) ?? t("check.itsParent");
    if (isa.children.length < 2) {
      add(
        "isa-children",
        "warning",
        isa.id,
        t(isa.children.length === 0 ? "check.isaNoChildren" : "check.isaOneChild", { parent }),
      );
    }
  }
  for (const union of shapes.unions) {
    const category = names.get(union.categoryId) ?? t("check.itsCategory");
    if (union.superclassIds.length < 2) {
      add(
        "union-superclasses",
        "warning",
        union.id,
        t(
          union.superclassIds.length === 0
            ? "check.unionNoSuperclasses"
            : "check.unionOneSuperclass",
          { category },
        ),
      );
    }
  }

  // What the standard doesn't have: each shape using it is an error to fix.
  for (const construct of forbiddenConstructs(standard)) {
    for (const shapeId of new Set(construct.detect(shapes))) {
      add(
        "standard-construct",
        "error",
        shapeId,
        t("check.standardConstruct", { construct: construct.label, standard: standard.label }),
      );
    }
  }
  // The standard's own rules come after the shared ones.
  issues.push(...(standard.check?.(shapes) ?? []));
  return issues.sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);
}
