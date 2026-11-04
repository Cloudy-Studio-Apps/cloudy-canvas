import type { CanvasElement } from "@canvas";

import type { ConditionOp, DataCondition } from "../bindings";
import type { DataCopyTag, RepeatSettings, SortRule } from "./repeat.types";

const OPS: ReadonlySet<string> = new Set<ConditionOp>([
  "exists",
  "empty",
  "eq",
  "neq",
  "gt",
  "lt",
  "contains",
]);

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

const count = (v: unknown): number | undefined =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : undefined;

function condition(raw: unknown): DataCondition | null {
  if (!isObject(raw) || typeof raw.path !== "string" || typeof raw.op !== "string") return null;
  if (!OPS.has(raw.op)) return null;
  const out: DataCondition = { path: raw.path, op: raw.op as ConditionOp };
  if (typeof raw.value === "string" || typeof raw.value === "number") out.value = raw.value;
  return out;
}

function sortRule(raw: unknown): SortRule | null {
  if (!isObject(raw) || typeof raw.path !== "string" || !raw.path) return null;
  return raw.descending === true ? { path: raw.path, descending: true } : { path: raw.path };
}

/** What a frame repeats, read defensively (frames only; anything malformed gives `null`). */
export function repeatOf(el: CanvasElement): RepeatSettings | null {
  if (el.type !== "frame") return null;
  const raw = (el as unknown as Record<string, unknown>).repeat;
  if (!isObject(raw) || typeof raw.source !== "string" || !raw.source) return null;
  const out: RepeatSettings = {
    source: raw.source,
    as: typeof raw.as === "string" && raw.as ? raw.as : "item",
    filter: Array.isArray(raw.filter)
      ? raw.filter.map(condition).filter((c): c is DataCondition => c !== null)
      : [],
    sort: Array.isArray(raw.sort)
      ? raw.sort.map(sortRule).filter((r): r is SortRule => r !== null)
      : [],
    detached: Array.isArray(raw.detached)
      ? raw.detached.filter((k): k is string => typeof k === "string")
      : [],
  };
  if (typeof raw.key === "string" && raw.key) out.key = raw.key;
  const limit = count(raw.limit);
  if (limit !== undefined) out.limit = limit;
  const designLimit = count(raw.designLimit);
  if (designLimit !== undefined) out.designLimit = designLimit;
  const previewRow = count(raw.previewRow);
  if (previewRow !== undefined) out.previewRow = previewRow;
  return out;
}

/** The tag of a copy of an iterator's template, read defensively; `null` for any other layer. */
export function dataCopyTag(el: CanvasElement): DataCopyTag | null {
  const raw = (el as unknown as Record<string, unknown>).dataCopy;
  if (!isObject(raw)) return null;
  const { iterator, key, source } = raw;
  if (typeof iterator !== "string" || typeof key !== "string" || typeof source !== "string") {
    return null;
  }
  return { iterator, key, source };
}
