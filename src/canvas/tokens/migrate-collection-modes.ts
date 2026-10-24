import { createId } from "@shared/core";

import { DEFAULT_VALUE } from "./default-value";
import type { CollectionModesMigration } from "./migrate-collection-modes.types";
import type { ModeAxisRecord, TokenRecord, TokenValue, VariableRecord } from "./token.types";

/**
 * Files from before mode axes kept modes on collections and a value per mode on each variable:
 * a collection with several modes becomes an axis of its own (its variables vary by it, the first
 * mode's values becoming their defaults); one with a single mode just gives its values as
 * defaults. `null` when there's nothing to bring up to date.
 */
export function migrateCollectionModes(
  records: readonly TokenRecord[],
): CollectionModesMigration | null {
  const out: TokenRecord[] = [];
  const axisOf = new Map<string, string>();
  const baseOf = new Map<string, string>();
  for (const record of records) {
    if (record.kind !== "collection" || !record.modes) continue;
    const { modes, ...folder } = record;
    out.push(folder);
    const base = modes[0]?.id;
    if (base) baseOf.set(record.id, base);
    if (modes.length > 1) {
      const axis: ModeAxisRecord = {
        kind: "axis",
        id: createId(),
        name: record.name,
        modes,
        order: record.order,
      };
      out.push(axis);
      axisOf.set(record.id, axis.id);
    }
  }
  for (const record of records) {
    if (record.kind !== "variable" || DEFAULT_VALUE in record.values) continue;
    const base = baseOf.get(record.collectionId);
    const values: Record<string, TokenValue> = {};
    for (const [mode, value] of Object.entries(record.values)) {
      values[mode === base ? DEFAULT_VALUE : mode] = value;
    }
    const axisId = axisOf.get(record.collectionId) ?? null;
    const variable: VariableRecord = {
      ...record,
      axisId,
      values: axisId ? values : pick(values, DEFAULT_VALUE),
    };
    out.push(variable);
  }
  return out.length > 0 ? { records: out, axisOf } : null;
}

function pick(values: Record<string, TokenValue>, key: string): Record<string, TokenValue> {
  const value = values[key];
  return value ? { [key]: value } : {};
}
