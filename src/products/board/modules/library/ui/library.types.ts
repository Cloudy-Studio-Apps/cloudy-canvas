import type { BoardEngine } from "../../../board-engine.types";
import type { ExtensionIcon } from "@canvas-ui";

/** A tab of the library besides "All", which shows every section. */
export type LibraryTab = "templates" | "lists" | "widgets";

export interface LibraryTabInfo {
  id: LibraryTab | "all";
  label: string;
}

/** A titled group of items. */
export interface LibrarySection {
  id: string;
  title: string;
  description: string;
  /** The tab it's listed under besides "All"; without one, it's shown only under "All". */
  tab?: LibraryTab;
  /** Position in the library, lowest first. */
  order: number;
}

/** Something the library inserts or starts: a tool, a template, a widget, … */
export interface LibraryItem {
  id: string;
  /** The id of its section. */
  section: string;
  /** Position within its section, lowest first. */
  order: number;
  label: string;
  description?: string;
  icon: ExtensionIcon;
  /** More words the search matches. */
  keywords?: readonly string[];
  /** Shown but not usable yet. */
  comingSoon?: boolean;
  /** What picking it does; the library closes afterwards. */
  run?: (engine: BoardEngine) => void;
}

/** A section with the items the current tab and search show. */
export interface ShownLibrarySection {
  section: LibrarySection;
  items: LibraryItem[];
}

export interface LibraryPanelProps {
  onClose: () => void;
}

export interface LibrarySectionViewProps {
  section: LibrarySection;
  items: readonly LibraryItem[];
  onPick: (item: LibraryItem) => void;
}

export interface LibraryCardProps {
  item: LibraryItem;
  onPick: (item: LibraryItem) => void;
}
