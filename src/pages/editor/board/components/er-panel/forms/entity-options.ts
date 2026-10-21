import type { ErShapes } from "@engine";
import type { ShapeSelectOption } from "./shape-select.types";

/** Entities (and, with `aggregates`, aggregations) as select options, by name. */
export function entityOptions(shapes: ErShapes, aggregates = false): ShapeSelectOption[] {
  return [
    ...shapes.entities.map((e) => ({ value: e.id, label: e.name })),
    ...(aggregates ? shapes.aggregates.map((a) => ({ value: a.id, label: `[${a.name}]` })) : []),
  ].sort((a, b) => a.label.localeCompare(b.label));
}

export function relationOptions(shapes: ErShapes): ShapeSelectOption[] {
  return shapes.relations
    .map((r) => ({ value: r.id, label: r.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
