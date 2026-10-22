import type { ElementView, Point } from "@canvas";

import { BoxShapeKind } from "./box-shape.kind";
import type { DesignNode } from "./design-node.types";
import { drawPaints } from "./draw-paints";
import { distanceToOutline, pointInPolygon } from "./shape-points";

/**
 * The base of shapes outlined by a closed list of corners (polygons, stars): a subclass only
 * gives `points`; drawing and hit testing (inside, or near the outline) follow from them.
 */
export abstract class PointsShapeKind<E extends DesignNode = DesignNode> extends BoxShapeKind<E> {
  /** The corners in local coordinates, in order around the shape. */
  abstract points(el: E): Point[];

  draw(view: ElementView, el: E): void {
    const points = this.points(el);
    drawPaints(view, el, (g) => g.poly(points));
  }

  override hitTest(el: E, p: Point, tolerance: number): boolean {
    if (!super.hitTest(el, p, tolerance)) return false;
    const local = { x: p.x - el.x, y: p.y - el.y };
    const points = this.points(el);
    return pointInPolygon(points, local) || distanceToOutline(points, local) <= tolerance;
  }
}
