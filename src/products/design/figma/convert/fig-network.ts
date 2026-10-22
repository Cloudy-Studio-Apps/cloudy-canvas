import type { Point } from "@canvas";

import type { VectorNetwork, VectorRegion, VectorSegment } from "../../modules";
import { applyLinear, applyMatrix } from "./fig-matrix";
import type { FigMatrix } from "./fig-node.types";

/**
 * A vector network blob (little-endian u32 counts and indices, f32 coordinates): vertices,
 * segments with their tangents relative to their vertices, and regions of segment loops, as
 * Figma's own model is ours. Its coordinates are scaled by `scale` (the node's size over the
 * network's) and placed in the world by `m`.
 */
export function decodeNetworkBlob(bytes: Uint8Array, scale: Point, m: FigMatrix): VectorNetwork {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 0;
  const u32 = () => {
    const value = view.getUint32(offset, true);
    offset += 4;
    return value;
  };
  const f32 = () => {
    const value = view.getFloat32(offset, true);
    offset += 4;
    return value;
  };
  const local = (x: number, y: number): Point => ({ x: x * scale.x, y: y * scale.y });

  const vertexCount = u32();
  const segmentCount = u32();
  const regionCount = u32();
  const vertices: Point[] = [];
  for (let i = 0; i < vertexCount; i++) {
    u32(); // style
    vertices.push(applyMatrix(m, local(f32(), f32())));
  }
  const segments: VectorSegment[] = [];
  for (let i = 0; i < segmentCount; i++) {
    u32(); // style
    const start = u32();
    const tangentStart = applyLinear(m, local(f32(), f32()));
    const end = u32();
    const tangentEnd = applyLinear(m, local(f32(), f32()));
    segments.push({ start, end, tangentStart, tangentEnd });
  }
  const regions: VectorRegion[] = [];
  for (let i = 0; i < regionCount; i++) {
    const style = u32();
    const loops: number[][] = [];
    const loopCount = u32();
    for (let j = 0; j < loopCount; j++) {
      const loop: number[] = [];
      const length = u32();
      for (let k = 0; k < length; k++) loop.push(u32());
      loops.push(loop);
    }
    regions.push({ loops, windingRule: style & 1 ? "nonzero" : "evenodd" });
  }
  return { vertices, segments, regions };
}
