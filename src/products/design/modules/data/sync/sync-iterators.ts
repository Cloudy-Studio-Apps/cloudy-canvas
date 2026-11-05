import type { CanvasDocument, ElementPatch } from "@canvas";

import type { DesignNode } from "../../core";
import { isFrame } from "../../frame";
import type { BindingContext } from "../bindings";
import { dataCopyTag, emptyCopyPlan, planDataCopies, repeatOf, writeDataCopies } from "../repeat";
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
  ctxOf: (el: DesignNode) => BindingContext,
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
  if (it?.unreadable) {
    // Its list can't be read on this device (a snapshot not here yet, or broken): the copies stay
    // as they are rather than all go; their layers' unreadable fields are left alone too.
  } else if (template) {
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
    // Nothing left to repeat: its copies go (its other layers, a detached copy, stay). A card
    // named but gone (moved out of the frame) takes the repeat too; a copied iterator's is its
    // template's to say.
    const copies = scopes
      .children(frame.id)
      .filter((child) => dataCopyTag(child)?.iterator === frame.id)
      .flatMap(subtree);
    const named = repeatOf(frame)?.template !== undefined && !dataCopyTag(frame);
    if (copies.length > 0) doc.remove(copies.map((el) => el.id));
    if (named) doc.update(frame.id, { repeat: null } as ElementPatch);
    if (copies.length > 0 || named) scopes.invalidate(named ? [frame.id] : []);
  }

  const patches = new Map<string, ElementPatch>();
  const nested: string[] = [];
  const stack = [...scopes.children(frame.id)];
  for (let el = stack.pop(); el; el = stack.pop()) {
    const patch = planLayer(el, undefined, true, scopes.scopeFor(el), ctxOf(el));
    if (patch) patches.set(el.id, patch);
    // An iterator inside fills its own children, in its own turn; so does a frame that stopped
    // repeating but still holds its copies (a copied iterator whose template's repeat went), whose
    // turn removes them.
    const kids = scopes.children(el.id);
    if (repeatOf(el) || kids.some((kid) => dataCopyTag(kid)?.iterator === el.id)) {
      nested.push(el.id);
    } else stack.push(...kids);
  }
  if (patches.size > 0) doc.updateMany(patches);
  return nested;
}

/**
 * Brings iterators in step, outermost first: an iterator inside a template is copied with it
 * (its `repeat` too), and each copy of it then makes its own copies in its copy's row scope.
 * Each iterator is done once per sync. `ctxOf` gives a layer's binding context (its language).
 */
export function syncIterators(
  doc: CanvasDocument,
  ids: readonly string[],
  scopes: DataScopes,
  ctxOf: (el: DesignNode) => BindingContext,
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
    syncIterator(doc, next, scopes, ctxOf).forEach(queue);
  }
}
