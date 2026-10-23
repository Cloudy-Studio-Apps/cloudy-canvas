import {
  distanceToPath,
  pointInPath,
  type CanvasElement,
  type ElementBuildContext,
  type ElementDescription,
  type ElementPatch,
  type ElementView,
  type Point,
} from "@canvas";

import { ChildHostKind, drawPaints, type ChildResolveContext, type NodeGeometry } from "../core";
import { booleanOperation, BOOLEAN_TYPE, operationLabel } from "./boolean.constants";
import { booleanGeometry, booleanGeometryKey, resolveBoolean } from "./boolean-result";
import type { BooleanElement } from "./boolean.types";

/**
 * Booleans (Union, Subtract, Intersect, Exclude): their operands combined into one shape, drawn
 * with the boolean's own paints and hit by it; the operands aren't drawn but stay editable (a
 * double-click enters the boolean). Selected, moved, turned and flipped like a group.
 */
export class BooleanKind extends ChildHostKind<BooleanElement> {
  readonly type = BOOLEAN_TYPE;
  readonly label = "Boolean";
  readonly description = "Layers combined into one shape: union, subtract, intersect or exclude.";
  override readonly ownsShape: boolean = true;
  override readonly drawsChildren: boolean = false;
  override readonly specProperties = {};

  resolveFromChildren(
    el: BooleanElement,
    children: readonly CanvasElement[],
    context: ChildResolveContext,
  ): BooleanElement {
    return resolveBoolean(el, children, context);
  }

  /** The result the scene resolved from its operands. */
  override geometry(el: BooleanElement): NodeGeometry {
    return booleanGeometry(el);
  }

  override geometryKey(el: BooleanElement): string {
    return booleanGeometryKey(el);
  }

  draw(view: ElementView, el: BooleanElement): void {
    drawPaints(view, el, this.geometry(el));
  }

  /** Inside the result (holes are out), or on its stroke. */
  override hitTest(el: BooleanElement, p: Point, tolerance: number): boolean {
    if (!el.visible) return false;
    const local = { x: p.x - el.x, y: p.y - el.y };
    const { fill } = this.geometry(el);
    if (el.fills.some((paint) => paint.visible) && pointInPath(fill, local)) return true;
    const reach = el.strokeWeight / 2 + tolerance;
    return el.strokeWeight > 0 && distanceToPath(fill, local) <= reach;
  }

  override describe(el: BooleanElement): ElementDescription {
    return { label: `${this.layerName(el)} (${operationLabel(el.operation)})` };
  }

  override completePatch(
    el: BooleanElement,
    patch: ElementPatch<BooleanElement>,
    context: ElementBuildContext,
  ): ElementPatch<BooleanElement> {
    const next = { ...patch };
    if ("operation" in patch) next.operation = booleanOperation(patch.operation);
    return super.completePatch(el, next, context);
  }

  override fillDefaults(el: BooleanElement): BooleanElement {
    return { ...super.fillDefaults(el), operation: el.operation ?? "union" };
  }
}
