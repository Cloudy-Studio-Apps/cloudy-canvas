import type { ErShapes } from "../../../model/lang/serializer.types";
import type { ShapeSelectOption } from "./shape-select.types";

/**
 * Entities (and, with `participants`, aggregations and associative entities: what takes part in
 * relations) as select options, by name.
 */
export function entityOptions(shapes: ErShapes, participants = false): ShapeSelectOption[] {
  return [
    ...shapes.entities.map((e) => ({ value: e.id, label: e.name })),
    ...(participants
      ? [
          ...shapes.aggregates.map((a) => ({ value: a.id, label: `[${a.name}]` })),
          ...shapes.relations
            .filter((r) => r.associative)
            .map((r) => ({ value: r.id, label: `<${r.name}>` })),
        ]
      : []),
  ].sort((a, b) => a.label.localeCompare(b.label));
}

export function relationOptions(shapes: ErShapes): ShapeSelectOption[] {
  return shapes.relations
    .map((r) => ({ value: r.id, label: r.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
