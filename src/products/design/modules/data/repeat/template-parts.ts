import type { DesignNode } from "../../core";
import { dataCopyTag } from "./repeat-fields";

/**
 * The template's layers a copy repeats, the template first and parents before their children (in
 * sibling order). Copies an iterator inside it made are left out with what they hold (that
 * iterator makes them again in each copy), and so are a catalog master's copies. A template that
 * is itself in an outer iterator's copy (a nested card's copy) keeps its layers, tagged by that
 * outer iterator.
 */
export function templateParts(template: DesignNode, tree: readonly DesignNode[]): DesignNode[] {
  const inside = new Set(tree.map((node) => node.id));
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
      const tag = dataCopyTag(kid);
      if ((tag && inside.has(tag.iterator)) || (kid as { catalogCopy?: unknown }).catalogCopy) {
        continue;
      }
      out.push(kid);
    }
  }
  return out;
}
