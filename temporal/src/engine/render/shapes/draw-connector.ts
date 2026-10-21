import type { Graphics } from "pixi.js";

import type { ConnectorShape } from "../../document";
import type { ShapeView } from "./shape-view";

const HEAD_LENGTH = 12;
const HEAD_ANGLE = Math.PI / 7;

/** The connector's route (already resolved by the scene) with optional arrowheads. */
export function drawConnector(view: ShapeView, shape: ConnectorShape): void {
  const { points, color, size } = shape;
  const g = view.graphics.clear();
  if (points.length < 4) return;

  g.moveTo(points[0]!, points[1]!);
  for (let i = 2; i + 1 < points.length; i += 2) g.lineTo(points[i]!, points[i + 1]!);
  g.stroke({ color, width: size, cap: "round", join: "round" });

  const n = points.length;
  if (shape.endHead === "arrow") {
    arrowHead(g, points[n - 2]!, points[n - 1]!, points[n - 4]!, points[n - 3]!);
  }
  if (shape.startHead === "arrow") arrowHead(g, points[0]!, points[1]!, points[2]!, points[3]!);
  g.stroke({ color, width: size, cap: "round", join: "round" });
}

/** Open arrowhead at (tx, ty), pointing away from (fx, fy). */
function arrowHead(g: Graphics, tx: number, ty: number, fx: number, fy: number): void {
  const angle = Math.atan2(ty - fy, tx - fx);
  for (const side of [-1, 1]) {
    const a = angle + Math.PI - side * HEAD_ANGLE;
    g.moveTo(tx, ty).lineTo(tx + HEAD_LENGTH * Math.cos(a), ty + HEAD_LENGTH * Math.sin(a));
  }
}
