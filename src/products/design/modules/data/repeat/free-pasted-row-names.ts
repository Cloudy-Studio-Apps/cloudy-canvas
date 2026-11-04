import type { CanvasElement } from "@canvas";

import { isDesignNode } from "../../core";
import { isDataSource } from "../source";
import { firstFreeRowName } from "./check-repeat";
import { renamedReferences } from "./rename-references";
import { renameRepeatPaths } from "./rename-repeat-paths";
import { dataCopyTag, repeatOf } from "./repeat-fields";

const parentOf = (el: CanvasElement | undefined): string | null =>
  el && isDesignNode(el) ? el.parentId : null;

/**
 * Pasted iterators whose row name (`as`) would hide something where they land: a source of the
 * target document by that name, or the row name of an iterator around the paste. Each such one
 * takes the first free name (`firstFreeRowName`: not those, nor a row name of a pasted iterator
 * inside it) and what reads it in the pasted layers under it follows (`renamedReferences`), as
 * `setRepeat` would refuse the name. Outermost first; `existing` is the document before the paste.
 */
export function freePastedRowNames(
  copies: CanvasElement[],
  existing: readonly CanvasElement[],
): CanvasElement[] {
  const pasted = new Map(copies.map((el) => [el.id, el]));
  const before = new Map(existing.map((el) => [el.id, el]));
  const at = (id: string) => pasted.get(id) ?? before.get(id);
  const sources = new Set(
    [...existing, ...copies].filter(isDataSource).map((source) => source.name),
  );
  /** The ancestors of `el` among the pasted layers and the document, nearest first. */
  const ancestors = (el: CanvasElement): string[] => {
    const out: string[] = [];
    for (let p = parentOf(el); p !== null && p !== el.id && !out.includes(p); p = parentOf(at(p))) {
      out.push(p);
    }
    return out;
  };
  const iterators = copies
    .filter((el) => repeatOf(el) && !dataCopyTag(el))
    .map((el) => ({ id: el.id, depth: ancestors(el).length }))
    .sort((a, b) => a.depth - b.depth);
  if (iterators.length === 0) return copies;

  for (const { id } of iterators) {
    const frame = pasted.get(id);
    const repeat = frame ? repeatOf(frame) : null;
    if (!frame || !repeat) continue;
    const around = new Set<string>();
    for (const p of ancestors(frame)) {
      const el = at(p);
      const as = el ? repeatOf(el)?.as : undefined;
      if (as) around.add(as);
    }
    if (!sources.has(repeat.as) && !around.has(repeat.as)) continue;
    // What's under it among the pasted layers, and the row names used there.
    const under: CanvasElement[] = [];
    const inside = new Set<string>();
    for (const el of pasted.values()) {
      if (!ancestors(el).includes(id)) continue;
      under.push(el);
      const as = repeatOf(el)?.as;
      if (as) inside.add(as);
    }
    const as = firstFreeRowName((n) => sources.has(n) || around.has(n) || inside.has(n));
    const stored = (frame as unknown as Record<string, unknown>).repeat as Record<string, unknown>;
    const record = { ...stored, as };
    const renamed = renameRepeatPaths(record, repeat.as, as, { source: false, row: true });
    pasted.set(id, { ...frame, repeat: renamed ?? record } as CanvasElement);
    const view = { parentOf: (k: string) => parentOf(pasted.get(k)), get: at, under };
    for (const [k, patch] of renamedReferences(view, repeat.as, as, id)) {
      const el = pasted.get(k);
      if (el) pasted.set(k, { ...el, ...patch } as CanvasElement);
    }
  }
  return copies.map((el) => pasted.get(el.id) ?? el);
}
