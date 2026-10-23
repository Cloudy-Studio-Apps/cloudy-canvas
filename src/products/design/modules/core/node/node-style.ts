import type { ElementPatch } from "@canvas";

import type { DesignNode } from "./design-node.types";
import type { Paint } from "./paint.types";
import type { DesignNodeKind } from "./design-node.kind";

/** What Copy properties takes from every layer; kinds add their own (`styleFields`). */
export const NODE_STYLE_FIELDS: readonly string[] = [
  "opacity",
  "blendMode",
  "fills",
  "strokes",
  "strokeWeight",
  "strokeAlign",
  "strokeCap",
  "strokeJoin",
  "strokeMiterAngle",
  "strokeDashes",
  "strokeWeights",
  "effects",
];

/** The stroke fields, dropped from pastes onto kinds that show no strokes. */
const STROKE_FIELDS = NODE_STYLE_FIELDS.filter((field) => field.startsWith("stroke"));

/**
 * A pasted look as the kind can show it: no fills on what has no inside (a line), no strokes on
 * what shows none (a text), sides only on kinds with them, and image fills only on kinds that
 * take them.
 */
export function nodeStylePatch<E extends DesignNode>(
  kind: DesignNodeKind<E>,
  patch: ElementPatch<E>,
): ElementPatch<E> {
  const fitted: ElementPatch<DesignNode> = { ...patch };
  if (!kind.fillable) delete fitted.fills;
  else if (fitted.fills && !kind.imageFills) fitted.fills = withoutImages(fitted.fills);
  if (!kind.strokable) {
    for (const field of STROKE_FIELDS) delete (fitted as Record<string, unknown>)[field];
  } else if (!kind.sidedStrokes) delete fitted.strokeWeights;
  return fitted as ElementPatch<E>;
}

function withoutImages(paints: readonly Paint[]): Paint[] {
  return paints.filter((paint) => paint.type !== "image");
}
