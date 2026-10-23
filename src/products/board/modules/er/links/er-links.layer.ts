import type { Graphics } from "pixi.js";
import type { CanvasElement, CanvasLinks, LinkView, Point } from "@canvas";

import { ER_FILL_COLOR, INK_COLOR, MUTED_INK_COLOR } from "../../../palette";
import { drawArrowHead } from "../base/arrow-head";
import { ER_DEFAULTS } from "../base/er.defaults";
import { drawCrowFoot } from "./crow-foot";
import { resolveErLinks } from "./er-links";
import { LINK_LABEL_FONT_SIZE } from "./link-label";
import type { ErLink } from "./er-links.types";

/** The circle on a total hierarchy's parent line. */
const TOTAL_MARK_RADIUS = 5;

/**
 * Lines of the board's ER diagrams (relation ↔ participant, attribute ↔ owner, hierarchy ↔ parent
 * and children) with their cardinality labels, arrows, total marks and, on a binary relation's
 * lines, crow's-foot marks read from the cardinalities.
 */
export class ErLinks implements CanvasLinks {
  private links: ErLink[] = [];

  update(elements: readonly CanvasElement[]): void {
    this.links = resolveErLinks(elements);
  }

  draw(g: Graphics, view: LinkView): void {
    for (const link of this.links) {
      const active = view.highlighted.has(link.fromId) || view.highlighted.has(link.toId);
      drawLink(g, link, active ? view.theme.selection : INK_COLOR);
      if (link.label && link.labelAt) {
        view.label(link.label, link.labelAt, {
          fontSize: LINK_LABEL_FONT_SIZE,
          color: MUTED_INK_COLOR,
        });
      }
    }
  }
}

function drawLink(g: Graphics, link: ErLink, color: number | string): void {
  const [first] = link.points;
  if (!first) return;
  const gap = link.double ? ER_DEFAULTS.doubleGap / 2 : 0;
  for (const offset of link.double ? [gap, -gap] : [0]) {
    const [start, ...rest] = offsetPolyline(link.points, offset);
    if (!start) continue;
    g.moveTo(start.x, start.y);
    for (const p of rest) g.lineTo(p.x, p.y);
    g.stroke({ color, width: ER_DEFAULTS.strokeWidth });
  }
  const end = link.points[link.points.length - 1]!;
  const before = link.points[link.points.length - 2] ?? first;
  if (link.arrow) {
    drawArrowHead(g, before, end);
    g.fill({ color });
  }
  if (link.crowFoot) {
    drawCrowFoot(g, before, end, link.crowFoot, {
      color,
      width: ER_DEFAULTS.strokeWidth,
      fill: ER_FILL_COLOR,
    });
  }
  if (link.totalMark) {
    const mid = { x: (first.x + end.x) / 2, y: (first.y + end.y) / 2 };
    g.circle(mid.x, mid.y, TOTAL_MARK_RADIUS)
      .fill({ color: ER_FILL_COLOR })
      .stroke({ color, width: ER_DEFAULTS.strokeWidth });
  }
}

/** The polyline moved `offset` to its left, segment by segment (corners meet halfway). */
function offsetPolyline(points: readonly Point[], offset: number): Point[] {
  if (offset === 0 || points.length < 2) return [...points];
  const normals = points.slice(1).map((p, i) => {
    const a = points[i]!;
    const len = Math.hypot(p.x - a.x, p.y - a.y) || 1;
    return { x: -(p.y - a.y) / len, y: (p.x - a.x) / len };
  });
  return points.map((p, i) => {
    const before = normals[i - 1];
    const after = normals[i];
    const n =
      before && after
        ? { x: (before.x + after.x) / 2, y: (before.y + after.y) / 2 }
        : (before ?? after)!;
    return { x: p.x + n.x * offset, y: p.y + n.y * offset };
  });
}
