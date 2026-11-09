import type { ToolArgs } from "@canvas";

import { readFieldFormat, type DataField, type DataSourceElement, type FieldType } from "../source";
import { normalizePath } from "../table";

/** Every field type, for validating what an agent sets. */
export const FIELD_TYPES: readonly FieldType[] = [
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

/** The source's fields with an agent's `fields` patches applied by path; unknown paths are errors. */
export function patchFields(source: DataSourceElement, args: ToolArgs): DataField[] | undefined {
  const patches = args.fields;
  if (patches === undefined || patches === null) return undefined;
  if (!Array.isArray(patches)) throw new Error('"fields" must be an array of objects.');
  const fields = source.fields.map((f) => ({ ...f }));
  patches.forEach((patch: unknown, i) => {
    const where = `fields[${i}]`;
    if (typeof patch !== "object" || patch === null) throw new Error(`${where} must be an object.`);
    const p = patch as Record<string, unknown>;
    const field =
      typeof p.path === "string"
        ? fields.find((f) => normalizePath(f.path) === normalizePath(p.path as string))
        : undefined;
    if (typeof p.path !== "string" || !field) {
      throw new Error(`${where}: no field "${String(p.path)}" (see data_source_get).`);
    }
    if (p.alias !== undefined) {
      if (typeof p.alias !== "string") throw new Error(`${where}.alias must be text.`);
      if (p.alias === "") delete field.alias;
      else field.alias = p.alias;
    }
    if (p.type !== undefined) {
      if (!FIELD_TYPES.includes(p.type as FieldType)) {
        throw new Error(`${where}.type must be one of: ${FIELD_TYPES.join(", ")}.`);
      }
      field.type = p.type as FieldType;
    }
    if (p.format !== undefined) field.format = readFieldFormat(p.format, where);
    if (p.hidden !== undefined) {
      if (typeof p.hidden !== "boolean") throw new Error(`${where}.hidden must be true or false.`);
      field.hidden = p.hidden;
    }
  });
  return fields;
}
