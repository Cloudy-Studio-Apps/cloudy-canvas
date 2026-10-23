import type { ElementView, Point } from "@canvas";

import { polygonNetwork } from "../network/network-shapes";
import type { VectorNetwork } from "../network/network.types";
import { BoxShapeKind } from "./box-shape.kind";
import type { DesignNode } from "./design-node.types";
import { drawPaints } from "./draw-paints";
import { EMPTY_GEOMETRY } from "./node-geometry";
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

  override geometryKey(el: E): string {
    return this.points(el)
      .map((p) => `${p.x},${p.y}`)
      .join(" ");
  }

  draw(view: ElementView, el: E): void {
    drawPaints(view, el, this.geometry(el) ?? EMPTY_GEOMETRY, this.strokeOf(el));
  }

  protected override hitsShape(el: E, p: Point, tolerance: number): boolean {
    if (!super.hitsShape(el, p, tolerance)) return false;
    const local = { x: p.x - el.x, y: p.y - el.y };
    const points = this.points(el);
    return pointInPolygon(points, local) || distanceToOutline(points, local) <= tolerance;
  }
}
