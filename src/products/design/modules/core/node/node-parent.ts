import type { CanvasElement, ElementBuildContext, ElementKind } from "@canvas";

import type { DesignNodeKind } from "./design-node.kind";
import type { DesignNode } from "./design-node.types";
import { isDesignNode } from "./is-design-node";

/**
 * The id of the container an agent puts `node` into (`ref`: an id, or a key given earlier in the
 * same call; `null`: the top of the page), after checking it's a container the node may go into
 * and not the node itself or something inside it.
 */
export function checkParent(
  node: CanvasElement,
  nodeKind: DesignNodeKind,
  ref: unknown,
  context: ElementBuildContext,
): string | null {
  if (ref === null) return null;
  if (typeof ref !== "string" || ref === "") {
    throw new Error('"parent" must be a layer id (or key), or null for the top of the page.');
  }
  const parent = context.lookup(ref);
  if (!parent || !isDesignNode(parent)) throw new Error(`No layer with id ${ref}.`);
  const parentKind = context.kinds.kindOf(parent);
  if (!isNodeKind(parentKind) || !parentKind.container) {
    throw new Error(
      `A ${parentKind.label} can't hold layers: put them in a frame or a section (or group them).`,
    );
  }
  if (!nodeKind.canGoInto(parent, parentKind)) {
    throw new Error(`A ${nodeKind.label} can't go into a ${parentKind.label}.`);
  }
  const seen = new Set<string>();
  for (let at: DesignNode | undefined = parent; at;) {
    if (at.id === node.id) throw new Error(`A layer can't go into itself or what it holds.`);
    seen.add(at.id);
    const up: CanvasElement | undefined =
      at.parentId && !seen.has(at.parentId) ? context.lookup(at.parentId) : undefined;
    at = up && isDesignNode(up) ? up : undefined;
  }
  return parent.id;
}

/** Whether a kind is a design node's (checked by shape, so this file needs no runtime import). */
export function isNodeKind(kind: ElementKind): kind is DesignNodeKind {
  return "container" in kind && "canGoInto" in kind;
}
