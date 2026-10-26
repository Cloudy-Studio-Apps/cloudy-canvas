# Library

_How it works. The rules are in the root [CLAUDE.md](../../../../../../CLAUDE.md); names may still follow the pre-refactor conventions until their phase (see its Transition table)._

## Library

- **Library:** the toolbar's last button (Shift+I, the `openLibrary` host command) opens the library panel (`ui/components/library/`): tabs (All, Templates, Lists, Widgets), one search, and sections of cards. Its content is two points, `boardLibrary.sections` and `boardLibrary.items` (sorted by `order`; built-ins in `library-catalog.ts`), plus a card per tool entry that's `inLibrary` (`toolLibraryItems`: its icon, its name and description, picking it switches to the tool; in the `LIBRARY_TOOLS_SECTION` unless its placement names another); an item's `run(engine)` does what picking it does, and `comingSoon` items are shown disabled. Modules contribute new templates, lists and widgets there. Open state is `libraryOpen` in `board-panel-store`.
