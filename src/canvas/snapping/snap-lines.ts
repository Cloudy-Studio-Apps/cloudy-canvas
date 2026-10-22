import { edgesAt } from "./snap-edges";
import type { SnapAxis, SnapEdge, SnapLine } from "./snap.types";

/**
 * The lines the moving edges (where they ended up) share with the targets' edges: one per value,
 * with the marks of every edge on it.
 */
export function snapLines(
  axis: SnapAxis,
  moving: readonly SnapEdge[],
  targets: readonly SnapEdge[],
): SnapLine[] {
  const lines = new Map<number, SnapLine>();
  for (const edge of moving) {
    const matched = edgesAt(targets, edge.value);
    if (matched.length === 0) continue;
    const at = matched[0]!.value;
    const line = lines.get(at) ?? { axis, at, marks: [] };
    line.marks.push(...edge.marks, ...matched.flatMap((m) => m.marks));
    lines.set(at, line);
  }
  return [...lines.values()];
}
