import type { ParsedEr, ParsedErEntity } from "./lang";

/**
 * Adds an empty entity for every name that relations or hierarchies use but nothing defines.
 * A warning reports each one.
 */
export function addMissingEntities(model: ParsedEr): ParsedEr {
  const known = new Set([...model.entities, ...model.aggregates].map((item) => item.name));
  const created = new Map<string, ParsedErEntity>();
  const need = (name: string, line: number) => {
    if (known.has(name) || created.has(name)) return;
    created.set(name, { name, weak: false, color: null, attributes: [], line });
  };
  for (const relation of model.relations) {
    for (const participant of relation.participants) need(participant.entity, participant.line);
  }
  for (const isa of model.isas) {
    need(isa.parent, isa.line);
    for (const child of isa.children) need(child.entity, child.line);
  }
  if (created.size === 0) return model;
  const entities = [...created.values()];
  return {
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
}
