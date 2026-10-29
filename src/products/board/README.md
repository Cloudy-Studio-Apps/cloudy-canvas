# Board

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

## Options

- **Options:** each module declares the options it owns (`StickyToolOptions`, `DbToolOptions`) and `BoardToolOptions` extends them; a plugin augments it (`declare module "@board" { interface BoardToolOptions extends MyOptions {} }`) and contributes the defaults.

## The board's modules

- **The board's modules** are listed in `products/board/ui/modules/board-modules.ts`: `core` (the select and hand buttons, the agent tools that work on any element, in `agent/`), `library` (the library's command and built-in content), and one per feature. Plugins call `registerBoardModule(module)` before a board opens; the modules load on first use (`getBoardModules()`, `getBoardProduct()`, `getBoardEditorModules()`). New board features are written as modules. Each module with a canvas side keeps it in `<name>.canvas.ts` and has a `<name>.viewer.ts`, the module the HTML export's viewer (`src/viewer/`, the `viewer` module) loads instead: it draws the board without the editor.

## Example: `modules/sticky/sticky.module.ts` contributes the

- Example: `modules/sticky/sticky.module.ts` contributes the kind, the tool with its `S` key, the `stickyColor` default, the tool entry (toolbar position; it's listed in the library too) and the color panel (for the tool and for selected notes).
