import type { LibraryItem, LibraryTabInfo, ShownLibrarySection } from "./library.types";
import { libraryItems, librarySections } from "./library-registry";

/** The sections a tab shows, with their items matching the search; empty sections are left out. */
export function shownSections(tab: LibraryTabInfo["id"], query: string): ShownLibrarySection[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const items = libraryItems.all().filter((item) => matches(item, words));
  return librarySections
    .all()
    .filter((section) => tab === "all" || section.tab === tab)
    .map((section) => ({ section, items: items.filter((item) => item.section === section.id) }))
    .filter((shown) => shown.items.length > 0);
}

function matches(item: LibraryItem, words: readonly string[]): boolean {
  if (words.length === 0) return true;
  const text = [item.label, item.description ?? "", ...(item.keywords ?? [])]
    .join(" ")
    .toLowerCase();
  return words.every((word) => text.includes(word));
}
