import { imageSize, type CanvasDocument, type Size } from "@canvas";

/** Pictures' natural sizes per document, by asset id (an asset never changes under its id). */
const known = new WeakMap<CanvasDocument, Map<string, Size | null>>();

/** A picture's natural size if it was read already, else `undefined` (see `pictureSize`). */
export function knownPictureSize(doc: CanvasDocument, assetId: string): Size | null | undefined {
  return known.get(doc)?.get(assetId);
}

/** A picture asset's natural size, read from its file once; `null` when it can't be read. */
export async function pictureSize(doc: CanvasDocument, assetId: string): Promise<Size | null> {
  const sizes = known.get(doc) ?? new Map<string, Size | null>();
  known.set(doc, sizes);
  const cached = sizes.get(assetId);
  if (cached !== undefined) return cached;
  const data = doc.getAsset(assetId);
  const read = data ? await imageSize(data) : null;
  const size = read && { w: read.width, h: read.height };
  sizes.set(assetId, size);
  return size;
}
