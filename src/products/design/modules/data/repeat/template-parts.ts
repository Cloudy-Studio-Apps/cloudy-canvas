import type { DesignNode } from "../../core";
import { dataCopyTag } from "./repeat-fields";

/**
 * The template's layers a copy repeats, the template first and parents before their children (in
 * sibling order). Copies another iterator made inside it are left out with what they hold (that
 * iterator makes them again in each copy), and so are a catalog master's copies.
 */
export function templateParts(template: DesignNode, tree: readonly DesignNode[]): DesignNode[] {
  const children = new Map<string, DesignNode[]>();
  for (const node of tree) {
    if (node.id === template.id || node.parentId === null) continue;
    const list = children.get(node.parentId);
    if (list) list.push(node);
    else children.set(node.parentId, [node]);
  }
  const out: DesignNode[] = [template];
  for (let i = 0; i < out.length; i++) {
    const kids = [...(children.get((out[i] as DesignNode).id) ?? [])];
    kids.sort((a, b) => (a.index < b.index ? -1 : a.index > b.index ? 1 : 0));
    for (const kid of kids) {
      if (dataCopyTag(kid) || (kid as { catalogCopy?: unknown }).catalogCopy) continue;
      out.push(kid);
    }
  }
  return out;
}
