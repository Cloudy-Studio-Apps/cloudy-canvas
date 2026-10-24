import { reverseCurve, type CubicCurve } from "@canvas";

import { otherEnd, segmentCurve } from "./network-curves";
import type { NetworkChain, VectorNetwork } from "./network.types";

/**
 * Every segment once, as chains through the vertices joining exactly two of them, so strokes
 * turn there instead of ending: open chains start at ends and branch points, and what's left are
 * closed loops.
 */
export function strokeChains(net: VectorNetwork): NetworkChain[] {
  const used = new Set<number>();
  // The segments at each vertex, found once: large imported vectors have thousands of each.
  const around: number[][] = net.vertices.map(() => []);
  net.segments.forEach((seg, i) => {
    around[seg.start]?.push(i);
    if (seg.end !== seg.start) around[seg.end]?.push(i);
  });
  const segmentsAt = (vertex: number): readonly number[] => around[vertex] ?? [];
  const degree = (vertex: number) => segmentsAt(vertex).length;
  const chains: NetworkChain[] = [];

  const walk = (from: number, firstSegment: number): void => {
    const curves: CubicCurve[] = [];
    let at = from;
    let segment: number | undefined = firstSegment;
    while (segment !== undefined && !used.has(segment)) {
      used.add(segment);
      const seg = net.segments[segment]!;
      const curve = segmentCurve(net, segment);
      curves.push(seg.start === at ? curve : reverseCurve(curve));
      at = otherEnd(seg, at);
      segment = degree(at) === 2 ? segmentsAt(at).find((next) => !used.has(next)) : undefined;
    }
    if (curves.length > 0) chains.push({ curves, closed: at === from && curves.length > 1 });
  };

  net.vertices.forEach((_, vertex) => {
    if (degree(vertex) === 2) return;
    for (const segment of segmentsAt(vertex)) if (!used.has(segment)) walk(vertex, segment);
  });
  net.segments.forEach((seg, segment) => {
    if (!used.has(segment)) walk(seg.start, segment);
  });
  return chains;
}
