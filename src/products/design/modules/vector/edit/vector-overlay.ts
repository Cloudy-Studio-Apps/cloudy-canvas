import type { Graphics } from "pixi.js";
import { rotatePoint, type GuideView, type Point } from "@canvas";

import { segmentCurve, segmentsAt, tangentAt } from "../../core";
import type { VectorElement } from "../vector.types";
import type { VectorEditSelection } from "./vector-edit.types";

/** Sizes on screen, in pixels. */
export const OVERLAY_PX = { vertex: 7, handle: 3.5, line: 1.5 } as const;

/** The vertices whose tangent handles show: the selected ones and the ends of selected segments. */
export function activeVertices(el: VectorElement, selection: VectorEditSelection): Set<number> {
  const active = new Set(selection.vertices);
  for (const i of selection.segments) {
    const segment = el.network.segments[i];
    if (segment) active.add(segment.start).add(segment.end);
  }
  return active;
}

/**
 * Draws the edited vector's skeleton above it: its segments, its vertices (filled when selected)
 * and the tangent handles of the active ones, all at a constant size on screen.
 */
export function drawVectorOverlay(
  g: Graphics,
  view: GuideView,
  el: VectorElement,
  selection: VectorEditSelection,
): void {
  const unit = 1 / view.zoom;
  const color = view.theme.selection;
  const world = (p: Point) => rotatePoint({ x: el.x + p.x, y: el.y + p.y }, el, el.rotation ?? 0);
  const { network } = el;

  network.segments.forEach((_, i) => {
    const [p0, c1, c2, p3] = segmentCurve(network, i).map(world) as [Point, Point, Point, Point];
    g.moveTo(p0.x, p0.y).bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p3.x, p3.y);
    const width = (selection.segments.has(i) ? 2.5 : 1) * OVERLAY_PX.line * unit;
    g.stroke({ color, width });
  });

  for (const vertex of activeVertices(el, selection)) {
    const at = network.vertices[vertex];
    if (!at) continue;
    for (const i of segmentsAt(network, vertex)) {
      const t = tangentAt(network.segments[i]!, vertex);
      if (t.x === 0 && t.y === 0) continue;
      const from = world(at);
      const to = world({ x: at.x + t.x, y: at.y + t.y });
      g.moveTo(from.x, from.y).lineTo(to.x, to.y).stroke({ color, width: unit });
      g.circle(to.x, to.y, OVERLAY_PX.handle * unit)
        .fill({ color: 0xffffff })
        .stroke({ color, width: unit });
    }
  }

  const half = (OVERLAY_PX.vertex / 2) * unit;
  network.vertices.forEach((vertex, i) => {
    const at = world(vertex);
    g.rect(at.x - half, at.y - half, half * 2, half * 2)
      .fill({ color: selection.vertices.has(i) ? color : 0xffffff })
      .stroke({ color, width: unit });
  });
}
