import type { DesignNode } from "@design";

/** The value every node has in common, or `null` when they differ (or there are none). */
export function sharedValue<N extends DesignNode, T>(
  nodes: readonly N[],
  read: (node: N) => T,
): T | null {
  const first = nodes[0];
  if (!first) return null;
  const value = read(first);
  return nodes.every((node) => Object.is(read(node), value)) ? value : null;
}
