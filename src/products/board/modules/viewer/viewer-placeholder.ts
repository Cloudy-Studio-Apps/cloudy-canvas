import { placeholderSvg } from "@canvas";

import { createImage } from "../image";
import type { PlaceholderSpot, ViewerPlaceholder } from "./viewer-placeholder.types";

/** The placeholder's background: the same grey as the design's image placeholders. */
const BACKGROUND = "#E4E7EB";

/**
 * An image element in `spot`'s place showing the question-mark seal with `name` under it (the
 * plugin the element comes from), for elements the viewer can't draw.
 */
export function viewerPlaceholder(spot: PlaceholderSpot, name: string): ViewerPlaceholder {
  const w = Math.max(1, Math.round(spot.w));
  const h = Math.max(1, Math.round(spot.h));
  const assetId = `viewer-placeholder:${encodeURIComponent(name)}:${w}x${h}`;
  const element = {
    ...createImage(assetId, spot, spot.index),
    id: spot.id,
    background: "none" as const,
    padding: 0,
  };
  return { element, assetId, svg: placeholderSvg(BACKGROUND, { w, h }, { label: name }) };
}
