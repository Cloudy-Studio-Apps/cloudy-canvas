import {
  lineFromEnds,
  placeNetwork,
  type LineNodeElement,
  type VectorElement,
  type VectorNetwork,
} from "../../modules";
import { decodeNetworkBlob } from "./fig-network";
import { applyMatrix } from "./fig-matrix";
import { figNodeBase } from "./fig-node-base";
import type { FigMatrix, FigNode, FigPath } from "./fig-node.types";
import { convertPaints } from "./fig-paints";
import { pathToNetwork } from "./fig-path";
import type { NodePaints, NodePlacement } from "./convert-node.types";
import type { ImportContext } from "./import-context";

/** A Figma vector from its network, placed in the world (rotation and flips included). */
export function convertVector(
  node: FigNode,
  world: FigMatrix,
  placement: NodePlacement,
  ctx: ImportContext,
): VectorElement | null {
  const blob = ctx.blob(node.vectorData?.vectorNetworkBlob);
  if (!blob) return vectorFromGeometry(node, world, placement, ctx);
  const size = node.size ?? { x: 0, y: 0 };
  const normalized = node.vectorData?.normalizedSize ?? size;
  const scale = {
    x: normalized.x ? size.x / normalized.x : 1,
    y: normalized.y ? size.y / normalized.y : 1,
  };
  return vectorElement(node, decodeNetworkBlob(blob, scale, world), placement, ctx);
}

/**
 * Any node as a vector of Figma's precomputed outline: what a boolean operation or a rotated
 * shape becomes. A node without a fill outline is its stroke's outline, filled with the strokes.
 */
export function vectorFromGeometry(
  node: FigNode,
  world: FigMatrix,
  placement: NodePlacement,
  ctx: ImportContext,
): VectorElement | null {
  const fill = networkOf(node.fillGeometry, world, ctx);
  if (fill) return vectorElement(node, fill, placement, ctx);
  const stroke = networkOf(node.strokeGeometry, world, ctx);
  if (!stroke) return null;
  return vectorElement(node, stroke, placement, ctx, {
    fills: convertPaints(node.strokePaints, ctx, false),
    strokes: [],
  });
}

/** A Figma line from its two ends; an arrow cap puts an arrowhead at its end. */
export function convertLine(
  node: FigNode,
  world: FigMatrix,
  placement: NodePlacement,
  ctx: ImportContext,
): LineNodeElement {
  const start = applyMatrix(world, { x: 0, y: 0 });
  const end = applyMatrix(world, { x: node.size?.x ?? 0, y: 0 });
  const { points, ...rect } = lineFromEnds(start, end);
  return {
    ...figNodeBase("line", node, rect, placement, ctx),
    fills: [],
    points,
    startCap: "none",
    endCap: node.strokeCap?.startsWith("ARROW") ? "arrow" : "none",
  };
}

function networkOf(
  paths: readonly FigPath[] | undefined,
  world: FigMatrix,
  ctx: ImportContext,
): VectorNetwork | null {
  let network: VectorNetwork | null = null;
  for (const path of paths ?? []) {
    const blob = ctx.blob(path.commandsBlob);
    if (!blob) continue;
    const rule = path.windingRule === "ODD" ? "evenodd" : "nonzero";
    network = pathToNetwork(blob, world, rule, network ?? undefined);
  }
  return network && network.vertices.length > 0 ? network : null;
}

function vectorElement(
  node: FigNode,
  network: VectorNetwork,
  placement: NodePlacement,
  ctx: ImportContext,
  paints?: NodePaints,
): VectorElement {
  const { network: placed, ...rect } = placeNetwork({ x: 0, y: 0 }, network);
  return { ...figNodeBase("vector", node, rect, placement, ctx, paints), network: placed };
}
