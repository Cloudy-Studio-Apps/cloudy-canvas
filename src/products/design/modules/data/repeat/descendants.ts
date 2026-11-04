import type { CanvasDocument } from "@canvas";

import { isDesignNode, type DesignNode } from "../../core";

/** Every layer's children by parent id, read from the document in one pass. */
export function childrenMap(doc: CanvasDocument): Map<string, DesignNode[]> {
  const children = new Map<string, DesignNode[]>();
  for (const el of doc.all()) {
    if (!isDesignNode(el) || !el.parentId) continue;
    const list = children.get(el.parentId);
    if (list) list.push(el);
    else children.set(el.parentId, [el]);
  }
  return children;
}

/** Every layer under the `roots` (not the roots), parents before their children, each once. */
export function walkDescendants(
  children: ReadonlyMap<string, readonly DesignNode[]>,
  roots: Iterable<string>,
): DesignNode[] {
  const out: DesignNode[] = [];
  const seen = new Set<string>();
  for (const root of roots) {
    const start = out.length;
    out.push(...(children.get(root) ?? []).filter((el) => !seen.has(el.id)));
    for (let i = start; i < out.length; i++) {
      const el = out[i] as DesignNode;
      if (seen.has(el.id)) continue;
      seen.add(el.id);
      out.push(...(children.get(el.id) ?? []).filter((kid) => !seen.has(kid.id)));
    }
  }
  return out;
}

/** Every layer under `root` (not `root` itself), parents before their children. */
export function descendants(doc: CanvasDocument, root: string): DesignNode[] {
  return walkDescendants(childrenMap(doc), [root]);
}
