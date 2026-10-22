import type { Point } from "@canvas";

import { pointArg } from "../node/number-args";
import type { VectorNetwork, VectorRegion, VectorSegment, WindingRule } from "./network.types";

const ZERO: Point = { x: 0, y: 0 };
const WINDING_RULES: readonly WindingRule[] = ["nonzero", "evenodd"];

/** The `network` field agents give vectors, in the `create_nodes` schema. */
export const NETWORK_SCHEMA = {
  type: "object",
  description:
    "Vector: points joined by bezier segments, relative to the vector's x, y. vertices: [{x, y}]; " +
    "segments: [{start, end, tangentStart?, tangentEnd?}] (vertex indexes, tangents relative to " +
    "their vertex, omitted for straight); regions: [{loops: [[segment indexes]]}] are filled.",
  properties: {
    vertices: { type: "array", items: { type: "object" } },
    segments: { type: "array", items: { type: "object" } },
    regions: { type: "array", items: { type: "object" } },
  },
  required: ["vertices", "segments"],
};

/** A vector network an agent gave, checked: segments join real vertices, loops real segments. */
export function readNetwork(value: unknown, key: string): VectorNetwork {
  if (typeof value !== "object" || value === null) throw new Error(`"${key}" must be an object.`);
  const net = value as Record<string, unknown>;
  const vertices = list(net.vertices, `${key}.vertices`).map((v, i) =>
    pointArg(v, `${key}.vertices[${i}]`),
  );
  const segments = list(net.segments, `${key}.segments`).map((s, i) =>
    readSegment(s, `${key}.segments[${i}]`, vertices.length),
  );
  const regions = list(net.regions ?? [], `${key}.regions`).map((r, i) =>
    readRegion(r, `${key}.regions[${i}]`, segments.length),
  );
  if (vertices.length < 2) throw new Error(`"${key}" needs at least 2 vertices.`);
  return { vertices, segments, regions };
}

function readSegment(value: unknown, key: string, vertexCount: number): VectorSegment {
  const s = (value ?? {}) as Record<string, unknown>;
  return {
    start: index(s.start, `${key}.start`, vertexCount),
    end: index(s.end, `${key}.end`, vertexCount),
    tangentStart:
      s.tangentStart === undefined ? ZERO : pointArg(s.tangentStart, `${key}.tangentStart`),
    tangentEnd: s.tangentEnd === undefined ? ZERO : pointArg(s.tangentEnd, `${key}.tangentEnd`),
  };
}

function readRegion(value: unknown, key: string, segmentCount: number): VectorRegion {
  const r = (value ?? {}) as Record<string, unknown>;
  const loops = list(r.loops, `${key}.loops`).map((loop, i) =>
    list(loop, `${key}.loops[${i}]`).map((n, j) =>
      index(n, `${key}.loops[${i}][${j}]`, segmentCount),
    ),
  );
  const windingRule = (r.windingRule ?? "nonzero") as WindingRule;
  if (!WINDING_RULES.includes(windingRule)) {
    throw new Error(`"${key}.windingRule" must be one of: ${WINDING_RULES.join(", ")}.`);
  }
  return { loops, windingRule };
}

function list(value: unknown, key: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`"${key}" must be an array.`);
  return value;
}

function index(value: unknown, key: string, count: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value >= count) {
    throw new Error(`"${key}" must be an index from 0 to ${count - 1}.`);
  }
  return value;
}
