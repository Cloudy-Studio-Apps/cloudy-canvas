import { unionRects } from "../geometry";
import type { Rect } from "../geometry.types";
import { canvasBlob } from "./canvas-blob";
import type { ExportHost } from "./export.types";
import type { ThumbnailOptions } from "./thumbnail.types";

/** Space around the content, as a share of the picture. */
const THUMBNAIL_MARGIN = 0.08;
/** Small content isn't drawn larger than this many pixels per world unit. */
const MAX_SCALE = 1;
const JPEG_QUALITY = 0.85;

/**
 * A small JPEG of the whole canvas for file previews: everything, centered, on the canvas
 * background and framed to the picture's proportion. `null` when the canvas is empty.
 */
export async function renderThumbnail(
  host: ExportHost,
  { width, height }: ThumbnailOptions,
): Promise<Blob | null> {
  const elements = host.elementsOf("board");
  const content = unionRects(elements.map((el) => host.bounds(el)));
  if (!content) return null;

  const room = 1 - THUMBNAIL_MARGIN * 2;
  const scale = Math.min((width * room) / content.w, (height * room) / content.h, MAX_SCALE);
  const canvas = await host.snapshot(elements, {
    rect: framed(content, width / scale, height / scale),
    scale,
    background: host.background,
    links: host.createLinks(),
  });
  return canvasBlob(canvas, "image/jpeg", JPEG_QUALITY);
}

/** A `w` × `h` rect centered on the content. */
function framed(content: Rect, w: number, h: number): Rect {
  return { x: content.x + (content.w - w) / 2, y: content.y + (content.h - h) / 2, w, h };
}
