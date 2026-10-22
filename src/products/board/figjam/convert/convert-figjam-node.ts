import { IDENTITY, multiply, type FigNode, type FigTree } from "@canvas/figma";

import { convertConnector } from "./convert-connector";
import type { FigJamNodeConverter, FigJamPlacement } from "./convert-figjam-node.types";
import { convertPlainShape } from "./convert-plain-shape";
import { convertSection } from "./convert-section";
import { convertShape } from "./convert-shape";
import { convertSticky } from "./convert-sticky";
import { convertStroke } from "./convert-stroke";
import { convertText } from "./convert-text";
import { convertWidget } from "./convert-widget";

const convertCodeBlock: FigJamNodeConverter = (node, placement) => {
  placement.ctx.warnings.add("code blocks became plain text");
  convertText(node, placement);
};

/** What each FigJam node becomes. Groups only hold others. */
const CONVERTERS: Record<string, FigJamNodeConverter> = {
  STICKY: convertSticky,
  SHAPE_WITH_TEXT: convertShape,
  TEXT: convertText,
  CODE_BLOCK: convertCodeBlock,
  CONNECTOR: convertConnector,
  SECTION: convertSection,
  WIDGET: convertWidget,
  VECTOR: convertStroke,
  HIGHLIGHT: convertStroke,
  RECTANGLE: convertPlainShape,
  ROUNDED_RECTANGLE: convertPlainShape,
  ELLIPSE: convertPlainShape,
  FRAME: convertPlainShape,
  INSTANCE: convertPlainShape,
  SYMBOL: convertPlainShape,
  STAMP: convertPlainShape,
  WASHI_TAPE: convertPlainShape,
  GROUP: () => undefined,
};

/** Nodes whose children are converted after them (on top), flattened onto the board. */
const HOLDERS = new Set(["SECTION", "FRAME", "GROUP", "INSTANCE", "SYMBOL"]);

/**
 * Converts a node and what it holds into `placement.out`. The board has no frames or groups:
 * what a section, frame or group holds is placed on the board where it is in the world (a
 * section's contents stay inside it, so they still move with it).
 */
export function convertFigJamNode(
  tree: FigTree,
  node: FigNode,
  placement: Omit<FigJamPlacement, "world">,
): void {
  if (node.visible === false || node.internalOnly) return;
  const world = multiply(placement.parentWorld, node.transform ?? IDENTITY);
  const here = { ...placement, world };
  here.ctx.visit(node, world);
  const type = node.type ?? "";
  const convert = CONVERTERS[type];
  if (convert) convert(node, here);
  if (HOLDERS.has(type)) {
    for (const child of tree.childrenOf(node)) {
      convertFigJamNode(tree, child, { ...placement, parentWorld: world });
    }
  } else if (!convert) {
    here.ctx.warnings.add(`${type.toLowerCase().replaceAll("_", " ")} items were left out`);
  }
}
