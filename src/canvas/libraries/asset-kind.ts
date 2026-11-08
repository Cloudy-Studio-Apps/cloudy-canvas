import type { LibraryAssetKind, LibraryAssetType } from "./library-asset.types";

/** Which products can use an asset of `type`: every type today (components will be product-bound). */
export function assetKindOf(type: LibraryAssetType): LibraryAssetKind {
  void type;
  return "any";
}
