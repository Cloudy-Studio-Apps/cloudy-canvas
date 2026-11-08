import type { ProjectRecord } from "./project-registry.types";

/** Whether a value read from `projects.json` is a well-formed record. */
export function isProjectRecord(value: unknown): value is ProjectRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.root === "string" &&
    typeof record.color === "string" &&
    typeof record.pinned === "boolean" &&
    typeof record.openedAt === "string"
  );
}
