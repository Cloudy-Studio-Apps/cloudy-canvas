import type { FieldType } from "../../source";
import { t } from "../../data.i18n";

const TYPES: readonly FieldType[] = [
  "text",
  "integer",
  "number",
  "currency",
  "boolean",
  "date",
  "color",
  "url",
  "image-url",
  "image-base64",
  "image-file",
  "list",
  "object",
];

/** What each field type is called, in the app's language. */
export function fieldTypeLabel(type: FieldType): string {
  const labels: Record<FieldType, string> = {
    text: t("fields.types.text"),
    integer: t("fields.types.integer"),
    number: t("fields.types.number"),
    currency: t("fields.types.currency"),
    boolean: t("fields.types.boolean"),
    date: t("fields.types.date"),
    color: t("fields.types.color"),
    url: t("fields.types.url"),
    "image-url": t("fields.types.imageUrl"),
    "image-base64": t("fields.types.imageBase64"),
    "image-file": t("fields.types.imageFile"),
    list: t("fields.types.list"),
    object: t("fields.types.object"),
  };
  return labels[type];
}

/** The field types as select options. */
export function fieldTypeOptions(): { value: FieldType; label: string }[] {
  return TYPES.map((value) => ({ value, label: fieldTypeLabel(value) }));
}
