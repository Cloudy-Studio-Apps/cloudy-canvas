import { Registry } from "@canvas";
import { BUILT_IN_ITEMS, BUILT_IN_SECTIONS } from "./library-catalog";
import type { LibraryItem, LibrarySection } from "./library.types";

/** The library's sections. Features and plugins register theirs before the editor opens. */
export const librarySections = new Registry<LibrarySection>("library section", (s) => s.id);

/** Everything the library lists, each in a registered section. */
export const libraryItems = new Registry<LibraryItem>("library item", (item) => item.id);

for (const section of BUILT_IN_SECTIONS) librarySections.register(section);
for (const item of BUILT_IN_ITEMS) libraryItems.register(item);
