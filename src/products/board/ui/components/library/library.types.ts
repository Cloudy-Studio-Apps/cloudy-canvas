import type { LucideIcon } from "lucide-react";

import type { BoardEngine } from "@board";

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
}

/** Something the library inserts or starts: a tool, a template, a widget, … */
export interface LibraryItem {
  id: string;
  /** The id of its section. */
  section: string;
  label: string;
  description?: string;
  icon: LucideIcon;
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
