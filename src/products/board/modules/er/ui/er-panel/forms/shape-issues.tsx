import { useErModel, useErQuery } from "../../model";
import { ErCheckList } from "../diagram-settings/check-list";
import type { ErShapeFormProps } from "./er-shape-form.types";
import { t } from "../../../er.i18n";

/**
 * The Check diagram's findings about the selected shape (and its own attributes), above its form;
 * nothing when it has none. Clicking one selects what it's about.
 */
export function ShapeIssues({ id }: ErShapeFormProps) {
  const er = useErModel();
  const issues = useErQuery(() => {
    const shape = er.shape(id);
    if (!shape) return [];
    const diagram = er.diagram(shape.diagram);
    const own = new Set([
      id,
      ...diagram
        .shapes()
        .attributes.filter((a) => a.ownerId === id)
        .map((a) => a.id),
    ]);
    return diagram.check().filter((issue) => own.has(issue.shapeId));
  }, id);
  if (issues.length === 0) return null;
  return (
    <section
      aria-label={t("form.issues")}
      className="rounded-md border border-warning/40 bg-warning-soft px-1 py-0.5"
    >
      <ErCheckList issues={issues} />
    </section>
  );
}
