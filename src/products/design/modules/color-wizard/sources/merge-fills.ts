import { colorDistance } from "../color";
import type { FileFill, FillGroup } from "./sources.types";

/**
 * Fills grouped under the most used one when they look alike (within `threshold` OKLab distance;
 * 0 merges only equal colors), most used group first.
 */
export function mergeFills(fills: readonly FileFill[], threshold: number): FillGroup[] {
  const groups: FillGroup[] = [];
  const byUse = [...fills].sort((a, b) => b.refs.length - a.refs.length);
  for (const fill of byUse) {
    const group = groups.find((g) => colorDistance(g.hex, fill.hex) <= threshold);
    if (group) {
      group.members.push(fill);
      group.count += fill.refs.length;
    } else groups.push({ hex: fill.hex, count: fill.refs.length, members: [fill] });
  }
  return groups.sort((a, b) => b.count - a.count);
}
