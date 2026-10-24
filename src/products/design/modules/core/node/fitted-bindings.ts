import { pathRoot, remapStackBindings, type ElementPatch, type ElementStyle } from "@canvas";

import type { DesignNode } from "./design-node.types";

const STACKS = ["fills", "strokes"] as const;

/**
 * A node's bindings once Paste properties fitted the pasted look to its kind (`nodeStylePatch`
 * dropped image fills or whole stacks): its own bindings of the fields replaced go, the copied
 * ones come with their paints' new places, and those of paints that were dropped go too. Empty
 * when nothing changes.
 */
export function fittedBindings(
  el: DesignNode,
  style: ElementStyle,
  pasted: ElementPatch<DesignNode>,
  fitted: ElementPatch<DesignNode>,
): ElementPatch<DesignNode> {
  const copied = (style.bindings as Record<string, string> | undefined) ?? {};
  const replaced = new Set(Object.keys(fitted).filter((key) => key !== "bindings"));
  const own = el.bindings ?? {};
  if (
    Object.keys(copied).length === 0 &&
    !Object.keys(own).some((p) => replaced.has(pathRoot(p)))
  ) {
    return {};
  }
  let next: Record<string, string> = Object.fromEntries(
    Object.entries(copied).filter(([path]) => replaced.has(pathRoot(path))),
  );
  for (const field of STACKS) {
    const before = pasted[field];
    const after = fitted[field];
    if (!before || !after || before.length === after.length) continue;
    next = remapStackBindings(next, field, (i) => {
      const paint = before[i];
      const at = paint ? after.indexOf(paint) : -1;
      return at < 0 ? null : at;
    });
  }
  for (const [path, id] of Object.entries(own)) {
    if (!replaced.has(pathRoot(path))) next[path] = id;
  }
  return { bindings: next };
}
