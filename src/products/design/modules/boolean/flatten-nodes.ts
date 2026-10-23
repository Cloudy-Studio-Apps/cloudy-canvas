import {
  placePath,
  rotatePoint,
  type CanvasDocument,
  type CanvasElement,
  type ElementKinds,
  type PathContour,
  type PathShape,
} from "@canvas";

import {
  childrenByParent,
  DesignNodeKind,
  isDesignNode,
  pathToNetwork,
  selectionRoots,
  withDescendants,
  type DesignNode,
} from "../core";
import { createVector, type VectorElement } from "../vector";

/**
 * Flatten (Ctrl+E), as in Figma: the selected layers become one vector with their shapes (a
 * boolean's result, a text's glyphs, a group's layers), painted like the bottom one. One layer
 * keeps its id, name and turn. Returns what to select, or an empty list when nothing has a shape.
 * Call it in an undo step.
 */
export function flattenNodes(
  doc: CanvasDocument,
  ids: ReadonlySet<string>,
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
): string[] {
  const roots = selectionRoots(ids, elements);
  const [base] = roots;
  if (!base) return [];
  const children = childrenByParent(elements);
  const byId = new Map(elements.map((el) => [el.id, el]));
  const childrenOf = (el: CanvasElement) =>
    (children.get(el.id) ?? []).map((id) => byId.get(id)).filter((child) => child !== undefined);

  const single = roots.length === 1 ? ownShape(base, kinds) : null;
  const vector = single
    ? turnedVector(base, single)
    : worldVector(
        roots,
        roots.flatMap((root) => worldContours(root, kinds, childrenOf)),
      );
  if (!vector) return [];
  const top = roots[roots.length - 1]!;
  const placed: VectorElement = {
    ...vector,
    ...(single ? { id: base.id, name: base.name } : {}),
    index: top.index,
    parentId: top.parentId,
    pageId: top.pageId,
    visible: base.visible,
    opacity: base.opacity,
    ...(base.locked ? { locked: true } : {}),
  };
  doc.remove([...withDescendants(new Set(roots.map((root) => root.id)), elements)]);
  doc.add(placed);
  return [placed.id];
}

/** A layer's own shape in local coordinates: its fill, or, when it fills nothing, its strokes. */
function ownShape(node: DesignNode, kinds: ElementKinds): PathShape | null {
  const kind = kinds.kindOf(node);
  if (!(kind instanceof DesignNodeKind) || !kind.ownsShape) return null;
  const geometry = kind.geometry(node);
  if (!geometry) return null;
  const shape = geometry.fill.contours.length > 0 ? geometry.fill : geometry.stroke;
  return shape.contours.length > 0 ? shape : null;
}

/** A layer's shapes in world coordinates, a group's (and any host's without one) its layers'. */
function worldContours(
  node: CanvasElement,
  kinds: ElementKinds,
  childrenOf: (el: CanvasElement) => CanvasElement[],
  depth = 0,
): PathContour[] {
  if (!isDesignNode(node) || !node.visible || depth > 64) return [];
  const shape = ownShape(node, kinds);
  if (shape) return placePath(shape, node).contours;
  return childrenOf(node).flatMap((child) => worldContours(child, kinds, childrenOf, depth + 1));
}

/** One layer's shape as a vector in its own frame, turned like it. */
function turnedVector(node: DesignNode, shape: PathShape): VectorElement {
  const vector = createVector(pathToNetwork(shape), node.name, node.index, node.parentId, node);
  const rotation = node.rotation ?? 0;
  const corner = rotatePoint({ x: node.x + vector.x, y: node.y + vector.y }, node, rotation);
  return { ...vector, x: corner.x, y: corner.y, rotation };
}

/** Several layers' world shapes as one upright vector painted like the bottom one. */
function worldVector(nodes: readonly DesignNode[], contours: PathContour[]): VectorElement | null {
  const [base] = nodes;
  if (!base || contours.length === 0) return null;
  return createVector(pathToNetwork({ contours }), "Vector", base.index, base.parentId, base);
}
