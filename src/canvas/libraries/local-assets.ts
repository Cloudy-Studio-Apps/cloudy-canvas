import type { CanvasDocument, LibraryAsset } from "../document";
import type { AssetLibraryWriter } from "./local-assets.types";

/** The file's own pictures, in the order they were added (`LibraryAsset.order`). */
export function localAssets(doc: CanvasDocument): LibraryAsset[] {
  return doc.assetIndex().sort((a, b) => (a.order < b.order ? -1 : a.order > b.order ? 1 : 0));
}

/** Adds a picture to the file: its bytes in the doc's assets under `asset.id`, and its record. */
export function addLocalAsset(doc: CanvasDocument, asset: LibraryAsset, bytes: Uint8Array): void {
  doc.addAsset(asset.id, bytes);
  doc.setAssetIndexEntry(asset);
}

/**
 * Takes a picture out of the file: its record and its bytes. Only for one no layer shows (the
 * caller checks); neither is an undo step.
 */
export function removeLocalAsset(doc: CanvasDocument, id: string): void {
  doc.removeAssetIndexEntry(id);
  doc.removeAssets([id]);
}

/**
 * Moves one of the file's own pictures to the library `libraryId`: the library gets the bytes
 * (a picture it has already, by hash, is the one used) and the file's record goes; the file keeps
 * the bytes under the library asset's id too, so it works alone. Layers showing the old picture
 * keep its bytes. Returns the library's asset.
 */
export async function moveAssetToLibrary(
  doc: CanvasDocument,
  writer: AssetLibraryWriter,
  assetId: string,
  libraryId: string,
): Promise<LibraryAsset> {
  const asset = doc.assetIndex().find((item) => item.id === assetId);
  const bytes = doc.getAsset(assetId);
  if (!asset || !bytes) throw new Error(`No picture ${assetId} in this file`);
  const { name, group, type, mime, ext, width, height } = asset;
  const moved = await writer.addAssetFile(libraryId, bytes, {
    name,
    group,
    type,
    mime,
    ext,
    width,
    height,
  });
  if (!doc.hasAsset(moved.id)) doc.addAsset(moved.id, bytes);
  doc.removeAssetIndexEntry(assetId);
  return moved;
}
