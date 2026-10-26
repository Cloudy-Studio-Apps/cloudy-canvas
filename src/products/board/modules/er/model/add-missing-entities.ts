import type { DbmlError } from "../../db";
import type { ParsedEr, ParsedErAttribute, ParsedErEntity } from "./lang";
import { attributeNamed } from "./lang/parse-attributes";

/**
 * Adds an empty entity for every name that relations or hierarchies use but nothing defines, and
 * the join attributes participants name. A warning reports each one.
 */
export function addMissingEntities(model: ParsedEr): ParsedEr {
  const known = new Set(
    [...model.entities, ...model.aggregates, ...model.relations.filter((r) => r.associative)].map(
      (item) => item.name,
    ),
  );
  const created = new Map<string, ParsedErEntity>();
  const need = (name: string, line: number) => {
    if (known.has(name) || created.has(name)) return;
    created.set(name, { name, weak: false, color: null, attributes: [], line });
  };
  for (const relation of model.relations) {
    for (const participant of relation.participants) need(participant.entity, participant.line);
  }
  for (const union of model.unions) {
    need(union.category, union.line);
    for (const superclass of union.superclasses) need(superclass.entity, superclass.line);
  }
  for (const isa of model.isas) {
    need(isa.parent, isa.line);
    for (const child of isa.children) need(child.entity, child.line);
  }
  const entities = [...created.values()];
  const withEntities: ParsedEr = {
    ...model,
    entities: [...model.entities, ...entities],
    warnings: [
      ...model.warnings,
      ...entities.map((entity) => ({
        message: `Created the missing entity "${entity.name}"`,
        line: entity.line,
        column: 1,
      })),
    ],
  };
  return addMissingVias(created.size ? withEntities : model);
}

/**
 * Adds the join attributes participants name (`Cliente.id`) that their entity (or aggregation)
 * doesn't have: a key when it has no key yet, otherwise a plain attribute. A warning reports each.
 */
function addMissingVias(model: ParsedEr): ParsedEr {
  const added = new Map<string, ParsedErAttribute[]>();
  const warnings: DbmlError[] = [];
  for (const relation of model.relations) {
    for (const { entity: name, via, line } of relation.participants) {
      // An aggregation takes part like an entity, with attributes of its own.
      const entity =
        model.entities.find((e) => e.name === name) ??
        model.aggregates.find((a) => a.name === name);
      if (!via || !entity) continue;
      const extra = added.get(name) ?? [];
      const attributes = [...entity.attributes, ...extra];
      if (attributes.some((a) => a.name === via)) continue;
      const hasKey = attributes.some((a) => a.key === "pk");
      added.set(name, [...extra, { ...attributeNamed(via, line), key: hasKey ? "none" : "pk" }]);
      warnings.push({ message: `Added the attribute "${via}" to "${name}"`, line, column: 1 });
    }
  }
  if (added.size === 0) return model;
  return {
    ...model,
    entities: model.entities.map((e) =>
      added.has(e.name) ? { ...e, attributes: [...e.attributes, ...(added.get(e.name) ?? [])] } : e,
    ),
    aggregates: model.aggregates.map((a) =>
      added.has(a.name) ? { ...a, attributes: [...a.attributes, ...(added.get(a.name) ?? [])] } : a,
    ),
    warnings: [...model.warnings, ...warnings],
  };
}
