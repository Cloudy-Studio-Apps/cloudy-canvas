import type { LibraryAsset } from "@canvas";
import type { LibrarySummary } from "./library-summary.types";

export interface AssetTileProps {
  library: LibrarySummary;
  asset: LibraryAsset;
}
