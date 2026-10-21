import type { Graphics } from "pixi.js";
import type { CanvasElement, CanvasLinks, LinkView } from "@canvas";

import { ER_FILL_COLOR, INK_COLOR, MUTED_INK_COLOR } from "../../../palette";
import { drawArrowHead } from "../base/arrow-head";
import { ER_DEFAULTS } from "../base/er.defaults";
import { resolveErLinks } from "./er-links";
import type { ErLink } from "./er-links.types";

const LABEL_FONT_SIZE = 11;
/** The circle on a total hierarchy's parent line. */
const TOTAL_MARK_RADIUS = 5;

/**
 * Lines of the board's ER diagrams (relation ↔ participant, attribute ↔ owner, hierarchy ↔ parent
 * and children) with their cardinality labels, arrows and total marks.
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
        view.label(link.label, link.labelAt, { fontSize: LABEL_FONT_SIZE, color: MUTED_INK_COLOR });
      }
    }
  }
}

function drawLink(g: Graphics, link: ErLink, color: number | string): void {
  const [first, ...rest] = link.points;
  if (!first) return;
  g.moveTo(first.x, first.y);
  for (const p of rest) g.lineTo(p.x, p.y);
  g.stroke({ color, width: ER_DEFAULTS.strokeWidth });
  const end = link.points[link.points.length - 1]!;
  const before = link.points[link.points.length - 2] ?? first;
  if (link.arrow) {
    drawArrowHead(g, before, end);
    g.fill({ color });
  }
  if (link.totalMark) {
    const mid = { x: (first.x + end.x) / 2, y: (first.y + end.y) / 2 };
    g.circle(mid.x, mid.y, TOTAL_MARK_RADIUS)
      .fill({ color: ER_FILL_COLOR })
      .stroke({ color, width: ER_DEFAULTS.strokeWidth });
  }
}
