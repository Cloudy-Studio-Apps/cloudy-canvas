import type { CanvasElement } from "@canvas";
import type { FigMatrix } from "@canvas/figma";

import type { Paint } from "../../modules";

/** Where converted nodes go: their parent (world transform, id), page and drawing order. */
export interface NodePlacement {
  /** The parent's world transform; children's transforms are relative to it. */
  world: FigMatrix;
  parentId: string | null;
  pageId: string;
  /** The node's fractional index among its siblings. */
  index: string;
  /** Where every converted element is collected. */
  out: CanvasElement[];
}

/** Paints that replace a node's own (`figNodeBase`), and whether its fills may be images. */
export interface NodePaints {
  fills?: Paint[];
  strokes?: Paint[];
  allowImages?: boolean;
}
