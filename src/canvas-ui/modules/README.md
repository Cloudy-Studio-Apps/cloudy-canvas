# Module chrome

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md); names may still follow the pre-refactor conventions until their phase (see its Transition table)._

## Editor points

- **Editor points** (`canvas-ui/modules/`, `createEditorPoints(product)`, the board's `boardEditor`): see Editors. **Board points:** `boardMcpTools` and `boardMigrations` (`board-points.ts`; a migration brings an older file's document up to date when it opens), `boardLibrary` (the library module's `ui/library.points.ts`). A module can define points of its own for others to extend.

## Tool entries

- **Tool entries:** every tool the editor shows is a `ToolEntry` on the `tools` point: its `icon` (`ExtensionIcon`), its name and description (an element tool is named by its kind through `element`, read with `toolInfo`, which uses `engine.elementInfo`; other tools give `label` and `description`), and where it's placed. `toolbar: { group, order, menu? }` puts a button on the main toolbar (group 0 is select and hand, group 1 the tools that add elements; built-ins are spaced by 10); without it, the tool isn't on the toolbar. Tools with the same `menu` share one button (`ToolMenuButton`, `toolbarItems`): it shows the active tool or the one picked last, and its chevron lists them all with their shortcuts (the design's shapes). `library` lists it in the library: tools that create an element are listed by default (`library: false` opts out), with `section`, `order` (default: its toolbar position) and `keywords`. `subTools` keep a button active for tools picked from its panel (the eraser). Helpers: `toolbarGroups`, `sortedTools` (shortcut lists), `inLibrary`.

## Module chrome

- **Module chrome (`canvas-ui/modules/`):** an editor provides its modules with `EditorModulesContext` (`{ host, points }`), and the generic pieces read its `EditorPoints`: `ModuleToolbar` (the `tools` entries with a `toolbar` placement, in groups), `ModuleToolOptions` (`toolPanels` by tool, or `selectionPanels` by the selection's type with the select tool), `ModuleSlot` (`sidePanels`, `topBar`), `ModuleSession` (runs the `sessionHooks` and draws the `overlays`), the toolbar's `selectionActions` (buttons for the selection after the tools while the select tool is on: the design's mask button and boolean menu) and the context menu (`contextMenu` groups after the built-in ones). Icons are an `ExtensionIcon` (a Lucide icon or `{ svg }`, `ExtensionIconView`).

## Mode toolbars

- **Mode toolbars** (`mode-toolbar.tsx`): `ModeToolbar` is the toolbar a mode shows in place of the main one (Catalog, ER, vector editing): an optional `title` (label and icon, then a divider), `items` as data (`ModeToolbarEntry`: `"divider"`; `{ tool }`, active while that tool is on, its label, description and icon from its `tools` entry unless given, its shortcut `tool.<id>`; `{ command }`, which runs `engine.runHostAction(command)` with the command's shortcut, active per `activeWhen.tool`; `{ run }`, any callback; `disabled`, `active` and a count `badge` on the last two) and Done, which leaves the mode (`useEditorMode().leave`) unless `onDone` says otherwise. A tool item whose tool has no entry and no label/icon of its own isn't shown. `ModeToolbarItem` draws one item, for a mode that builds its own toolbar.
