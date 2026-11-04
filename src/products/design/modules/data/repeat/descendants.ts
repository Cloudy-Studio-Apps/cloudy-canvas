import type { CanvasDocument } from "@canvas";

import { isDesignNode, type DesignNode } from "../../core";

/** Every layer under `root` (not `root` itself), parents before their children. */
export function descendants(doc: CanvasDocument, root: string): DesignNode[] {
  const children = new Map<string, DesignNode[]>();
  for (const el of doc.all()) {
    if (!isDesignNode(el) || !el.parentId) continue;
    const list = children.get(el.parentId);
    if (list) list.push(el);
    else children.set(el.parentId, [el]);
  }
  const out = [...(children.get(root) ?? [])];
  for (let i = 0; i < out.length; i++) {
    out.push(...(children.get((out[i] as DesignNode).id) ?? []));
  }
  return out;
}
