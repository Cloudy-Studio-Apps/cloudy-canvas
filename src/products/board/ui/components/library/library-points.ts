import { definePoint } from "@shared/core";

import type { LibraryItem, LibrarySection } from "./library.types";

/** What the library lists: sections, and the items in them. Modules contribute both. */
export const boardLibrary = {
  sections: definePoint<LibrarySection>("board.library.sections", { keyOf: (s) => s.id }),
  items: definePoint<LibraryItem>("board.library.items", { keyOf: (item) => item.id }),
};
