import type { Point } from "@canvas";
import { applyMatrix, type FigMatrix } from "@canvas/figma";

import type { VectorNetwork, WindingRule } from "../../modules";

const CLOSE = 0;
const MOVE = 1;
const LINE = 2;
const QUAD = 3;
const CUBIC = 4;

/** How close a subpath's last point must be to its first to be the same vertex. */
const SAME_POINT = 1e-3;

/**
 * Path commands (a geometry blob: a command byte, then its f32 points; Figma's precomputed
 * outlines) as a vector network placed in the world by `m`: each closed subpath is a loop of
 * one region, so a boolean operation or a rotated shape keeps its look.
 */
export function pathToNetwork(
  bytes: Uint8Array,
  m: FigMatrix,
  windingRule: WindingRule,
  network: VectorNetwork = { vertices: [], segments: [], regions: [] },
): VectorNetwork {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 0;
  const point = (): Point => {
    const p = { x: view.getFloat32(offset, true), y: view.getFloat32(offset + 4, true) };
    offset += 8;
    return applyMatrix(m, p);
  };
  const { vertices, segments } = network;
  const loops: number[][] = [];
  let first = -1;
  let current = -1;
  let loop: number[] = [];

  const lineTo = (p: Point, c1?: Point, c2?: Point) => {
    const from = vertices[current];
    if (!from) return;
    vertices.push(p);
    const to = vertices.length - 1;
    segments.push({
      start: current,
      end: to,
      tangentStart: c1 ? { x: c1.x - from.x, y: c1.y - from.y } : { x: 0, y: 0 },
      tangentEnd: c2 ? { x: c2.x - p.x, y: c2.y - p.y } : { x: 0, y: 0 },
    });
    loop.push(segments.length - 1);
    current = to;
  };

  while (offset < bytes.length) {
    const command = bytes[offset++];
    if (command === MOVE) {
      vertices.push(point());
      first = current = vertices.length - 1;
      loop = [];
    } else if (command === LINE) {
      lineTo(point());
    } else if (command === QUAD) {
      const control = point();
      const end = point();
      const from = vertices[current] ?? end;
      // The same curve as a cubic: controls two thirds of the way to the quad's control.
      const c1 = {
        x: from.x + (2 / 3) * (control.x - from.x),
        y: from.y + (2 / 3) * (control.y - from.y),
      };
      const c2 = {
        x: end.x + (2 / 3) * (control.x - end.x),
        y: end.y + (2 / 3) * (control.y - end.y),
      };
      lineTo(end, c1, c2);
    } else if (command === CUBIC) {
      const c1 = point();
      const c2 = point();
      lineTo(point(), c1, c2);
    } else if (command === CLOSE) {
      closeLoop();
    } else {
      break;
    }
  }
  if (loops.length > 0) network.regions.push({ loops, windingRule });
  return network;

  function closeLoop(): void {
    const start = vertices[first];
    const end = vertices[current];
    const last = segments[segments.length - 1];
    if (!start || !end || loop.length === 0) return;
    if (last && current !== first && Math.hypot(end.x - start.x, end.y - start.y) < SAME_POINT) {
      // The last point is the first one again: end the last segment there instead.
      vertices.pop();
      last.end = first;
    } else if (current !== first) {
      segments.push({
        start: current,
        end: first,
        tangentStart: { x: 0, y: 0 },
        tangentEnd: { x: 0, y: 0 },
      });
      loop.push(segments.length - 1);
    }
    loops.push(loop);
    loop = [];
    current = first;
  }
}
