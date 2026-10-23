import {
  normalizeAngle,
  optionalBoolean,
  optionalNumber,
  optionalString,
  type ElementSpec,
} from "@canvas";

import type { DesignNodeKind } from "./design-node.kind";
import type { DesignNode } from "./design-node.types";
import { maskType } from "./mask-args";
import { fraction } from "./number-args";
import { colorPaints, readPaints } from "./paint-args";

/**
 * A new node with what every node takes from an agent's spec: `name`, `visible`, `opacity`,
 * `fills` (or a `fill` color or CSS gradient), `strokes` (or a `stroke` one), `strokeWeight`, the
 * mask fields (`isMask`, `maskType`, `maskInverted`) and `rotation` (degrees counterclockwise round
 * its top-left corner; a line's ends turn instead).
 */
export function applyNodeSpec<E extends DesignNode>(
  kind: DesignNodeKind<E>,
  node: E,
  spec: ElementSpec,
): E {
  const { args } = spec;
  const next: E = { ...node };
  const name = optionalString(args, "name");
  if (name !== undefined) next.name = name;
  const visible = optionalBoolean(args, "visible");
  if (visible !== undefined) next.visible = visible;
  if (args.opacity !== undefined) next.opacity = fraction(args.opacity, "opacity");
  const size = { w: node.w, h: node.h };
  const fills =
    args.fills !== undefined
      ? readPaints(args.fills, "fills", kind.imageFills, size)
      : spec.fill !== undefined
        ? colorPaints(spec.fill, "fill", size)
        : undefined;
  if (fills) {
    if (!kind.fillable) throw new Error(`A ${kind.label} has no fill: give it strokes.`);
    next.fills = fills;
  }
  const strokes =
    args.strokes !== undefined
      ? readPaints(args.strokes, "strokes", false, size)
      : spec.stroke !== undefined
        ? colorPaints(spec.stroke, "stroke", size)
        : undefined;
  if (strokes) {
    if (!kind.strokable) throw new Error(`A ${kind.label} can't have strokes.`);
    next.strokes = strokes;
  }
  const strokeWeight = optionalNumber(args, "strokeWeight");
  if (strokeWeight !== undefined) {
    if (strokeWeight < 0) throw new Error('"strokeWeight" can\'t be negative.');
    next.strokeWeight = strokeWeight;
  }
  const isMask = optionalBoolean(args, "isMask");
  if (isMask !== undefined) next.isMask = isMask;
  if (args.maskType !== undefined) next.maskType = maskType(args.maskType);
  const inverted = optionalBoolean(args, "maskInverted");
  if (inverted !== undefined) next.maskInverted = inverted;
  const rotation = optionalNumber(args, "rotation");
  if (rotation !== undefined && Number.isFinite(rotation) && normalizeAngle(rotation) !== 0)
    return { ...next, ...kind.rotate(next, normalizeAngle(rotation), next) };
  return next;
}
