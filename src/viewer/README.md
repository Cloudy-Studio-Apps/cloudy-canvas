# Viewer (the HTML export's runtime)

_How it works. The rules are in the root [CLAUDE.md](../../CLAUDE.md)._

The page inside every exported board HTML file: a shell like `app/`, built on its own into one
self-contained HTML file and run in a reviewer's browser, offline. It reads the board the file
carries, draws it read-only and shows the viewer chrome (the board's `viewer` module,
`src/products/board/modules/viewer/`).

## How it's built

- `vite.viewer.config.ts` builds `index.html` + `main.tsx` with `vite-plugin-singlefile` (scripts,
  styles, fonts and pictures inlined; the project is the root so Tailwind finds every module's
  classes). `scripts/vite/viewer-runtime-plugin.ts` runs that build when the app first imports
  `virtual:board-viewer-runtime` (the HTML export, at export time) and hands the HTML over as a
  string; in dev it's built again after a source file changes.
- It must not reach the platform or the editor: ESLint forbids `@platform`, `@tauri-apps/*`,
  `@app` and `@pages` here, and the viewer chrome imports `@canvas-ui` pieces from their files, not
  the barrel (which pulls in Tauri). `stubs/emoji-catalog.ts` replaces the emoji sticker catalog
  (about a megabyte the viewer never offers).
- `index.html` holds `<!--cloudy-board-data-->`, where the export puts the board.

## How it runs

- `viewer-i18n-boot.ts` (first import) sets the locale from `<html lang>`, which the export writes.
- `apply-viewer-theme.ts`: the base (light) theme's tokens on `:root`.
- `read-viewer-file.ts`: the `#cloudy-board` script's base64 → gzip → `ViewerFile` JSON.
- `open-viewer-board.ts`: runs the plugins' `activateViewer` (`viewer-plugins.ts`, from `blob:`
  URLs, with `viewer-plugin-api.ts`: `core`, `canvas`, `board` engine side, `libs.React`), composes
  the board from `BOARD_VIEWER_MODULES` (`board-viewer-modules.ts`: each module's `.viewer.ts`, in
  the board's order) plus theirs (optional: one that fails is left out), fills a document with the
  file's assets and elements, and swaps for placeholders the elements of a plugin that failed or of a type nothing registered.
- `main.tsx` renders `ViewerApp`, or `ViewerError` when the file can't be read.
