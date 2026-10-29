import { elementBounds, type CanvasElement, type CanvasEngine } from "@canvas";
import { bytesToBase64 } from "./bytes-to-base64";
import { imageType } from "./image-type";
import { shrinkImage } from "./shrink-image";

/** Pictures are kept at twice their placed size, so they stay sharp on high-density screens. */
const PIXELS_PER_UNIT = 2;

/**
 * The assets the elements show, as data URLs: SVG files as they are, pictures shrunk to the
 * largest size they're placed at (times two), never larger than the original. `extra` holds the
 * placeholders' SVG files, which aren't in the document.
 */
export async function collectAssets(
  engine: CanvasEngine,
  elements: readonly CanvasElement[],
  extra: Record<string, string>,
): Promise<Record<string, string>> {
  const placed = new Map<string, number>();
  for (const el of elements) {
    const kind = engine.kinds.get(el.type);
    if (!kind) continue;
    const { w, h } = elementBounds(kind, el);
    for (const id of kind.assets(el)) placed.set(id, Math.max(placed.get(id) ?? 0, w, h));
  }

  const assets: Record<string, string> = {};
  for (const [id, size] of placed) {
    const svg = extra[id];
    if (svg !== undefined) {
      assets[id] = `data:image/svg+xml;base64,${bytesToBase64(new TextEncoder().encode(svg))}`;
      continue;
    }
    const bytes = engine.doc.getAsset(id);
    if (!bytes) continue;
    const kept =
      imageType(bytes) === "image/svg+xml"
        ? { bytes, type: "image/svg+xml" }
        : await shrinkImage(bytes, Math.ceil(size * PIXELS_PER_UNIT));
    assets[id] = `data:${kept.type};base64,${bytesToBase64(kept.bytes)}`;
  }
  return assets;
}
