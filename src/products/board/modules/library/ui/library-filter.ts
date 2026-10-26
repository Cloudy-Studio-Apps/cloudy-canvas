import type { BoardEngine } from "../../../board-engine.types";
import type { ModuleHost } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { boardLibrary } from "./library.points";
import { toolLibraryItems } from "./library-tool-items";
import type { LibraryItem, LibraryTabInfo, ShownLibrarySection } from "./library.types";

/**
 * The sections a tab shows, with their items matching the search; empty sections are left out.
 * The items are the ones modules contribute plus a card per tool (see `toolLibraryItems`).
 */
export function shownSections(
  modules: ModuleHost,
  engine: BoardEngine,
  tab: LibraryTabInfo["id"],
  query: string,
): ShownLibrarySection[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const items = byOrder([
    ...toolLibraryItems(modules.get(boardEditor.tools), engine),
    ...modules.get(boardLibrary.items),
  ]).filter((item) => matches(item, words));
  return byOrder(modules.get(boardLibrary.sections))
    .filter((section) => tab === "all" || section.tab === tab)
    .map((section) => ({ section, items: items.filter((item) => item.section === section.id) }))
    .filter((shown) => shown.items.length > 0);
}

function byOrder<T extends { order: number }>(entries: readonly T[]): T[] {
  return [...entries].sort((a, b) => a.order - b.order);
}

function matches(item: LibraryItem, words: readonly string[]): boolean {
  if (words.length === 0) return true;
  const text = [item.label, item.description ?? "", ...(item.keywords ?? [])]
    .join(" ")
    .toLowerCase();
  return words.every((word) => text.includes(word));
}
