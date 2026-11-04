import type { CanvasDocument } from "@canvas";

import { CONDITION_OPS, lookup, readsUnreadable } from "../bindings";
import type { DataScope } from "../bindings";
import { RESERVED_NAMES } from "../model/source-name";
import { dataSourcesIn } from "../source";
import { parsePath } from "../table";
import { descendants } from "./descendants";
import { repeatOf } from "./repeat-fields";
import type { RepeatSettings } from "./repeat.types";

// `setRepeat`'s checks: each throws an English error naming what's wrong, before anything is written.

const ROW_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** The brochure's placeholders a row name can't take (`item` is the default row name itself). */
const PLACEHOLDERS: ReadonlySet<string> = new Set(RESERVED_NAMES.filter((n) => n !== "item"));

/** Throws unless `expr` is a data expression starting with a name. */
function checkPath(expr: unknown, where: string): void {
  if (typeof expr !== "string" || !expr) throw new Error(`${where}: the data path is empty.`);
  let first;
  try {
    first = parsePath(expr)[0];
  } catch {
    throw new Error(`${where}: "${expr}" isn't a data path.`);
  }
  if (!first || !("key" in first)) throw new Error(`${where}: "${expr}" must start with a name.`);
}

/** The row names of the iterators around `frameId` and inside it (not its own). */
function nearbyRowNames(doc: CanvasDocument, frameId: string): Map<string, string> {
  const names = new Map<string, string>();
  const seen = new Set([frameId]);
  for (let p = doc.field(frameId, "parentId"); typeof p === "string" && !seen.has(p);) {
    seen.add(p);
    const el = doc.get(p);
    const as = el ? repeatOf(el)?.as : undefined;
    if (as && !names.has(as)) names.set(as, "an iterator around it");
    p = doc.field(p, "parentId");
  }
  for (const el of descendants(doc, frameId)) {
    const as = repeatOf(el)?.as;
    if (as && !names.has(as)) names.set(as, "an iterator inside it");
  }
  return names;
}

/** Why `as` can't be the row name of the iterator `frameId`, `null` when it can. */
export function rowNameProblem(doc: CanvasDocument, frameId: string, as: unknown): string | null {
  if (typeof as !== "string" || !ROW_NAME.test(as)) {
    return `"${String(as)}" isn't a name: use letters, digits and _, not starting with a digit.`;
  }
  if (PLACEHOLDERS.has(as)) return `"${as}" is one of the brochure's own placeholders.`;
  if (dataSourcesIn(doc).some((source) => source.name === as)) {
    return `"${as}" is a data source's name, which it would hide inside the iterator.`;
  }
  const near = nearbyRowNames(doc, frameId).get(as);
  return near ? `"${as}" is already the row name of ${near}.` : null;
}

/** The first free row name: `item`, else `item_2`, `item_3`… */
export function freeRowName(doc: CanvasDocument, frameId: string): string {
  if (!rowNameProblem(doc, frameId, "item")) return "item";
  for (let n = 2; ; n++) if (!rowNameProblem(doc, frameId, `item_${n}`)) return `item_${n}`;
}

/** Throws unless `source` reads a list in the frame's scope (a source not readable here passes). */
export function checkRepeatSource(scope: DataScope, source: unknown): void {
  checkPath(source, "repeat.source");
  const expr = source as string;
  if (readsUnreadable(scope, expr)) return;
  if (!Array.isArray(lookup(scope, expr)?.value)) {
    throw new Error(`repeat.source: "${expr}" isn't a list here.`);
  }
}

const whole = (v: unknown) => v === undefined || (Number.isInteger(v) && (v as number) >= 0);

/** The rest of a repeat's shape: its key, filter, sort, caps and detached keys. */
export function checkRepeatRules(repeat: RepeatSettings): void {
  if (repeat.key !== undefined) checkPath(repeat.key, "repeat.key");
  if (!Array.isArray(repeat.filter)) throw new Error("repeat.filter: a list of conditions.");
  repeat.filter.forEach((c, i) => {
    const where = `repeat.filter[${i}]`;
    checkPath(c?.path, where);
    if (!CONDITION_OPS.includes(c.op)) {
      throw new Error(`${where}: "${String(c.op)}" isn't a condition (${CONDITION_OPS}).`);
    }
    const value: unknown = c.value;
    if (value !== undefined && typeof value !== "string" && typeof value !== "number") {
      throw new Error(`${where}: the value must be a text or a number.`);
    }
  });
  if (!Array.isArray(repeat.sort)) throw new Error("repeat.sort: a list of { path, descending }.");
  repeat.sort.forEach((rule, i) => {
    checkPath(rule?.path, `repeat.sort[${i}]`);
    if (rule.descending !== undefined && typeof rule.descending !== "boolean") {
      throw new Error(`repeat.sort[${i}]: descending is true or false.`);
    }
  });
  for (const field of ["limit", "designLimit", "previewRow"] as const) {
    if (!whole(repeat[field])) throw new Error(`repeat.${field}: a whole number, 0 or more.`);
  }
  if (!Array.isArray(repeat.detached) || repeat.detached.some((k) => typeof k !== "string")) {
    throw new Error("repeat.detached: a list of row keys.");
  }
}
