import { nearPolyline, type ElementView, type Point } from "@canvas";

import { ErKind } from "../base/er.kind";
import { drawErConstraint } from "./constraint.draw";
import type { ErConstraintElement } from "./constraint.types";

/** Thin lines get extra reach so they're easy to click, in world units. */
const REACH = 4;
const LINE_WIDTH = 2;

/** A constraint between relations; its `points` follow them (see `resolveErElements`). */
export class ErConstraintKind extends ErKind<ErConstraintElement> {
  readonly type = "er-constraint";
  readonly label = "Constraint";
  readonly description =
    "An exclusion, inclusion, exclusive or inclusive constraint between relations.";

  draw(view: ElementView, el: ErConstraintElement): void {
    drawErConstraint(view, el);
  }

  override hitTest(el: ErConstraintElement, p: Point, tolerance: number): boolean {
    return (
      super.hitTest(el, p, tolerance) &&
      nearPolyline(el.points, el, p, LINE_WIDTH / 2 + tolerance + REACH)
    );
  }
}
