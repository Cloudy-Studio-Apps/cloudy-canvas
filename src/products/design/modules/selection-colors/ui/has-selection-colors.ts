import type { PropertySelection } from "@design/ui/modules";
import { collectSelectionColors } from "../collect-selection-colors";

/**
 * Whether the Selection colors section shows: the selection paints with two colors or more, or
 * with one color on several layers (a frame or a group and what's inside).
 */
export function hasSelectionColors({ nodes, elements }: PropertySelection): boolean {
  if (nodes.length === 0) return false;
  const colors = collectSelectionColors(nodes, elements);
  if (colors.length > 1) return true;
  const layers = new Set(colors[0]?.refs.map((ref) => ref.nodeId));
  return layers.size > 1;
}
