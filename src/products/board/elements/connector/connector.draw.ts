import type { Graphics } from "pixi.js";
import type { ElementView } from "@canvas";

import { CONNECTOR_DEFAULTS } from "./connector.defaults";
import type { ConnectorElement } from "./connector.types";

/** The connector's route (already resolved by the scene) with optional arrowheads. */
export function drawConnector(view: ElementView, el: ConnectorElement): void {
  const { points, color, size } = el;
  const g = view.graphics.clear();
  if (points.length < 4) return;

  g.moveTo(points[0]!, points[1]!);
  for (let i = 2; i + 1 < points.length; i += 2) g.lineTo(points[i]!, points[i + 1]!);
  g.stroke({ color, width: size, cap: "round", join: "round" });

  const n = points.length;
  if (el.endHead === "arrow") {
    arrowHead(g, points[n - 2]!, points[n - 1]!, points[n - 4]!, points[n - 3]!);
  }
  if (el.startHead === "arrow") arrowHead(g, points[0]!, points[1]!, points[2]!, points[3]!);
  g.stroke({ color, width: size, cap: "round", join: "round" });
}

/** Open arrowhead at (tx, ty), pointing away from (fx, fy). */
function arrowHead(g: Graphics, tx: number, ty: number, fx: number, fy: number): void {
  const { headLength, headAngle } = CONNECTOR_DEFAULTS;
  const angle = Math.atan2(ty - fy, tx - fx);
  for (const side of [-1, 1]) {
    const a = angle + Math.PI - side * headAngle;
    g.moveTo(tx, ty).lineTo(tx + headLength * Math.cos(a), ty + headLength * Math.sin(a));
  }
}
