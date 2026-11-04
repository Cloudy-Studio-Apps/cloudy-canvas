import { readPath } from "../../table";
import { t } from "../../data.i18n";

/** A cell's value as short text: lists and objects as JSON, nothing as "". */
export function valueText(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  // A list of objects (a product's reviews) as how many; a list of values as them, with commas.
  if (Array.isArray(value)) {
    if (value.some((v) => v !== null && typeof v === "object")) {
      return t("fields.itemCount", { count: value.length });
    }
    return value.map((v) => valueText(v)).join(", ");
  }
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

/** The text at a field's path in a row ("" when it isn't there or the path doesn't parse). */
export function cellText(row: unknown, path: string): string {
  try {
    return valueText(readPath(row, path));
  } catch {
    return "";
  }
}
