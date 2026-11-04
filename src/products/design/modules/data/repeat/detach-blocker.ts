import type { CanvasDocument, CanvasElement } from "@canvas";

import type { DesignNode } from "../../core";
import { isFrame } from "../../frame";
import { byIndex } from "./by-index";
import { childrenMap } from "./descendants";
import { dataCopyTag, repeatOf } from "./repeat-fields";
import { templateOf } from "./template-of";
import type { DetachBlocker } from "./detach-blocker.types";

/**
 * Why the copies of the iterator `iteratorId` can't be detached, `null` when they can: walking up
 * from it, a frame that is itself a copy (`inside-copy`: the outer iterator writes it), or one that
 * is the card of an iterator around it (`repeated-card`: the inner repeat is template content,
 * copied into every outer copy, so a detached row would show the same data in each). The detach
 * itself and the panel's Detach button both ask this.
 */
export function detachBlocker(doc: CanvasDocument, iteratorId: string): DetachBlocker | null {
  let tree: Map<string, DesignNode[]> | null = null;
  const seen = new Set<string>();
  for (let at: CanvasElement | undefined = doc.get(iteratorId); at && !seen.has(at.id);) {
    seen.add(at.id);
    if (dataCopyTag(at)) return "inside-copy";
    const parentId = doc.field(at.id, "parentId");
    const parent = typeof parentId === "string" ? doc.get(parentId) : undefined;
    if (parent && isFrame(parent) && repeatOf(parent)) {
      tree ??= childrenMap(doc);
      const kids = [...(tree.get(parent.id) ?? [])].sort(byIndex);
      if (templateOf(parent, kids)?.id === at.id) return "repeated-card";
    }
    at = parent;
  }
  return null;
}
