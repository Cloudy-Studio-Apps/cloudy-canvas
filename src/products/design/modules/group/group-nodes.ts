import {
  type CanvasDocument,
  type CanvasElement,
  type ElementKinds,
  type ElementPatch,
} from "@canvas";

import {
  childrenByParent,
  nextLayerName,
  pruneEmptyHosts,
  selectionRoots,
  wrapNodes,
  type DesignNode,
} from "../core";
import { GROUP_TYPE } from "./group.constants";
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
  const nodes = selectionRoots(ids, elements);
  if (nodes.length === 0) return null;
  const name = nextLayerName(doc.all(), "Group");
  doc.checkpoint();
  return wrapNodes(doc, nodes, kinds, (rect, index, parentId) =>
    createGroup(rect, name, index, parentId),
  );
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

const GROUP_TYPES: ReadonlySet<string> = new Set([GROUP_TYPE]);

/** Removes groups left empty (their children deleted or moved out), in the current undo step. */
export function pruneEmptyGroups(doc: CanvasDocument): void {
  pruneEmptyHosts(doc, GROUP_TYPES);
}
