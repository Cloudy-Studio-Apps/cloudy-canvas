import { generateNKeysBetween } from "fractional-indexing";

import type { CanvasElement } from "@canvas";
import {
  buildFigTree,
  FigImportContext,
  IDENTITY,
  type FigContainer,
  type FigmaImportProgress,
  type FigNode,
} from "@canvas/figma";

import { createPage } from "../../modules";
import type { FigmaImport } from "../figma-import.types";
import { convertChildren } from "./convert-node";
import { figPageGuides } from "./page-guides";
import { resolveFigNode } from "./resolve-instances";
import { figStyles, figVariableModes, figVariables } from "./tokens";

/**
 * A decoded Figma file as design elements: a page per Figma page (in order, dividers left out),
 * and its layers with instances expanded, in world coordinates, with the file's variables and
 * styles as tokens the layers are bound to. Prototype and Dev Mode data are ignored. `onProgress` hears how many of the pages' top-level layers are done.
 */
export function convertFigma(
  container: FigContainer,
  onProgress?: FigmaImportProgress,
): FigmaImport {
  if (container.kind !== "design") throw new Error("This is a FigJam board, not a design.");
  const ctx = new FigImportContext(container);
  const nodeChanges = container.message.nodeChanges;
  const nodes = Array.isArray(nodeChanges) ? (nodeChanges as FigNode[]) : [];
  const tree = buildFigTree(nodes);
  // Variables and styles first: layers bind to the ids they're given.
  const tokens = [...figVariables(nodes, ctx), ...figStyles(nodes, ctx)];
  const pages = tree
    .childrenOf(tree.root)
    .filter((page) => page.type === "CANVAS" && !page.internalOnly && !page.isPageDivider);
  const keys = generateNKeysBetween(null, null, pages.length);
  const topLayers = pages.map((page) => tree.childrenOf(page).filter((node) => !node.internalOnly));
  const total = topLayers.reduce((sum, layers) => sum + layers.length, 0);
  let done = 0;
  const elements: CanvasElement[] = [];
  pages.forEach((figPage, i) => {
    const guides = figPageGuides(figPage);
    const page = createPage(figPage.name || `Page ${i + 1}`, keys[i] ?? "a0");
    const variableModes = figVariableModes(figPage, ctx);
    elements.push({
      ...page,
      ...(guides.length > 0 ? { guides } : {}),
      ...(variableModes ? { variableModes } : {}),
    });
    const layers = (topLayers[i] ?? []).map((node) => resolveFigNode(tree, node, ctx.warnings));
    convertChildren(
      layers,
      { world: IDENTITY, parentId: null, pageId: page.id, out: elements },
      ctx,
      () => onProgress?.("Converting layers", { done: ++done, total }),
    );
  });
  return {
    name: container.name,
    elements,
    tokens,
    assets: ctx.assets,
    warnings: ctx.warnings.list(),
  };
}
