import type { Point64 } from "clipper2-ts";

import type { CurveTag } from "./path.types";

/**
 * Where each point handed to Clipper came from: its `z` is an id here, naming the source curves
 * it lies on and where (a point where two curves meet, or two shapes cross, lies on several).
 * Clipper keeps `z` through the operation, so the result's curves can be rebuilt from it.
 */
export class SourceTags {
  private readonly tags: CurveTag[][] = [[]];

  /** A new id for these tags (0, "unknown", when there are none). */
  add(tags: CurveTag[]): number {
    if (tags.length === 0) return 0;
    this.tags.push(tags);
    return this.tags.length - 1;
  }

  get(z: number | undefined): readonly CurveTag[] {
    return (z && this.tags[z]) || [];
  }

  /**
   * Clipper's callback where two edges cross: the crossing lies on the curves both edges follow,
   * at `t` interpolated along each edge.
   */
  readonly onIntersection = (
    bot1: Point64,
    top1: Point64,
    bot2: Point64,
    top2: Point64,
    at: Point64,
  ): void => {
    const tags = [...this.get(at.z), ...this.along(bot1, top1, at), ...this.along(bot2, top2, at)];
    at.z = this.add(tags);
  };

  /** The curves an edge follows (those both its ends lie on), with `t` where `at` is on them. */
  private along(from: Point64, to: Point64, at: Point64): CurveTag[] {
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    const f = length > 0 ? Math.hypot(at.x - from.x, at.y - from.y) / length : 0;
    const ends = this.get(to.z);
    return this.get(from.z).flatMap((a) => {
      const b = ends.find((tag) => tag.curve === a.curve);
      return b ? [{ curve: a.curve, t: a.t + (b.t - a.t) * f }] : [];
    });
  }
}
