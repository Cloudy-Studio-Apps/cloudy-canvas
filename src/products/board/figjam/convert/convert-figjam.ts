import {
  buildFigTree,
  IDENTITY,
  type FigContainer,
  type FigmaImportProgress,
  type FigNode,
} from "@canvas/figma";

import type { FigJamImport } from "../figjam-import.types";
import { convertFigJamNode } from "./convert-figjam-node";
import { FigJamContext } from "./figjam-context";
import { FigJamOutput } from "./figjam-output";

/**
 * A decoded FigJam file as board elements, in world coordinates: its stickies, shapes, texts,
 * connectors, sections, images, link cards and strokes, bottom to top. A board has one page, so
 * only the file's first is imported. `onProgress` hears how many top-level nodes are done.
 */
export function convertFigJam(
  container: FigContainer,
  onProgress?: FigmaImportProgress,
): FigJamImport {
  if (container.kind !== "figjam") throw new Error("This is a Figma design, not a FigJam board.");
  const ctx = new FigJamContext(container);
  const nodeChanges = container.message.nodeChanges;
  const tree = buildFigTree(Array.isArray(nodeChanges) ? (nodeChanges as FigNode[]) : []);
  const pages = tree
    .childrenOf(tree.root)
    .filter((page) => page.type === "CANVAS" && !page.internalOnly);
  if (pages.length > 1) ctx.warnings.add("pages after the first were left out");
  const page = pages[0];
  const nodes = page ? tree.childrenOf(page) : [];
  if (page) ctx.visit(page, IDENTITY);
  const out = new FigJamOutput();
  nodes.forEach((node, i) => {
    convertFigJamNode(tree, node, { parentWorld: IDENTITY, out, ctx });
    onProgress?.("Converting board", { done: i + 1, total: nodes.length });
  });
  return {
    name: container.name,
    elements: out.elements(),
    assets: ctx.assets,
    warnings: ctx.warnings.list(),
  };
}
