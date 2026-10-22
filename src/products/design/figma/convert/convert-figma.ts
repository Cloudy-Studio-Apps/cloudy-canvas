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
import { resolveFigNode } from "./resolve-instances";

/**
 * A decoded Figma file as design elements: a page per Figma page (in order, dividers left out),
 * and its layers with instances expanded, in world coordinates. Prototype and Dev Mode data are
 * ignored. `onProgress` hears how many of the pages' top-level layers are done.
 */
export function convertFigma(
  container: FigContainer,
  onProgress?: FigmaImportProgress,
): FigmaImport {
  if (container.kind !== "design") throw new Error("This is a FigJam board, not a design.");
  const ctx = new FigImportContext(container);
  const nodeChanges = container.message.nodeChanges;
  const tree = buildFigTree(Array.isArray(nodeChanges) ? (nodeChanges as FigNode[]) : []);
  const pages = tree
    .childrenOf(tree.root)
    .filter((page) => page.type === "CANVAS" && !page.internalOnly && !page.isPageDivider);
  const keys = generateNKeysBetween(null, null, pages.length);
  const topLayers = pages.map((page) => tree.childrenOf(page).filter((node) => !node.internalOnly));
  const total = topLayers.reduce((sum, layers) => sum + layers.length, 0);
  let done = 0;
  const elements: CanvasElement[] = [];
  pages.forEach((figPage, i) => {
    const page = createPage(figPage.name || `Page ${i + 1}`, keys[i] ?? "a0");
    elements.push(page);
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
    assets: ctx.assets,
    warnings: ctx.warnings.list(),
  };
}
