import type { VectorNetwork } from "./network.types";

/** Networks side by side as one: each one's vertex and segment indexes moved past the ones before. */
export function mergeNetworks(nets: readonly VectorNetwork[]): VectorNetwork {
  const merged: VectorNetwork = { vertices: [], segments: [], regions: [] };
  for (const net of nets) {
    const vertexBase = merged.vertices.length;
    const segmentBase = merged.segments.length;
    merged.vertices.push(...net.vertices);
    for (const segment of net.segments) {
      merged.segments.push({
        ...segment,
        start: segment.start + vertexBase,
        end: segment.end + vertexBase,
      });
    }
    for (const region of net.regions) {
      merged.regions.push({
        ...region,
        loops: region.loops.map((loop) => loop.map((i) => i + segmentBase)),
      });
    }
  }
  return merged;
}
