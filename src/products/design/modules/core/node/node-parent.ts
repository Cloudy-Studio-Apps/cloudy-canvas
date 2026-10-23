import type { CanvasElement, ElementBuildContext, ElementKind } from "@canvas";

import { moveIntoProblem } from "../tree/move/move-into";
import type { DesignNodeKind } from "./design-node.kind";
import { isDesignNode } from "./is-design-node";

/**
 * The id of the layer an agent puts `node` into (`ref`: an id, or a key given earlier in the same
 * call; `null`: the top of the page), after checking it may go there (`moveIntoProblem`).
 */
export function checkParent(
  node: CanvasElement,
  ref: unknown,
  context: ElementBuildContext,
): string | null {
  if (ref === null) return null;
  if (typeof ref !== "string" || ref === "") {
    throw new Error('"parent" must be a layer id (or key), or null for the top of the page.');
  }
  const parent = context.lookup(ref);
  if (!parent || !isDesignNode(parent)) throw new Error(`No layer with id ${ref}.`);
  // Ancestors are looked up as the tree goes (keys given earlier in the call included).
  const byId = new Map<string, CanvasElement>();
  for (let at: CanvasElement | undefined = parent; at && !byId.has(at.id);) {
    byId.set(at.id, at);
    at = isDesignNode(at) && at.parentId ? context.lookup(at.parentId) : undefined;
  }
  const problem = moveIntoProblem(node, parent, context.kinds, byId);
  if (problem) throw new Error(problem);
  return parent.id;
}

/** Whether a kind is a design node's (checked by shape, so this file needs no runtime import). */
export function isNodeKind(kind: ElementKind): kind is DesignNodeKind {
  return "container" in kind && "canGoInto" in kind;
}
