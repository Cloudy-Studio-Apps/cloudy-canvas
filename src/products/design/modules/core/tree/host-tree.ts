import type { CanvasDocument, CanvasElement, ElementKinds } from "@canvas";

import { DesignNodeKind, isDesignNode } from "../node";

/**
 * The child hosts (groups, booleans) round `id`, outermost first, up to the first ancestor that
 * isn't one.
 */
export function enclosingHosts(
  id: string,
  byId: ReadonlyMap<string, CanvasElement>,
  kinds: ElementKinds,
): string[] {
  const hosts: string[] = [];
  const seen = new Set([id]);
  let el = byId.get(id);
  while (el && isDesignNode(el) && el.parentId && !seen.has(el.parentId)) {
    const parent = byId.get(el.parentId);
    if (!parent || !isChildHost(parent, kinds)) break;
    seen.add(el.parentId);
    hosts.unshift(el.parentId);
    el = parent;
  }
  return hosts;
}

/** Whether an element is made of its children (a group, a boolean). */
export function isChildHost(el: CanvasElement, kinds: ElementKinds): boolean {
  const kind = kinds.kindOf(el);
  return kind instanceof DesignNodeKind && kind.childHost;
}

/**
 * Removes hosts of these types left empty (their children deleted or moved out), in the current
 * undo step; a host emptied by that goes too.
 */
export function pruneEmptyHosts(doc: CanvasDocument, types: ReadonlySet<string>): void {
  for (;;) {
    const all = doc.all();
    const parents = new Set(all.map((el) => (isDesignNode(el) ? el.parentId : null)));
    const empty = all.filter((el) => types.has(el.type) && !parents.has(el.id)).map((el) => el.id);
    if (empty.length === 0) return;
    doc.remove(empty);
  }
}
