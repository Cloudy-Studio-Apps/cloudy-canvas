import type { TrashEntry } from "./trash-index.types";

function parseEntry(value: unknown, index: number): TrashEntry {
  const e = value as Record<string, unknown> | null;
  if (
    typeof e !== "object" ||
    e === null ||
    typeof e.id !== "string" ||
    typeof e.name !== "string" ||
    typeof e.from !== "string" ||
    typeof e.deletedAt !== "string" ||
    typeof e.size !== "number" ||
    typeof e.folder !== "boolean"
  ) {
    throw new Error(`Trash index: entry ${index} is malformed`);
  }
  return {
    id: e.id,
    name: e.name,
    from: e.from,
    deletedAt: e.deletedAt,
    size: e.size,
    folder: e.folder,
  };
}

/** Reads `.cloudy/trash/index.json`; an empty text is an empty trash. */
export function parseTrashIndex(text: string): TrashEntry[] {
  if (text.trim() === "") return [];
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Trash index: not valid JSON");
  }
  if (!Array.isArray(data)) throw new Error("Trash index: must be an array");
  return data.map(parseEntry);
}

export function serializeTrashIndex(entries: TrashEntry[]): string {
  return JSON.stringify(entries, null, 2);
}
