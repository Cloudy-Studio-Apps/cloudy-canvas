import type { CanvasElement, ElementKind, ElementKinds } from "@canvas";

import type { DesignNodeKind } from "../../node/design-node.kind";
import type { DesignNode } from "../../node/design-node.types";
import { isDesignNode } from "../../node/is-design-node";

/** Whether a kind holds layers: a container (frame, section) or a child host (group, boolean). */
export function holdsLayers(kind: ElementKind): kind is DesignNodeKind {
  // Checked by shape, so the node folder can use this without a runtime import cycle.
  const node = kind as unknown as Partial<DesignNodeKind>;
  return node.canGoInto !== undefined && (node.container === true || node.childHost === true);
}

/**
 * Why `node` can't go into `parent` (`null`: the top of the page), or `null` when it can: the
 * parent must hold layers, take this kind (sections only go into sections), be on the same page
 * and not be the node or something inside it. The one rule set every move follows.
 */
export function moveIntoProblem(
  node: CanvasElement,
  parent: CanvasElement | null,
  kinds: ElementKinds,
  byId: ReadonlyMap<string, CanvasElement>,
): string | null {
  if (!parent) return null;
  if (!isDesignNode(parent)) return `No layer with id ${parent.id}.`;
  const parentKind = kinds.kindOf(parent);
  if (!holdsLayers(parentKind)) {
    return `A ${parentKind.label} can't hold layers: put them in a frame, a section or a group.`;
  }
  const nodeKind = kinds.kindOf(node);
  const goesInto = (nodeKind as unknown as Partial<DesignNodeKind>).canGoInto?.bind(nodeKind);
  if (goesInto && !goesInto(parent, parentKind)) {
    return `A ${nodeKind.label} can't go into a ${parentKind.label}.`;
  }
  const page = isDesignNode(node) ? node.pageId : "";
  if (page && parent.pageId && page !== parent.pageId) {
    return "A layer can only go into a layer on its own page (use move_nodes_to_page).";
  }
  const seen = new Set<string>();
  for (let at: DesignNode | undefined = parent; at;) {
    if (at.id === node.id) return "A layer can't go into itself or what it holds.";
    seen.add(at.id);
    const up: CanvasElement | undefined =
      at.parentId && !seen.has(at.parentId) ? byId.get(at.parentId) : undefined;
    at = up && isDesignNode(up) ? up : undefined;
  }
  return null;
}
