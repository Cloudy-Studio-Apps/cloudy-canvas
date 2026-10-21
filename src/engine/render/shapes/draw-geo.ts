import type { Graphics } from "pixi.js";

import {
  GEO_PADDING,
  GEO_STROKE_WIDTH,
  INK_COLOR,
  TRANSPARENT,
  type GeoShape,
} from "../../document";
import { cylinderCap, ellipseArc, geoPolygon } from "../../geo";
import type { ShapeView } from "./shape-view";

/** Corner radius of the "rounded" rectangle (kept tight, like the rest of the UI). */
const ROUNDED_RADIUS = 12;

/** A diagram shape: fill, outline and its centered, wrapped label. */
export function drawGeo(view: ShapeView, shape: GeoShape): void {
  const { w, h, fill, stroke } = shape;
  const g = view.graphics.clear();

  if (fill !== TRANSPARENT) {
    outline(g, shape);
    g.fill({ color: fill });
  }
  if (stroke !== TRANSPARENT) {
    outline(g, shape);
    g.stroke({ color: stroke, width: GEO_STROKE_WIDTH, alignment: 0.5, join: "round" });
    if (shape.kind === "cylinder") {
      // The visible front edge of the top cap.
      const ry = cylinderCap(w, h);
      g.poly(ellipseArc(w / 2, ry, w / 2, ry, 0, Math.PI), false).stroke({
        color: stroke,
        width: GEO_STROKE_WIDTH,
      });
    }
  }

  const text = view.setText(shape.text, {
    fontSize: shape.fontSize,
    color: INK_COLOR,
    wrapWidth: Math.max(1, w - GEO_PADDING * 2),
    align: "center",
  });
  text.position.set((w - text.width) / 2, (h - text.height) / 2);
}

function outline(g: Graphics, { kind, w, h }: GeoShape): void {
  if (kind === "rectangle") g.rect(0, 0, w, h);
  else if (kind === "rounded") g.roundRect(0, 0, w, h, Math.min(ROUNDED_RADIUS, w / 2, h / 2));
  else if (kind === "ellipse") g.ellipse(w / 2, h / 2, w / 2, h / 2);
  else g.poly(geoPolygon(kind, w, h));
}
