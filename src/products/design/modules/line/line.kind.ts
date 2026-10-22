import {
  distanceToSegmentSq,
  type ElementHandle,
  type ElementInteraction,
  type ElementView,
  type InteractionQuery,
  type Point,
} from "@canvas";

import type { DesignToolOptions } from "../../design-options.types";
import { DesignNodeKind } from "../core";
import { LINE_DEFAULTS } from "./line.defaults";
import { drawLine } from "./line.draw";
import { LineEndDrag } from "./line-end-drag";
import { lineEnds } from "./line-geometry";
import type { LineNodeElement } from "./line.types";

/**
 * Lines and arrows: hit near the line, selected by their two ends (dragged to change them) rather
 * than a box, and painted with strokes only.
 */
export class LineKind extends DesignNodeKind<LineNodeElement> {
  readonly type = "line";
  readonly label = "Line";
  readonly description = "A straight line, with an arrowhead at either end if you like.";
  override readonly tool = "line";
  override readonly defaults = LINE_DEFAULTS;
  override readonly boxed = false;
  override readonly resizable = false;
  override readonly fillable = false;

  draw(view: ElementView, el: LineNodeElement): void {
    drawLine(view, el);
  }

  override hitTest(el: LineNodeElement, p: Point, tolerance: number): boolean {
    if (!el.visible) return false;
    const { start, end } = lineEnds(el);
    const radius = el.strokeWeight / 2 + tolerance + LINE_DEFAULTS.reach;
    return distanceToSegmentSq(p, start.x, start.y, end.x, end.y) <= radius * radius;
  }

  override handles(el: LineNodeElement): ElementHandle[] {
    const { start, end } = lineEnds(el);
    return [start, end];
  }

  override interactionAt(
    el: LineNodeElement,
    p: Point,
    query: InteractionQuery,
  ): ElementInteraction<DesignToolOptions> | null {
    if (!query.selected || el.locked) return null;
    const ends = lineEnds(el);
    for (const which of ["end", "start"] as const) {
      if (Math.hypot(p.x - ends[which].x, p.y - ends[which].y) > query.reach) continue;
      return { cursor: "move", press: (ctx) => new LineEndDrag(ctx, el, which) };
    }
    return null;
  }

  override fillDefaults(el: LineNodeElement): LineNodeElement {
    return {
      ...super.fillDefaults(el),
      points: el.points ?? [0, 0, el.w, el.h],
      startCap: el.startCap ?? "none",
      endCap: el.endCap ?? "none",
    };
  }
}
