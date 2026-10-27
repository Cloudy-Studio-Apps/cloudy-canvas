import type { CanvasDocument, CanvasElement, ElementKinds, ElementPatch } from "@canvas";

import { isDesignNode, type DesignNode } from "../../node";
import { pruneEmptyHosts } from "../host-tree";
import { treeOrderKeys } from "../order-keys";
import { selectionRoots } from "../wrap-nodes";
import type { LayerDestination, LayerPlace } from "./layer-move.types";
import { holdsLayers, moveIntoProblem } from "./move-into";
import { nKeysBetween } from "@canvas";

/**
 * The children of `parentId` (`null`: the top of `page`) topmost first, as the layers panel lists
 * them; a node whose parent is gone counts as being at the top.
 */
export function layerChildren(
  elements: readonly CanvasElement[],
  parentId: string | null,
  page: string,
): DesignNode[] {
  const ids = new Set(elements.map((el) => el.id));
  return elements
    .filter(
      (el): el is DesignNode =>
        isDesignNode(el) &&
        (!page || el.pageId === page) &&
        (parentId === null
          ? el.parentId === null || !ids.has(el.parentId)
          : el.parentId === parentId),
    )
    .sort((a, b) => (a.index < b.index ? 1 : a.index > b.index ? -1 : 0));
}

/**
 * Patches putting `nodes` (bottom to top, none inside another) at `destination`, keeping their
 * order: each gets the parent and an index between the layers it lands between. No checks: see
 * `layerMovePatches`.
 */
export function placeLayers(
  elements: readonly CanvasElement[],
  nodes: readonly DesignNode[],
  destination: LayerDestination,
): Map<string, ElementPatch> {
  const moving = new Set(nodes.map((node) => node.id));
  const page = nodes[0]?.pageId ?? "";
  const siblings = layerChildren(elements, destination.parentId, page).filter(
    (node) => !moving.has(node.id),
  );
  const at = Math.max(0, Math.min(siblings.length, Math.round(destination.position)));
  const above = siblings[at - 1] ?? null;
  const below = siblings[at] ?? null;
  const indexes = nKeysBetween(below?.index ?? null, above?.index ?? null, nodes.length);
  return new Map(
    nodes.map((node, i) => [
      node.id,
      { parentId: destination.parentId, index: indexes[i] } as ElementPatch,
    ]),
  );
}

/**
 * Patches moving the layers `ids` (with what they hold) to `destination`, keeping their order in
 * the tree. Throws, with the reason, when one can't go there (`moveIntoProblem`).
 */
export function layerMovePatches(
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
  ids: Iterable<string>,
  destination: LayerDestination,
): Map<string, ElementPatch> {
  const byId = new Map(elements.map((el) => [el.id, el]));
  const parent = destination.parentId === null ? null : byId.get(destination.parentId);
  if (parent === undefined) throw new Error(`No layer with id ${destination.parentId}.`);
  const keys = treeOrderKeys(elements);
  const key = (node: DesignNode) => keys.get(node.id) ?? node.index;
  const roots = selectionRoots(new Set(ids), elements).sort((a, b) =>
    key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0,
  );
  for (const node of roots) {
    const problem = moveIntoProblem(node, parent, kinds, byId);
    if (problem) throw new Error(problem);
  }
  return placeLayers(elements, roots, destination);
}

/**
 * Moves the layers `ids` (with what they hold) to `destination`, then removes the groups and
 * booleans the move emptied. Returns the moved layers. Call it in an undo step (`checkpoint`,
 * `asUndoStep`); throws, writing nothing, when a layer can't go there.
 */
export function moveLayers(
  doc: CanvasDocument,
  kinds: ElementKinds,
  ids: Iterable<string>,
  destination: LayerDestination,
): string[] {
  const patches = layerMovePatches(doc.all(), kinds, ids, destination);
  if (patches.size === 0) return [];
  doc.updateMany(patches);
  pruneEmptyHosts(doc, hostTypes(kinds));
  return [...patches.keys()];
}

/** The destination `place` of the layer `id`: just above or below it, or on top inside it. */
export function layerDestinationAt(
  elements: readonly CanvasElement[],
  id: string,
  place: LayerPlace,
): LayerDestination {
  const el = elements.find((e) => e.id === id);
  if (!el || !isDesignNode(el)) throw new Error(`No layer with id ${id}.`);
  if (place === "inside") return { parentId: el.id, position: 0 };
  const ids = new Set(elements.map((e) => e.id));
  const parentId = el.parentId && ids.has(el.parentId) ? el.parentId : null;
  const at = layerChildren(elements, parentId, el.pageId).findIndex((node) => node.id === id);
  return { parentId, position: place === "above" ? at : at + 1 };
}

/** The types of the layers made of their children (groups, booleans), which go when emptied. */
function hostTypes(kinds: ElementKinds): Set<string> {
  return new Set(
    kinds
      .all()
      .filter((kind) => holdsLayers(kind) && kind.childHost)
      .map((kind) => kind.type),
  );
}
