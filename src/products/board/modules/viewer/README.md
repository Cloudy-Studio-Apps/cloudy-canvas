# Viewer (HTML export)

Exports a board as one `.html` file that anyone opens in a browser, with nothing to install: the
board drawn exactly as in the app, sharp at any zoom, to move around and read but never change.
Modules add toggles and side panels to it (the schema's DBML, the ER text) and plugins can too.

- **Tier:** feature
- **Requires:** —
- **Contributes:** boardEditor: `exportFormats` (HTML)
- **Points it owns:** `boardViewerParts` (`ui/viewer.points.ts`): what modules and plugins add to
  the viewer
- **MCP tools:** —
- **Files:** `viewer-file.types.ts` (`ViewerFile`, what the file carries), `viewer-placeholder.ts`,
  `ui/viewer-part.types.ts` (`ViewerPart`), `ui/viewer.points.ts`, `ui/export/` (making the file).

## How it works

- **Parts:** a `ViewerPart` has two halves linked by its `id`. `collect(doc)` runs in the app when
  exporting and returns the JSON the file carries for it (`null`: the board has nothing for it, so
  it doesn't show). In the file, its `button` toggles its `panel`, and a click on one of its `types`
  opens the panel on that element or runs its `click`. A module contributes the same part from its
  `.module.ts` (so `collect` runs) and its `.viewer.ts` (the module the viewer build loads).
- **Exporting** (`ui/export/`, `htmlExportFormat` in the Export dialog, `exportBoardHtml(engine)`):
  - `collectElements`: the board's elements bottom to top. An element of a plugin without
    `activateViewer` (`pluginOfType`: the module that registered its kind, then `loadedPlugins`),
    and every element of a type nothing registers (`doc.unregistered()`, named "Unknown plugin"),
    becomes a placeholder: an image element in its box showing the question-mark seal with the
    plugin's name (`viewerPlaceholder`, `placeholderSvg` from `@canvas`). The dialog's note counts
    them per plugin.
  - `collectAssets`: each asset the elements show (`kind.assets`), as a data URL: SVG files as they
    are; pictures shrunk to the largest box they're placed in, times two, as WebP (`shrinkImage`;
    the original when that isn't smaller or can't be decoded); assets nothing shows are left out.
  - `collectFonts`: the faces the text uses (`kind.fonts`) whose files `fontLibrary` has.
  - `collectParts`: each `boardViewerParts` entry's `collect(doc)`.
  - `collectPlugins`: every loaded plugin with `activateViewer`, its code and its types on the board.
  - `encodeViewerHtml`: the JSON gzipped and base64 into the runtime (`virtual:board-viewer-runtime`,
    loaded only when exporting) in place of `<!--cloudy-board-data-->`, with the board's title and
    description as the page's `<title>` and meta description.
