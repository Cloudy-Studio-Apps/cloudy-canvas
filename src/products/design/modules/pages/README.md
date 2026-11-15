# Pages

Pages: one page on screen at a time, each with its own layers and ruler guides, listed under the Layers tab, with PageUp/PageDown and Move to page.

- **Tier:** core
- **Requires:** core, layers
- **Contributes:** kinds `PageKind`; designCanvas: `guides`, `hostCommands`, `kinds`, `onRemove`, `scopes`; designEditor: `contextMenu`, `mainMenu`, `overlays`, `propertySections`, `sessionHooks`; `designMcpTools`, `designMigrations`, `layersTabSections`
- **Points it owns:** `pageSplitSteps` (`ui/pages.points.ts`, exported by `ui/index.ts`): what modules and plugins copy into the new file when a page is split out
- **MCP tools:** `pages_guides_add`, `pages_create`, `pages_delete`, `pages_duplicate`, `pages_guides_list`, `pages_list`, `pages_nodes_move`, `pages_guides_remove`, `pages_rename`, `pages_reorder`, `pages_switch`
- **Files:** `page/` (`PageKind`), `design-pages.ts` (`DESIGN_PAGES`), `page-scopes.ts`, `page-guides.ts`, `ensure-pages.ts` (the migration), `mcp/`, `split/` (copying a page and its pictures into another document), `ui/` (the pages list, Page section, `ui/split/`: Split into new file).

## How it works

- **Pages** (`modules/pages/`): a page is a `page` element (`PageKind`: a record, never drawn or hit; its `index` orders the pages) and every node has `pageId`. A page with `hidden: true` belongs to a feature (the design system's): `pagesOf` leaves it out (`allPagesOf` lists it last), and `PAGE_SCOPES` lists it as a background scope. `PAGE_SCOPES` is the design's `scopes`, so one page is on screen at a time and new nodes land on it (`createNodeBase` leaves `pageId` empty; `prepareTreeCopies` clears it so pastes go to the page on screen). `DESIGN_PAGES` (`DesignPages`) reads and edits them, one undo step each: `add(after, name?)` ("Page N"), `rename`, `duplicate` (the page and its nodes, `cloneElements`), `remove` (with its nodes; never the last page), `reorder(id, position)` and `moveNodes(ids, pageId)` (with descendants, on top, parents left behind become the top of the page). `ensurePages` (a `designMigrations` entry, also run on new designs by `newDesignDocument`) gives a design without pages "Page 1" and puts unplaced nodes on it. `DESIGN_TREE.layers(page)` reads one page's tree. UI (`modules/pages/ui/`): `PagesSection` at the bottom of the Layers tab, contributed to the layers module's `layersTabSections` point (click shows a page, double-click renames, ⋯ or a right-click opens its menu: rename, duplicate, Split into new file (with more than one page), delete; rows drag to reorder, "+" adds one after the current), the Page section (its name, zoom), "Move to page" in the selection's context menu (a `ContextMenuSubmenu`: `canvas-ui` context menu items can be submenus of actions), and the `previousPage`/`nextPage` host commands (PageUp/PageDown, in the main menu). Agent tools: `pages_list`, `pages_switch`, `pages_create`, `pages_rename`, `pages_duplicate`, `pages_delete`, `pages_reorder`, `pages_nodes_move`; every other tool works on the page on screen (`file_get` reports `currentPage`). Each page keeps its ruler guides (`PageElement.guides`, `PAGE_GUIDES` is the design's `guides`; duplicated with the page, frames' guides following their copies; a deleted frame's are dropped by `pruneFrameGuides`, an `onRemove`; kept from Figma pages by `figPageGuides`); the core module's `toggleRulers` (Shift+R), `toggleGuides` (Shift+;) and `clearGuides` host commands (`useViewCommands`, remembered in `ui/stores/design-view-store.ts`) are checkbox items of the main menu (`MainMenuItem.checked`), "Snap to guides" is in the `ZoomMenu`, and agents use `pages_guides_list`, `pages_guides_add` (with an optional `frame`) and `pages_guides_remove` (`mcp/guides.mcp.ts`; `file_get` counts them).

## Split into new file

A page's menu offers **Split into new file…** when the design has more than one page: the page moves
into its own `.cdesign` (`splitPage`, `ui/split/split-page.ts`; `usePageSplit` wires it to the
editor). The new document is built in memory: the page and its layers with the same ids
(`copyPageInto`, `split/`), the source's project link when its libraries are open (`inProject`:
the project's libraries then sync into the new file when it opens), and the page name as its title.
Then the contributed **`pageSplitSteps`** run, sorted by `order` (unset is 100): every step's
`before(ctx)` first (it may ask with `ctx.dialog(render)`, shown by `SplitDialogHost`, an overlay;
returning `false` cancels and nothing is written), then every `copy(ctx, prepared)`, which writes
into `ctx.target` what its module owns. A step checks itself whether the new file needs anything
from it and otherwise does nothing; the pages module never knows the others. The built-ins:
variables (10, the variables and styles: the file's own in a project, all of them outside one),
design system (20, its hidden page when variables were copied), catalog (25, the page's brochures,
and the data sources when one repeats rows), data (30, the data sources when the page has bound
layers), prototype (40, the page's flows). Records that belong to a page by a `page` field
(brochures, flows) aren't layers: without their step the removal's `onRemove` hooks would delete
them from the design and the new file wouldn't have them. Last, `copyUsedAssets` copies the pictures the result uses, and
`saveNewCanvasFile` writes it: next to the current file in a project, else where the Save dialog
says. Only once the file is written does the page leave the design (`DESIGN_PAGES.remove`, one undo
step; undoing it keeps the new file), and the new file opens in a tab. A failure is toasted and
leaves the design as it was. Plugins contribute steps the same way (`docs/plugins.md`, Splitting a
page).
