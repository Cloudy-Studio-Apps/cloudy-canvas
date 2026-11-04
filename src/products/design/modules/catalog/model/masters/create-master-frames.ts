import { unionRects, type CanvasDocument, type Size } from "@canvas";

import { isDesignNode } from "../../../core";
import { createFrame } from "../../../frame";
import { ARRANGE_GAPS } from "../arrange/arrange.constants";
import { documentTexts } from "../language/document-texts";
import type { MasterFrames } from "./create-master-frames.types";

/**
 * A new master's frames: one for left pages and one for right pages, `size` each, side by side
 * above everything on design page `page` (so they never sit among the pages), named after the
 * master and their side in the brochure's `language`. Transparent, so a page's own fill shows
 * through; not added yet.
 */
export function createMasterFrames(
  doc: CanvasDocument,
  page: string,
  name: string,
  size: Size,
  language: string,
): MasterFrames {
  const words = documentTexts(language);
  const onPage = doc
    .all()
    .filter((el) => isDesignNode(el) && el.pageId === page && el.parentId === null);
  const area = unionRects(onPage) ?? { x: 0, y: 0, w: 0, h: 0 };
  const gap = ARRANGE_GAPS.spread;
  const y = area.y - size.h - gap;
  const [leftIndex = doc.nextIndex(), rightIndex = leftIndex] = doc.nextIndexes(2);
  const make = (x: number, side: string, index: string) => ({
    ...createFrame({ x, y, w: size.w, h: size.h }, `${name} · ${side}`, index, null),
    pageId: page,
    fills: [],
    clipsContent: true,
  });
  return {
    left: make(area.x, words.left, leftIndex),
    right: make(area.x + size.w, words.right, rightIndex),
  };
}
