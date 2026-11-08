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
 * Takes a picture out of the file's list (its record). Its bytes stay in the document's assets,
 * so layers showing it, and undoing the deletion of one that did, still work; only a picture no
 * layer shows is deleted (the caller checks).
 */
export function removeLocalAsset(doc: CanvasDocument, id: string): void {
  doc.removeAssetIndexEntry(id);
}

/**
 * Moves one of the file's own pictures to the library `libraryId`. The library takes the picture
 * under the same id, so the layers showing it already point at the library's asset (the bytes are
 * in the file under that id, which the library mirror sees). Only when the library has the same
 * bytes already, under another id, `relink(from, to)` is called, after a checkpoint, to point the
 * layers at that one (one undo step); the file keeps the bytes under both ids. The file's record
 * goes either way. Returns the library's asset.
 */
export async function moveAssetToLibrary(
  doc: CanvasDocument,
  writer: AssetLibraryWriter,
  assetId: string,
  libraryId: string,
  relink?: (from: string, to: string) => void,
): Promise<LibraryAsset> {
  const asset = doc.assetIndex().find((item) => item.id === assetId);
  const bytes = doc.getAsset(assetId);
  if (!asset || !bytes) throw new Error(`No picture ${assetId} in this file`);
  const { name, group, type, mime, ext, width, height } = asset;
  const moved = await writer.addAssetFile(
    libraryId,
    bytes,
    { name, group, type, mime, ext, width, height },
    assetId,
  );
  if (!doc.hasAsset(moved.id)) doc.addAsset(moved.id, bytes);
  if (moved.id !== assetId && relink) {
    doc.checkpoint();
    relink(assetId, moved.id);
  }
  doc.removeAssetIndexEntry(assetId);
  return moved;
}
