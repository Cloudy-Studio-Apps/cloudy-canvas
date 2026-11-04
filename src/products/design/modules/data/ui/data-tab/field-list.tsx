import { useService } from "@canvas-ui";
import { DESIGN_DATA_SOURCES } from "../../model";
import { FieldRow } from "./field-row";
import type { FieldListProps } from "./field-list.types";
import { cellText } from "./value-text";
import { hasUnsavedImages } from "./unsaved-images";
import { t } from "../../data.i18n";

/**
 * A source's fields, each editable (one undo step per change), with row 0's value; an image
 * field whose pictures aren't saved yet asks for an Update.
 */
export function FieldList({ source, rows }: FieldListProps) {
  const sources = useService(DESIGN_DATA_SOURCES);
  if (source.fields.length === 0) {
    return <p className="text-xs text-muted-foreground">{t("fields.empty")}</p>;
  }
  const first = rows[0];
  const failed = new Set(sources.imageFailures(source.id));
  return (
    <ul aria-label={t("fields.title")} className="flex flex-col divide-y divide-border">
      {source.fields.map((field, index) => (
        <FieldRow
          key={field.path}
          field={field}
          sample={first ? cellText(first, field.path) : ""}
          needsUpdate={hasUnsavedImages(field, source, rows, failed)}
          onChange={(next) =>
            sources.setFields(
              source.id,
              source.fields.map((item, i) => (i === index ? next : item)),
            )
          }
        />
      ))}
    </ul>
  );
}
