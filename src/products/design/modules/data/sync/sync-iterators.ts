import type { CanvasDocument, ElementPatch } from "@canvas";

import type { DesignNode } from "../../core";
import { isFrame } from "../../frame";
import type { BindingContext } from "../bindings";
import { emptyCopyPlan, planDataCopies, repeatOf, writeDataCopies } from "../repeat";
import type { DataScopes } from "../repeat";
import { planLayer } from "./plan-layer";

/** How deep a layer sits (its ancestors' count): outer iterators go first. */
function depthOf(doc: CanvasDocument, id: string): number {
  let depth = 0;
  const seen = new Set<string>([id]);
  for (let p = doc.field(id, "parentId"); typeof p === "string" && !seen.has(p); depth++) {
    seen.add(p);
    p = doc.field(p, "parentId");
  }
  return depth;
}

/**
 * Brings one iterator in step and fills what it holds: its rows (but the one the template shows)
 * planned against its copies (`planDataCopies`) and written (`writeDataCopies`), then every layer
 * whose nearest iterator it is planned in its row's scope, the template's and the copies' alike.
 * Copies get no hand-edit rules: the sync wrote them, and they follow their template (a hand edit
 * of a copy, which only an agent can make on a locked layer, is written over). Returns the
 * iterators inside it (its template's and its copies'), which are brought in step after it.
 */
function syncIterator(
  doc: CanvasDocument,
  id: string,
  scopes: DataScopes,
  ctx: BindingContext,
): string[] {
  const frame = doc.get(id);
  if (!isFrame(frame)) return [];
  const it = scopes.iterator(frame);
  const template = scopes.templateOf(frame);
  const subtree = (root: DesignNode): DesignNode[] => {
    const out = [root];
    for (let i = 0; i < out.length; i++) out.push(...scopes.children((out[i] as DesignNode).id));
    return out;
  };
  const existing: DesignNode[] = [];
  for (const child of scopes.children(frame.id)) {
    if (child.id !== template?.id) existing.push(...subtree(child));
  }
  if (template) {
    const rows = it
      ? it.rows.rows
          .filter((row) => row.index !== it.preview)
          .map(({ key, index }) => ({ key, index }))
      : [];
    const plan = planDataCopies(
      frame,
      template,
      subtree(template),
      existing,
      rows,
      it?.repeat.detached ?? [],
    );
    if (!emptyCopyPlan(plan)) {
      writeDataCopies(doc, plan);
      // A copied iterator inside may have taken a new `repeat` from the template's.
      scopes.invalidate(plan.patch.filter(({ patch }) => "repeat" in patch).map(({ id }) => id));
    }
  } else {
    // Nothing left to repeat: every child is one of its copies, and they go.
    if (existing.length > 0) {
      doc.remove(existing.map((el) => el.id));
      scopes.invalidate();
    }
  }

  const patches = new Map<string, ElementPatch>();
  const nested: string[] = [];
  const stack = [...scopes.children(frame.id)];
  for (let el = stack.pop(); el; el = stack.pop()) {
    const patch = planLayer(el, undefined, true, scopes.scopeFor(el), ctx);
    if (patch) patches.set(el.id, patch);
    // An iterator inside fills its own children, in its own turn.
    if (repeatOf(el)) nested.push(el.id);
    else stack.push(...scopes.children(el.id));
  }
  if (patches.size > 0) doc.updateMany(patches);
  return nested;
}

/**
 * Brings iterators in step, outermost first: an iterator inside a template is copied with it
 * (its `repeat` too), and each copy of it then makes its own copies in its copy's row scope.
 * Each iterator is done once per sync.
 */
export function syncIterators(
  doc: CanvasDocument,
  ids: readonly string[],
  scopes: DataScopes,
  ctx: BindingContext,
): void {
  const pending = new Map<string, number>();
  const done = new Set<string>();
  const queue = (id: string) => {
    if (!done.has(id) && !pending.has(id)) pending.set(id, depthOf(doc, id));
  };
  ids.forEach(queue);
  while (pending.size > 0) {
    let next = "";
    let least = Infinity;
    for (const [id, depth] of pending) {
      if (depth < least) [next, least] = [id, depth];
    }
    pending.delete(next);
    done.add(next);
    syncIterator(doc, next, scopes, ctx).forEach(queue);
  }
}
