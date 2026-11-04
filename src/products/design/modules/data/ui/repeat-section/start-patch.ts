import { lookup, type DataScope } from "../../bindings";
import type { RepeatSettings } from "../../repeat";

/** Copies made while designing when a long list is picked: the rest show in an export. */
const DESIGN_LIMIT = 24;

/**
 * What turning a repeat on writes for a list picked in the frame's `scope`: the list, and for
 * one longer than 24 rows `designLimit: 24`, so the document stays light.
 */
export function startPatch(scope: DataScope, source: string): Partial<RepeatSettings> {
  const rows = lookup(scope, source)?.value;
  const long = Array.isArray(rows) && rows.length > DESIGN_LIMIT;
  return { source, ...(long ? { designLimit: DESIGN_LIMIT } : {}) };
}
