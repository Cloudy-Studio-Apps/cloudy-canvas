import type { FigImportContext, FigNode } from "@canvas/figma";

/**
 * The modes a Figma frame or page picks, keyed by collection id (the variables module's
 * migration turns the keys into the axes those collections become); `null` when it picks none.
 */
export function figVariableModes(
  node: FigNode,
  ctx: FigImportContext,
): Record<string, string> | null {
  const modes: Record<string, string> = {};
  for (const entry of node.variableModeBySetMap?.entries ?? []) {
    const collection = ctx.tokenId(entry.variableSetID?.guid);
    const mode = ctx.tokenId(entry.variableModeID);
    if (collection && mode) modes[collection] = mode;
  }
  return Object.keys(modes).length > 0 ? modes : null;
}
