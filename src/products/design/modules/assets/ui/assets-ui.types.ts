import type { ReactNode } from "react";

import type { LibraryAsset, LibraryAssetType, Point } from "@canvas";
import type { DropOnCanvas } from "@design/ui/hooks";

/** What the Assets tab's chips show: every picture, or one type. */
export type AssetFilter = "all" | LibraryAssetType;

/** Where a list of pictures comes from: a project library the file uses, or the file itself. */
export interface AssetSource {
  /** Unique among the sources (`file`, or the library's id). */
  key: string;
  /** The library's id; `null` for the file's own. */
  libraryId: string | null;
  /** The library's name (empty for the file). */
  name: string;
  /** Its pictures can be added to here: the file always, a library while its project is open. */
  editable: boolean;
  /** The pictures the design can use, in order. */
  assets: LibraryAsset[];
}

/** A slash-path group of pictures, with its own groups inside. */
export interface AssetNode {
  /** The full group path (`Brand/Logo`); `""` for the root. */
  path: string;
  name: string;
  assets: LibraryAsset[];
  groups: AssetNode[];
}

export type AssetView = "grid" | "list";

/** A picture of a source, as tiles and drags refer to it. */
export interface AssetRef {
  source: AssetSource;
  asset: LibraryAsset;
}

/** A picture dragged out of the tab onto the canvas (`useDropOnCanvas`). */
export type AssetDrag = DropOnCanvas<AssetRef>;

export interface AssetActions {
  /** Places the picture on the canvas: at a world point, or the view's center. */
  place: (ref: AssetRef, at?: Point) => Promise<void>;
  /** The picture's bytes (the file's copy, else the library's file). */
  bytesOf: (ref: AssetRef) => Promise<Uint8Array>;
}

export interface AssetsToolbarProps {
  query: string;
  onQuery: (query: string) => void;
  view: AssetView;
  onView: (view: AssetView) => void;
  filter: AssetFilter;
  onFilter: (filter: AssetFilter) => void;
  /** The "+" menu. */
  add: ReactNode;
}

export interface AddAssetMenuProps {
  sources: readonly AssetSource[];
  /** The group the next uploads go to (`""` for none). */
  group: string;
  onGroup: (group: string) => void;
  /** Uploads to a library, or to the file (`null`). */
  onUpload: (libraryId: string | null) => void;
}

export interface AssetSourceSectionProps {
  source: AssetSource;
  /** The source's pictures that fit the search and the filter. */
  assets: LibraryAsset[];
  view: AssetView;
  /** The search, to open every group while it's on. */
  searching: boolean;
  actions: AssetActions;
  drag: AssetDrag;
  /** Rename, move and delete menu of the file's own pictures. */
  local: LocalAssetActions;
}

export interface AssetGroupProps {
  node: AssetNode;
  depth: number;
  source: AssetSource;
  view: AssetView;
  searching: boolean;
  open: ReadonlySet<string>;
  toggle: (path: string) => void;
  actions: AssetActions;
  drag: AssetDrag;
  local: LocalAssetActions;
}

export interface AssetTileProps {
  source: AssetSource;
  asset: LibraryAsset;
  view: AssetView;
  depth: number;
  actions: AssetActions;
  drag: AssetDrag;
  local: LocalAssetActions;
}

/** The file's own pictures' menu: what it can do and the dialogs to render. */
export interface LocalAssetActions {
  /** Libraries the picture can move to (none without a project open). */
  targets: { id: string; name: string }[];
  rename: (asset: LibraryAsset) => void;
  moveTo: (asset: LibraryAsset, libraryId: string) => void;
  remove: (asset: LibraryAsset) => void;
  /** Whether a layer shows the picture (it can't be deleted then). */
  isUsed: (assetId: string) => boolean;
  dialogs: ReactNode;
}

export interface RenameAssetDialogProps {
  asset: LibraryAsset | null;
  onClose: () => void;
  onRename: (name: string) => void;
}

export interface GroupDialogProps {
  open: boolean;
  group: string;
  onClose: () => void;
  onApply: (group: string) => void;
}

export interface LocalAssetMenuProps {
  asset: LibraryAsset;
  local: LocalAssetActions;
  children: ReactNode;
}

export interface RenameFormProps {
  name: string;
  onClose: () => void;
  onRename: (name: string) => void;
}

/** A picture's thumbnail: its object URL once read, or that it couldn't be. */
export interface AssetUrl {
  url: string | null;
  failed: boolean;
}
