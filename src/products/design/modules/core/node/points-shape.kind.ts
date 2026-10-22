import type { ElementView, Point } from "@canvas";

import { polygonNetwork } from "../network/network-shapes";
import type { VectorNetwork } from "../network/network.types";
import { BoxShapeKind } from "./box-shape.kind";
import type { DesignNode } from "./design-node.types";
import { drawPaints } from "./draw-paints";
import { distanceToOutline, pointInPolygon } from "./shape-points";

/**
 * The base of shapes outlined by a closed list of corners (polygons, stars): a subclass only
 * gives `points`; drawing and hit testing (inside, or near the outline) follow from them.
 */
export abstract class PointsShapeKind<E extends DesignNode = DesignNode> extends BoxShapeKind<E> {
  /** Its corners point one way (a triangle's up): flipped top to bottom it turns half round. */
  override readonly symmetricVertically: boolean = false;

  /** The corners in local coordinates, in order around the shape. */
  abstract points(el: E): Point[];

  override vectorNetwork(el: E): VectorNetwork {
    return polygonNetwork(this.points(el));
  }

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
