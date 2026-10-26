# Library

The library of widgets, templates and more (the toolbar's last button, Shift+I): tabs, one search and sections of cards that start a tool or place a template.

- **Tier:** core
- **Requires:** —
- **Contributes:** boardCanvas: `hostCommands`; boardLibrary: `items`, `sections`
- **Points it owns:** `boardLibrary.sections`, `boardLibrary.items` (`ui/library.points.ts`): what the library lists; modules' tools list themselves through their entries, plugins add sections and items
- **MCP tools:** —
- **Files:** `library.module.ts`, `ui/` (`library.points.ts`, `library-catalog.ts` (built-in sections and items), `library-command.ts`, `library-panel.tsx`, `library-button.tsx`, `library-filter.ts`, `library-tool-items.ts`).

## How it works

- **Library:** the toolbar's last button (Shift+I, the `openLibrary` host command) opens the library panel (`ui/`): tabs (All, Templates, Lists, Widgets), one search, and sections of cards. Its content is two points, `boardLibrary.sections` and `boardLibrary.items` (sorted by `order`; built-ins in `library-catalog.ts`), plus a card per tool entry that's `inLibrary` (`toolLibraryItems`: its icon, its name and description, picking it switches to the tool; in the `LIBRARY_TOOLS_SECTION` unless its placement names another); an item's `run(engine)` does what picking it does, and `comingSoon` items are shown disabled. Modules contribute new templates, lists and widgets there. Open state is `libraryOpen` in `board-panel-store`.
