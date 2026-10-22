import type { ElementPatch, ElementView, Point, Rect } from "@canvas";

import {
  DesignNodeKind,
  drawPaints,
  hitSegment,
  insideRegion,
  polylineNetwork,
  scaleNetwork,
  traceRegions,
  traceStrokes,
} from "../core";
import { VECTOR_DEFAULTS } from "./vector.defaults";
import type { VectorElement } from "./vector.types";

/**
 * Vectors: their regions are filled and their segments stroked; hit inside a filled region or
 * near a segment; stretched when resized. Double-click edits their points (`editElement`).
 */
export class VectorKind extends DesignNodeKind<VectorElement> {
  readonly type = "vector";
  readonly label = "Vector";
  readonly description = "A path of points and curves, drawn with the pen or the pencil.";
  override readonly tool = "pen";
  override readonly defaults = VECTOR_DEFAULTS;

  draw(view: ElementView, el: VectorElement): void {
    drawPaints(
      view,
      el,
      { fill: (g) => traceRegions(g, el.network), stroke: (g) => traceStrokes(g, el.network) },
      { cap: "round", join: "round" },
    );
  }

  override hitTest(el: VectorElement, p: Point, tolerance: number): boolean {
    if (!super.hitTest(el, p, tolerance + el.strokeWeight + VECTOR_DEFAULTS.reach)) return false;
    const local = { x: p.x - el.x, y: p.y - el.y };
    const reach = el.strokeWeight / 2 + tolerance + VECTOR_DEFAULTS.reach;
    const filled = el.fills.some((paint) => paint.visible);
    return (
      hitSegment(el.network, local, reach) !== null || (filled && insideRegion(el.network, local))
    );
  }

  /** Its points and curves stretch with its box. */
  override resize(el: VectorElement, rect: Rect): ElementPatch<VectorElement> {
    const sx = el.w > 0 ? rect.w / el.w : 1;
    const sy = el.h > 0 ? rect.h / el.h : 1;
    return { ...rect, network: scaleNetwork(el.network, sx, sy) };
  }

  /** Pencil lines from before networks stored `points`: they become an open chain. */
  override fillDefaults(el: VectorElement): VectorElement {
    const old = el as VectorElement & { points?: number[] };
    const network = el.network ?? polylineNetwork(old.points ?? []);
    return { ...super.fillDefaults(el), network };
  }
}
