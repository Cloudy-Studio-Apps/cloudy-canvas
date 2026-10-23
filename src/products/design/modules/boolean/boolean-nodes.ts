import type { CanvasDocument, CanvasElement, ElementKinds, ElementPatch } from "@canvas";

import { nextLayerName, selectionRoots, wrapNodes } from "../core";
import { BOOLEAN_TYPE, operationLabel } from "./boolean.constants";
import { createBoolean } from "./boolean.factory";
import type { BooleanOperation } from "./boolean.types";

/**
 * Figma's Union, Subtract, Intersect and Exclude on the selection. Selected booleans change to
 * the operation; otherwise the layers (two or more) go into a new boolean named after it, where
 * the topmost of them was, painted like the bottom one (its base). Returns what to select, or an
 * empty list when there was nothing to do. Call it in an undo step.
 */
export function booleanNodes(
  doc: CanvasDocument,
  ids: ReadonlySet<string>,
  operation: BooleanOperation,
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
): string[] {
  const nodes = selectionRoots(ids, elements);
  if (nodes.length > 0 && nodes.every((node) => node.type === BOOLEAN_TYPE)) {
    doc.updateMany(new Map(nodes.map((node) => [node.id, { operation } as ElementPatch])));
    return nodes.map((node) => node.id);
  }
  const base = nodes[0];
  if (!base || nodes.length < 2) return [];
  const name = nextLayerName(doc.all(), operationLabel(operation));
  const id = wrapNodes(doc, nodes, kinds, (rect, index, parentId) =>
    createBoolean(rect, name, index, parentId, operation, base),
  );
  return id ? [id] : [];
}
