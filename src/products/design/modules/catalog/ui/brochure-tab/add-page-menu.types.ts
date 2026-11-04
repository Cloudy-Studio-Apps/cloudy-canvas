import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import type { BrochurePage } from "../../model/brochure-pages.types";

/** Something the page list's add menus add: a blank page, a section on a new page. */
export interface AddPageEntry {
  id: string;
  label: string;
  icon: LucideIcon;
  run: () => void;
}

export interface AddPageMenuProps {
  entries: readonly AddPageEntry[];
}

export interface PagesListMenuProps {
  /** What a right-click on the list (not on a page) adds, at the end. */
  entries: readonly AddPageEntry[];
  children: ReactNode;
}

export interface PageRowMenuProps {
  page: BrochurePage;
  /** The row the menu opens on. */
  children: ReactNode;
}
