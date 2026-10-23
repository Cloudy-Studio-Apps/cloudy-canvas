import { normalizeAngle, type ElementBuildContext, type ElementPatch } from "@canvas";

import type { DesignNodeKind } from "./design-node.kind";
import type { DesignNode } from "./design-node.types";
import { checkParent } from "./node-parent";
import { layerBlendMode } from "./blend-mode-args";
import { maskType } from "./mask-args";
import { fraction } from "./number-args";
import { readPaints } from "./paint-args";
import { readStrokeFields } from "./stroke-args";
import { readNodeEffects } from "./effect-args";

/**
 * An agent's patch of the fields every node has, checked and normalized: `opacity` (0–1),
 * `blendMode`,
 * `strokeWeight`, full `fills`/`strokes` paint arrays, the stroke settings (`readStrokeFields`) (as the node's kind allows), `parentId`
 * (a container it may go into) and `rotation` (the angle to turn to round its top-left corner,
 * which a kind may hold in its geometry, as a line does) and `maskType` (alpha, vector or
 * luminance).
 */
export function checkNodePatch<E extends DesignNode>(
  kind: DesignNodeKind<E>,
  el: E,
  patch: ElementPatch<E>,
  context: ElementBuildContext,
): ElementPatch<E> {
  const next: Record<string, unknown> = { ...patch };
  if ("opacity" in patch) next.opacity = fraction(patch.opacity, "opacity");
  if ("blendMode" in patch) next.blendMode = layerBlendMode(patch.blendMode);
  if ("strokeWeight" in patch && !((patch.strokeWeight ?? -1) >= 0)) {
    throw new Error('"strokeWeight" must be a number of at least 0.');
  }
  const size = { w: patch.w ?? el.w, h: patch.h ?? el.h };
  if ("fills" in patch) {
    if (!kind.fillable) throw new Error(`A ${kind.label} has no fill: change its strokes.`);
    next.fills = readPaints(patch.fills, "fills", kind.imageFills, size);
  }
  if ("strokes" in patch) {
    if (!kind.strokable) throw new Error(`A ${kind.label} can't have strokes.`);
    next.strokes = readPaints(patch.strokes, "strokes", true, size);
  }
  Object.assign(next, readStrokeFields(kind as DesignNodeKind, patch as Record<string, unknown>));
  if ("effects" in patch) next.effects = readNodeEffects(patch.effects, "effects");
  if ("maskType" in patch) next.maskType = maskType(patch.maskType);
  if ("parentId" in patch) next.parentId = checkParent(el, patch.parentId, context);
  if ("rotation" in patch) {
    const angle = patch.rotation;
    if (typeof angle !== "number" || !Number.isFinite(angle))
      throw new Error('"rotation" must be a number of degrees.');
    delete next.rotation;
    const placed = { ...el, ...(next as ElementPatch<E>) };
    Object.assign(next, kind.rotate(placed, normalizeAngle(angle - kind.turnOf(el)), placed));
  }
  return next as ElementPatch<E>;
}
