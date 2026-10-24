import type { CanvasElement } from "@canvas";

import { isDesignNode, withDescendants } from "../../core";
import type { PagePicture } from "./page-pictures.types";

/** The pictures on a page: the image fills of the layers inside its frame, in drawing order. */
export function pagePictures(elements: readonly CanvasElement[], frameId: string): PagePicture[] {
  const nodes = elements.filter(isDesignNode);
  const inside = withDescendants(new Set([frameId]), nodes);
  return nodes.flatMap((node) =>
    inside.has(node.id)
      ? node.fills.flatMap((paint, fill) => (paint.type === "image" ? [{ node, fill, paint }] : []))
      : [],
  );
}
