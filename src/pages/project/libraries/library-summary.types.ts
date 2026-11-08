import type { LibraryAsset, LibraryDocument, StyleRecord } from "@canvas";
import type { LibraryEntry } from "@shared/core";
import type { LibraryColor } from "@pages/shared/projects";
import type { LibraryKind } from "./library-kinds.types";

/** What a library holds, read once per change for the cards, pages and sidebar. */
export interface LibrarySummary {
  entry: LibraryEntry;
  doc: LibraryDocument;
  colors: LibraryColor[];
  textStyles: StyleRecord[];
  effects: StyleRecord[];
  images: LibraryAsset[];
  /** SVGs and icons. */
  svgs: LibraryAsset[];
  /** Names of the mode axes with more than one mode ("Light / Dark"). */
  modes: string[];
}

export type KindCounts = Record<LibraryKind, number>;
