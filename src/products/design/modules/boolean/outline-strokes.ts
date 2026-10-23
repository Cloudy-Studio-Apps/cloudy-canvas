import {
  rotatePoint,
  type CanvasDocument,
  type CanvasElement,
  type ElementKinds,
  type ElementPatch,
} from "@canvas";
import { generateKeyBetween } from "fractional-indexing";

import {
  DesignNodeKind,
  pathToNetwork,
  selectionRoots,
  type DesignNode,
  type Paint,
} from "../core";
import { createVector, type VectorElement } from "../vector";

/**
 * Outline stroke (Ctrl+Shift+O), as in Figma: each selected layer's strokes become a filled
 * vector of the area they cover, painted with them. A layer with fills keeps them (the vector
 * goes right above it); one without (a line) is replaced by the vector, which keeps its id.
 * Returns what to select. Call it in an undo step.
 */
export function outlineStrokes(
  doc: CanvasDocument,
  ids: ReadonlySet<string>,
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
): string[] {
  const selected: string[] = [];
  for (const node of selectionRoots(ids, elements)) {
    const vector = strokeVector(node, kinds);
    if (!vector) continue;
    const keepsFill = node.fills.some((paint) => paint.visible);
    if (keepsFill) {
      doc.update(node.id, { strokes: [] } as ElementPatch);
      const above = siblingAbove(node, elements);
      const placed = { ...vector, index: generateKeyBetween(node.index, above?.index ?? null) };
      doc.add(placed);
      selected.push(placed.id);
    } else {
      const replacement: VectorElement = {
        ...vector,
        id: node.id,
        name: node.name,
        index: node.index,
      };
      doc.remove([node.id]);
      doc.add(replacement);
      selected.push(node.id);
    }
  }
  return selected;
}

/** The vector of the area a layer's visible strokes cover, filled with them; `null` when none. */
function strokeVector(node: DesignNode, kinds: ElementKinds): VectorElement | null {
  const kind = kinds.kindOf(node);
  if (!(kind instanceof DesignNodeKind) || !kind.ownsShape || node.strokeWeight <= 0) return null;
  const paints: Paint[] = node.strokes.filter((paint) => paint.visible);
  if (paints.length === 0) return null;
  const area = kind.strokeArea(node);
  if (area.contours.length === 0) return null;
  const vector = createVector(
    pathToNetwork(area),
    `${node.name} stroke`,
    node.index,
    node.parentId,
    {
      fills: paints,
      strokes: [],
      strokeWeight: 0,
    },
  );
  const rotation = node.rotation ?? 0;
  const corner = rotatePoint({ x: node.x + vector.x, y: node.y + vector.y }, node, rotation);
  return {
    ...vector,
    x: corner.x,
    y: corner.y,
    rotation,
    pageId: node.pageId,
    visible: node.visible,
    opacity: node.opacity,
  };
}

/** The sibling drawn right above a node, if any. */
function siblingAbove(node: DesignNode, elements: readonly CanvasElement[]): CanvasElement | null {
  let above: CanvasElement | null = null;
  for (const el of elements) {
    if (!("parentId" in el) || el.parentId !== node.parentId || el.index <= node.index) continue;
    if (!above || el.index < above.index) above = el;
  }
  return above;
}
