import { nearPolyline, type ElementPatch, type ElementView, type Point, type Rect } from "@canvas";

import { DesignNodeKind, drawPaints } from "../core";
import { VECTOR_DEFAULTS } from "./vector.defaults";
import type { VectorElement } from "./vector.types";

/** Freehand vectors: strokes along their points, hit near the line, scaled when resized. */
export class VectorKind extends DesignNodeKind<VectorElement> {
  readonly type = "vector";
  readonly label = "Vector";
  readonly description = "A freehand line drawn with the pencil.";
  override readonly tool = "pencil";
  override readonly defaults = VECTOR_DEFAULTS;
  override readonly fillable = false;

  draw(view: ElementView, el: VectorElement): void {
    const { points } = el;
    drawPaints(
      view,
      el,
      (g) => {
        g.moveTo(points[0] ?? 0, points[1] ?? 0);
        for (let i = 2; i + 1 < points.length; i += 2) g.lineTo(points[i]!, points[i + 1]!);
      },
      { cap: "round", join: "round" },
    );
  }

  override hitTest(el: VectorElement, p: Point, tolerance: number): boolean {
    if (!super.hitTest(el, p, tolerance + el.strokeWeight)) return false;
    return nearPolyline(el.points, el, p, el.strokeWeight / 2 + tolerance + VECTOR_DEFAULTS.reach);
  }

  /** Its points stretch with its box. */
  override resize(el: VectorElement, rect: Rect): ElementPatch<VectorElement> {
    const sx = el.w > 0 ? rect.w / el.w : 1;
    const sy = el.h > 0 ? rect.h / el.h : 1;
    return { ...rect, points: el.points.map((value, i) => value * (i % 2 === 0 ? sx : sy)) };
  }

  override fillDefaults(el: VectorElement): VectorElement {
    return { ...super.fillDefaults(el), points: el.points ?? [] };
  }
}
