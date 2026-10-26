import type { CanvasDocument, TokenStore } from "@canvas";

import type { SheetGroup, StyleguideCategory } from "../styleguide.types";

/**
 * A category's groups, or none when reading them throws (a plugin's category): what the sync
 * reads inside every edit must never stop the edit.
 */
export function safeGroups(
  category: StyleguideCategory,
  store: TokenStore,
  doc: CanvasDocument,
): SheetGroup[] {
  try {
    return category.groups(store, doc);
  } catch (error) {
    console.warn(`The design system couldn't read the "${category.id}" category:`, error);
    return [];
  }
}
