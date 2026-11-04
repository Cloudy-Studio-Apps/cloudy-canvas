import {
  BookMarked,
  Bookmark,
  CalendarDays,
  FileDigit,
  FileSymlink,
  Hash,
  Heading,
  TableOfContents,
  type LucideIcon,
} from "lucide-react";

import { PAGE_ITEMS } from "../../model/page-items/page-item-library";
import type { PageItemEntry } from "../catalog.points.types";

const ICONS: Record<string, LucideIcon> = {
  "page-number": Hash,
  "page-of": FileDigit,
  title: Heading,
  section: Bookmark,
  folio: BookMarked,
  date: CalendarDays,
  toc: TableOfContents,
  "page-ref": FileSymlink,
};

/** The built-in page items with their icons, as the catalog module contributes them. */
export const BUILT_IN_PAGE_ITEMS: PageItemEntry[] = PAGE_ITEMS.map((item) => ({
  ...item,
  icon: ICONS[item.id] ?? Hash,
}));
