import type { Point } from "@canvas";
import { applyMatrix, type FigNode } from "@canvas/figma";

import { createStroke, type StrokePen } from "../../modules";
import { MARKER_COLORS, MARKER_SIZES } from "../../palette";
import type { FigJamNodeConverter } from "./convert-figjam-node.types";
import { solidColor } from "./fig-paint-values";

/** A highlighter stroke is translucent when FigJam draws it. */
const HIGHLIGHTER_OPACITY = 0.99;

/**
 * A marker or highlighter stroke: the points of its vector network, in order. Drawn shapes
 * without a network are left out.
 */
export const convertStroke: FigJamNodeConverter = (node, { world, ctx, out }) => {
  const blob = ctx.blob(node.vectorData?.vectorNetworkBlob);
  const size = node.size ?? { x: 0, y: 0 };
  const normal = node.vectorData?.normalizedSize ?? size;
  const scale = { x: normal.x ? size.x / normal.x : 1, y: normal.y ? size.y / normal.y : 1 };
  const points = blob
    ? networkPoints(blob).flatMap((p) => {
        const at = applyMatrix(world, { x: p.x * scale.x, y: p.y * scale.y });
        return [at.x, at.y];
      })
    : [];
  if (points.length < 4) return ctx.warnings.add("drawings that aren't strokes were left out");
  const color =
    solidColor(node.strokePaints) ?? solidColor(node.fillPaints) ?? MARKER_COLORS[0].value;
  const stroke = createStroke(
    points,
    penOf(node),
    color,
    node.strokeWeight ?? MARKER_SIZES[1].value,
    "",
  );
  ctx.place(node, stroke.id);
  out.add(stroke);
};

function penOf(node: FigNode): StrokePen {
  const opacity = node.strokePaints?.[0]?.opacity ?? node.opacity ?? 1;
  return node.type === "HIGHLIGHT" || opacity < HIGHLIGHTER_OPACITY ? "highlighter" : "pen";
}

/**
 * The vertices of a vector network blob (little-endian u32 counts, then each vertex's u32 style
 * and f32 x, y), in the network's own coordinates.
 */
function networkPoints(bytes: Uint8Array): Point[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.byteLength < 12) return [];
  const count = view.getUint32(0, true);
  const points: Point[] = [];
  for (let i = 0, offset = 12; i < count && offset + 12 <= bytes.byteLength; i++, offset += 12) {
    points.push({ x: view.getFloat32(offset + 4, true), y: view.getFloat32(offset + 8, true) });
  }
  return points;
}
