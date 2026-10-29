# Viewer (HTML export)

Exports a board as one `.html` file that anyone opens in a browser, with nothing to install: the
board drawn exactly as in the app, sharp at any zoom, to move around and read but never change.
Modules add toggles and side panels to it (the schema's DBML, the ER text) and plugins can too.

- **Tier:** feature
- **Requires:** —
- **Contributes:** —
- **Points it owns:** `boardViewerParts` (`ui/viewer.points.ts`): what modules and plugins add to
  the viewer
- **MCP tools:** —
- **Files:** `viewer-file.types.ts` (`ViewerFile`, what the file carries), `ui/viewer-part.types.ts`
  (`ViewerPart`), `ui/viewer.points.ts`.

## How it works

- **Parts:** a `ViewerPart` has two halves linked by its `id`. `collect(doc)` runs in the app when
  exporting and returns the JSON the file carries for it (`null`: the board has nothing for it, so
  it doesn't show). In the file, its `button` toggles its `panel`, and a click on one of its `types`
  opens the panel on that element or runs its `click`. A module contributes the same part from its
  `.module.ts` (so `collect` runs) and its `.viewer.ts` (the module the viewer build loads).
