import type { CanvasDocument, CanvasElement, ElementKinds, ElementPatch } from "@canvas";

import {
  childrenByParent,
  isDesignNode,
  nextLayerName,
  selectionRoots,
  siblingMasks,
  type DesignNode,
} from "../core";
import { groupNodes } from "../group";
import type { MaskOptions } from "./mask-edits.types";
import { t } from "./mask.i18n";

/**
 * "Use as mask" (Ctrl+Alt+M), as in Figma. Several layers go into a new "Mask group" whose
 * bottom-most layer masks the others; one layer becomes a mask of the layers above it where it
 * is. When every layer is already a mask, they stop being masks instead. Returns what to select,
 * or an empty list when there was nothing to do. Call it in an undo step (`asUndoStep`).
 */
export function maskNodes(
  doc: CanvasDocument,
  ids: ReadonlySet<string>,
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
  { type, inverted }: MaskOptions = {},
): string[] {
  const nodes = selectionRoots(ids, elements);
  const bottom = nodes[0];
  if (!bottom) return [];
  if (type === undefined && inverted === undefined && nodes.every((node) => node.isMask)) {
    setMasks(doc, nodes, false);
    return nodes.map((node) => node.id);
  }
  const patch = {
    isMask: true,
    visible: true,
    ...(type ? { maskType: type } : {}),
    ...(inverted !== undefined ? { maskInverted: inverted } : {}),
  };
  if (nodes.length === 1) {
    doc.update(bottom.id, patch as ElementPatch);
    return [bottom.id];
  }
  const group = groupNodes(doc, new Set(nodes.map((node) => node.id)), elements, kinds);
  if (!group) return [];
  doc.update(group, { name: nextLayerName(doc.all(), t("defaults.maskGroup")) } as ElementPatch);
  doc.update(bottom.id, patch as ElementPatch);
  return [group];
}

/**
 * Turns masks back into ordinary layers: the selected masks, and the masks right inside the
 * selected layers (a mask group's). Returns the released masks. Call it in an undo step.
 */
export function releaseMasks(
  doc: CanvasDocument,
  ids: ReadonlySet<string>,
  elements: readonly CanvasElement[],
): string[] {
  const masks = masksAmong(ids, elements);
  setMasks(doc, masks, false);
  return masks.map((mask) => mask.id);
}

/** The selected masks, or else the masks right inside the selected layers. */
export function masksAmong(
  ids: ReadonlySet<string>,
  elements: readonly CanvasElement[],
): DesignNode[] {
  const nodes = elements.filter((el): el is DesignNode => ids.has(el.id) && isDesignNode(el));
  const own = nodes.filter((node) => node.isMask);
  if (own.length > 0) return own;
  const children = childrenByParent(elements);
  const inside = new Set(nodes.flatMap((node) => children.get(node.id) ?? []));
  return elements.filter(
    (el): el is DesignNode => inside.has(el.id) && isDesignNode(el) && el.isMask,
  );
}

/** The mask a node shows through (its own, or the one over a layer holding it), or `null`. */
export function maskOverNode(id: string, elements: readonly CanvasElement[]): string | null {
  const masked = siblingMasks(elements);
  const byId = new Map(elements.map((el) => [el.id, el]));
  for (let el = byId.get(id), depth = 0; el && depth <= elements.length; depth++) {
    const mask = masked.get(el.id);
    if (mask) return mask;
    el = isDesignNode(el) && el.parentId ? byId.get(el.parentId) : undefined;
  }
  return null;
}

/** The layers a mask masks directly (with what they hold, they show through it). */
export function maskedByMask(maskId: string, elements: readonly CanvasElement[]): string[] {
  return [...siblingMasks(elements)].filter(([, mask]) => mask === maskId).map(([id]) => id);
}

function setMasks(doc: CanvasDocument, nodes: readonly DesignNode[], isMask: boolean): void {
  doc.updateMany(new Map(nodes.map((node) => [node.id, { isMask } as ElementPatch])));
}
