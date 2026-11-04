import type { DesignNode } from "../../core";
import type { DataCopyPatch, DataCopyPlan } from "./plan-data-copies.types";

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

/**
 * The `repeat` a copy of an iterator inside a template takes: its template layer's as it is,
 * `detached` included (the template's detached copies are template content, which comes along
 * in each outer copy as plain layers, so their rows must stay detached there too), with its
 * `template` naming the copy of the inner template (`templateCopy`; else the copy's own, else the
 * template's), so each copied iterator repeats its own child. `null` when the template layer's
 * `repeat` isn't a record (it's mirrored as any field is).
 */
export function copiedRepeat(
  templateRepeat: unknown,
  copyRepeat: unknown,
  templateCopy: string | undefined,
): Record<string, unknown> | null {
  if (!isObject(templateRepeat)) return null;
  const out: Record<string, unknown> = { ...templateRepeat };
  if (templateCopy) out.template = templateCopy;
  else if (isObject(copyRepeat) && typeof copyRepeat.template === "string") {
    out.template = copyRepeat.template;
  }
  return out;
}

/** A layer's stored `repeat` record as it is, `null` when it has none. */
export function repeatField(node: object): Record<string, unknown> | null {
  const raw = (node as Record<string, unknown>).repeat;
  return isObject(raw) ? raw : null;
}

/**
 * Gives each copied iterator of one row's copy its own `repeat` (`copiedRepeat`): its template
 * layer's, `detached` mirrored, with `template` naming the copy of the inner template. A fresh
 * copy takes it as it's added; a kept one is patched only when it differs. `patches` is the
 * plan's patches by id (kept in step with `plan.patch`), so nothing is searched per layer.
 */
export function copiedIterators(
  parts: readonly DesignNode[],
  idFor: ReadonlyMap<string, string>,
  fresh: readonly DesignNode[],
  existing: ReadonlyMap<string, DesignNode>,
  plan: DataCopyPlan,
  patches: Map<string, DataCopyPatch>,
): void {
  let freshById: Map<string, DesignNode> | null = null;
  for (const part of parts) {
    const repeat = repeatField(part);
    const id = idFor.get(part.id);
    if (!repeat || !id) continue;
    const inner = typeof repeat.template === "string" ? idFor.get(repeat.template) : undefined;
    freshById ??= new Map(fresh.map((node) => [node.id, node]));
    const added = freshById.get(id);
    if (added) {
      (added as unknown as Record<string, unknown>).repeat = copiedRepeat(repeat, null, inner);
      continue;
    }
    const copy = existing.get(id);
    if (!copy) continue;
    const was = repeatField(copy);
    const want = copiedRepeat(repeat, was, inner);
    if (JSON.stringify(was) === JSON.stringify(want)) continue;
    const entry = patches.get(id);
    const patch = { repeat: want } as Partial<DesignNode>;
    if (entry) entry.patch = { ...entry.patch, ...patch };
    else {
      const added = { id, patch };
      plan.patch.push(added);
      patches.set(id, added);
    }
  }
}
