import type { CanvasElement } from "@canvas";
import type { FigImportContext, FigNode } from "@canvas/figma";

import { figLayerBindings, figRunBindings } from "./fig-bindings";
import { figVariableModes } from "./fig-variable-modes";

/** Stacks a style can stand for; a style there replaces its parts' own bindings. */
const STACKS = ["fills", "strokes", "effects"];

/**
 * A converted element with all it binds: its paints' colors (from `figNodeBase`), the fields and
 * styles Figma binds (`figLayerBindings`) and its text ranges' styles. A whole stack bound to a
 * style drops the bindings of its parts, as binding by hand does. A frame keeps the modes it
 * picks.
 */
export function withFigBindings(
  el: CanvasElement,
  node: FigNode,
  ctx: FigImportContext,
): CanvasElement {
  const runs = (el as { runs?: unknown }).runs;
  const bindings: Record<string, string> = {
    ...el.bindings,
    ...figLayerBindings(node, ctx),
    ...(Array.isArray(runs) ? figRunBindings(runs) : {}),
  };
  for (const stack of STACKS) {
    if (!bindings[stack]) continue;
    for (const path of Object.keys(bindings))
      if (path.startsWith(`${stack}.`)) delete bindings[path];
  }
  const variableModes = figVariableModes(node, ctx);
  return {
    ...el,
    ...(Object.keys(bindings).length > 0 ? { bindings } : {}),
    ...(variableModes ? { variableModes } : {}),
  };
}
