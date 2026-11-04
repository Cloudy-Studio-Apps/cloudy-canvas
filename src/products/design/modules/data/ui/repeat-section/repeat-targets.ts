import type { CanvasElement } from "@canvas";

import { isDesignNode, type DesignNode } from "../../../core";
import { isFrame, type FrameElement } from "../../../frame";
import { dataCopyTag, repeatOf } from "../../repeat";
import type { RepeatTargets } from "./repeat-targets.types";

const byIndex = (a: DesignNode, b: DesignNode) =>
  a.index < b.index ? -1 : a.index > b.index ? 1 : 0;

/**
 * Where the selected layer can repeat, from the page's elements: as a card, in its parent
 * frame (not for a copy, nor in a frame that is itself a copy), and as a container (a frame; a
 * copy only when it's a copied iterator, shown read-only).
 */
export function repeatTargets(
  node: DesignNode | undefined,
  elements: readonly CanvasElement[],
): RepeatTargets {
  if (!node) return { card: null, container: null };
  const childrenOf = (frame: FrameElement) =>
    elements
      .filter((el): el is DesignNode => isDesignNode(el) && el.parentId === frame.id)
      .sort(byIndex);
  const parent = node.parentId ? elements.find((el) => el.id === node.parentId) : undefined;
  const card =
    !dataCopyTag(node) && parent && isFrame(parent) && !dataCopyTag(parent)
      ? { frame: parent, layers: childrenOf(parent) }
      : null;
  const container =
    isFrame(node) && (!dataCopyTag(node) || repeatOf(node) !== null)
      ? { frame: node, layers: childrenOf(node) }
      : null;
  return { card, container };
}
