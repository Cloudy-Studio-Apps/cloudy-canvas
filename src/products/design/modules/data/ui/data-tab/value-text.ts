import { readPath } from "../../table";

/** A cell's value as short text: lists and objects as JSON, nothing as "". */
export function valueText(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
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
