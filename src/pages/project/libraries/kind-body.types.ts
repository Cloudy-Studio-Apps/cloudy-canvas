import type { LibraryAsset, StyleRecord } from "@canvas";
import type { LibraryKind } from "./library-kinds.types";
import type { LibrarySummary } from "./library-summary.types";

export interface KindBodyProps {
  kind: LibraryKind;
  library: LibrarySummary;
}

export interface ColorsBodyProps {
  library: LibrarySummary;
}

export interface StylesBodyProps {
  styles: readonly StyleRecord[];
}

export interface AssetsBodyProps {
  library: LibrarySummary;
  assets: readonly LibraryAsset[];
  /** Which empty text to show. */
  kind: "images" | "svg";
}
