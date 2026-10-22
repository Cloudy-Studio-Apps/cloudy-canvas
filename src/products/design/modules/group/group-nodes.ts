import {
  unionRects,
  type CanvasDocument,
  type CanvasElement,
  type ElementKinds,
  type ElementPatch,
} from "@canvas";

import { childrenByParent, isDesignNode, nextLayerName, type DesignNode } from "../core";
import { createGroup } from "./group.factory";
import { isGroup } from "./group-tree";

/**
 * Puts the nodes (those whose ancestors aren't among them) into a new group, as one undo step,
 * where the topmost of them was. Returns the group's id, or `null` when there was nothing to group.
 * `elements` are the scene's, bottom to top.
 */
export function groupNodes(
  doc: CanvasDocument,
  ids: ReadonlySet<string>,
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
): string | null {
  const byId = new Map(elements.map((el) => [el.id, el]));
  const hasSelectedAncestor = (node: DesignNode) => {
    for (
      let id = node.parentId;
      id;
      id = (byId.get(id) as DesignNode | undefined)?.parentId ?? null
    ) {
      if (ids.has(id)) return true;
    }
    return false;
  };
  const nodes = elements.filter(
    (el): el is DesignNode => ids.has(el.id) && isDesignNode(el) && !hasSelectedAncestor(el),
  );
  const topmost = nodes[nodes.length - 1];
  if (!topmost) return null;

  const rect = unionRects(nodes.map((node) => kinds.kindOf(node).bounds(node)))!;
  const name = nextLayerName(doc.all(), "Group");
  const group = createGroup(rect, name, topmost.index, topmost.parentId);
  doc.checkpoint();
  doc.add(group);
  doc.updateMany(new Map(nodes.map((node) => [node.id, { parentId: group.id } as ElementPatch])));
  return group.id;
}

/**
 * Dissolves the groups among `ids`: their children go to the group's parent, and the groups are
 * removed, as one undo step. Returns the children (to select them).
 */
export function ungroupNodes(
  doc: CanvasDocument,
  ids: ReadonlySet<string>,
  elements: readonly CanvasElement[],
): string[] {
  const groups = elements.filter((el) => ids.has(el.id) && isGroup(el)) as DesignNode[];
  if (groups.length === 0) return [];
  const children = childrenByParent(elements);
  const patches = new Map<string, ElementPatch>();
  for (const group of groups) {
    for (const child of children.get(group.id) ?? []) {
      patches.set(child, { parentId: group.parentId } as ElementPatch);
    }
  }
  doc.checkpoint();
  doc.updateMany(patches);
  doc.remove(groups.map((group) => group.id));
  return [...patches.keys()];
}

/** Removes groups left empty (their children deleted or moved out), in the current undo step. */
export function pruneEmptyGroups(doc: CanvasDocument): void {
  for (;;) {
    const all = doc.all();
    const parents = new Set(all.map((el) => (isDesignNode(el) ? el.parentId : null)));
    const empty = all.filter((el) => isGroup(el) && !parents.has(el.id)).map((el) => el.id);
    if (empty.length === 0) return;
    doc.remove(empty);
  }
}
