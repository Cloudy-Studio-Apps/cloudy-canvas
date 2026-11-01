import type { ErElement } from "../../../base/er.types";
import type { ErShapes } from "../../../model/lang/serializer.types";
import { t } from "../../../er.i18n";

/** What the panel calls a shape: its name, or what it is when it has none. */
export function shapeLabel(shape: ErElement): string {
  if ("name" in shape) return shape.name;
  if (shape.type === "er-isa") return t("form.back.hierarchy");
  if (shape.type === "er-union") return t("form.back.union");
  return t("form.back.constraint");
}

/** The name of what can take part in a relation or head a hierarchy; empty when it's gone. */
export function memberName(shapes: ErShapes, id: string): string {
  const found = [...shapes.entities, ...shapes.aggregates, ...shapes.relations].find(
    (shape) => shape.id === id,
  );
  return found?.name ?? "";
}

/** The name of the shape that put a key in a table: a relation, hierarchy or union. */
export function keySource(shapes: ErShapes, id: string): string {
  const relation = shapes.relations.find((r) => r.id === id);
  if (relation) return relation.name;
  const isa = shapes.isas.find((i) => i.id === id);
  if (isa) return memberName(shapes, isa.parentId);
  const union = shapes.unions.find((u) => u.id === id);
  return union ? memberName(shapes, union.categoryId) : "";
}
