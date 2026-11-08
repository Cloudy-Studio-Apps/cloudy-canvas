import { optionalBoolean, type ElementSpec, type Point } from "@canvas";

import { polygonNetwork, polylineNetwork, readNetwork, type VectorNetwork } from "../core";

/**
 * An agent's vector network in world coordinates: its `network` (relative to x, y), or a path
 * through `points` (world), closed when `closed`.
 */
export function specNetwork({ x, y, args }: ElementSpec): VectorNetwork {
  if (args.network !== undefined) {
    const net = readNetwork(args.network, "network");
    return { ...net, vertices: net.vertices.map((v) => ({ x: v.x + x, y: v.y + y })) };
  }
  const flat = args.points;
  if (
    !Array.isArray(flat) ||
    flat.length < 4 ||
    flat.length % 2 !== 0 ||
    !flat.every((n) => typeof n === "number" && Number.isFinite(n))
  ) {
    throw new Error(
      'A vector needs "points" ([x0, y0, x1, y1, …], at least 2 points) or "network".',
    );
  }
  const points = flat as number[];
  if (!optionalBoolean(args, "closed")) return polylineNetwork(points);
  const corners: Point[] = [];
  for (let i = 0; i < points.length; i += 2) corners.push({ x: points[i]!, y: points[i + 1]! });
  return polygonNetwork(corners);
}
