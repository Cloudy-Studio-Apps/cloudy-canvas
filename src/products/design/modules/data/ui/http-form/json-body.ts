import { createId } from "@shared/core";

import type { JsonProblem, JsonRow } from "./json-body.types";

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

/** Rows as JSON text: numbers and yes/no as themselves, empty as `null`. */
export function rowsToJson(rows: readonly JsonRow[]): string {
  const out: Record<string, unknown> = {};
  for (const row of rows) {
    const name = row.name.trim();
    if (!name) continue;
    if (row.kind === "number") out[name] = Number(row.value) || 0;
    else if (row.kind === "boolean") out[name] = row.value !== "false";
    else if (row.kind === "null") out[name] = null;
    else out[name] = row.value;
  }
  return JSON.stringify(out, null, 2);
}

/** JSON text as rows, or `null` when it isn't one flat object (nested parts stay code). */
export function jsonToRows(text: string): JsonRow[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.trim() === "" ? "{}" : text);
  } catch {
    return null;
  }
  if (!isPlainObject(parsed)) return null;
  const rows: JsonRow[] = [];
  for (const [name, v] of Object.entries(parsed)) {
    if (v !== null && typeof v === "object") return null;
    const kind =
      v === null
        ? "null"
        : typeof v === "number"
          ? "number"
          : typeof v === "boolean"
            ? "boolean"
            : "text";
    rows.push({ id: createId(), name, kind, value: v === null ? "" : String(v) });
  }
  return rows;
}

/** What's wrong with JSON text, or `null` when it parses (empty counts as fine). */
export function jsonProblem(text: string): JsonProblem | null {
  if (text.trim() === "") return null;
  try {
    JSON.parse(text);
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const position = /position (\d+)/.exec(message)?.[1];
    const lineMatch = /line (\d+)/.exec(message)?.[1];
    if (lineMatch) return { line: Number(lineMatch) };
    if (position) return { line: text.slice(0, Number(position)).split("\n").length };
    return { line: null };
  }
}

/** JSON text laid out with two spaces, or as it is when it doesn't parse. */
export function tidyJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}
