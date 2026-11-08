import type { CanvasDocument } from "@canvas";

import { isDesignNode, nodePaintStacks } from "../../core";
import { countedUse } from "../../pages";
import type { DocImage } from "./sources.types";

/**
 * The images the user's layers show (image fills, vectors' areas' too), once each, named after the
 * first layer.
 */
export function collectImages(doc: CanvasDocument): DocImage[] {
  const counts = countedUse(doc);
  const seen = new Map<string, DocImage>();
  for (const el of doc.all()) {
    if (!isDesignNode(el) || !counts(el.id)) continue;
    const fills = nodePaintStacks(el).filter((stack) => stack.path !== "strokes");
    for (const paint of fills.flatMap((stack) => stack.paints)) {
      if (paint.type !== "image" || seen.has(paint.assetId) || !doc.hasAsset(paint.assetId)) {
        continue;
      }
      seen.set(paint.assetId, { assetId: paint.assetId, name: el.name, pageId: el.pageId });
    }
  }
  return [...seen.values()];
}
