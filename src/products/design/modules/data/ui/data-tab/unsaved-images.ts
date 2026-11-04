import type { DataField, DataSourceElement } from "../../source";
import { readPath, type DataRow } from "../../table";
import { imageKey } from "../../update";

const IMAGE_TYPES = new Set(["image-url", "image-base64", "image-file"]);

/**
 * Whether an image field holds a picture not saved in the file yet (not one the last Update
 * couldn't save): it takes an Update to download it. A field of another type never does.
 */
export function hasUnsavedImages(
  field: DataField,
  source: DataSourceElement,
  rows: readonly DataRow[],
  failed: ReadonlySet<string>,
): boolean {
  if (!IMAGE_TYPES.has(field.type)) return false;
  for (const row of rows) {
    let value: unknown;
    try {
      value = readPath(row, field.path);
    } catch {
      return false;
    }
    if (typeof value !== "string" || !value.trim()) continue;
    if (failed.has(value.trim())) continue;
    if (!(imageKey(value) in source.images)) return true;
  }
  return false;
}
