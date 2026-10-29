# Board HTML export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Export a board as one self-contained, offline, read-only `.html` viewer that draws the board with the real engine, with Schema/ER code panels contributed by modules and plugins.

**Architecture:** A new board feature module `viewer` owns the `boardViewerParts` point, the export-time collector (board content, resized images, fonts, part data, opted-in plugins → one gzipped JSON) and the viewer chrome. A second Vite build (served to the app as `virtual:board-viewer-runtime`) bundles `src/viewer/`: the engine, every board module's canvas side (`<name>.canvas.ts`) through `<name>.viewer.ts` modules, the parts and the chrome, inlined into one HTML file. The export pours the data into that HTML.

**Tech Stack:** TypeScript (strict), React 19, PixiJS 8, Vite + `vite-plugin-singlefile` (new dev dependency), Tailwind v4, Zustand, `CompressionStream`/`DecompressionStream` (gzip).

**Spec:** `docs/superpowers/specs/2026-10-29-board-html-export-design.md` (read it first; this plan argues from it).

## Global Constraints

- Verification is `pnpm lint`, `pnpm typecheck`, `pnpm format:check` only. No test framework; don't run `tauri dev`, cargo or builds unless the task says so (Task 9 runs `vite build` once to inspect the bundle).
- Rules in `CLAUDE.md` apply to every task: types in sibling `.types.ts`; files under ~200 lines; i18n `t` with `locales/en.json` + `locales/es.json`; semantic tokens only; radii 4 px controls / 6 px panels, no pills; `notifyError` for failures; kit components, no raw `<button>`/`<input>`.
- Before changing a folder, read its `README.md` and its parents' up to `src/`; update them in the same task.
- Light theme only in the viewer. Read-only: the document is `setReadOnly(true)` and the only tool is `hand`.
- Images in the file: base64, resized to their placed size × 2, never larger than the original, WebP (quality 0.85); SVG assets kept as they are.
- Plugins: only plugins that export `activateViewer` are embedded; other plugin elements become placeholders (question-mark seal + plugin name, the element's exact bounds).
- Commits: no `Co-Authored-By` lines (user rule).

## Review Focus

1. **A board with no tables and no ER diagrams** → no Schema/ER buttons, just the brand bar and zoom bar. (Task 8 check.)
2. **One picture placed twice at different sizes, or a 6000 px photo placed at 200 px** → embedded once, at the largest placed size × 2, capped at its natural size. (Task 5 check.)
3. **Element of a plugin that's disabled, uninstalled, or has no `activateViewer`** → placeholder image element with the same bounds and the plugin's name ("Unknown plugin" when it can't be named); the export dialog's note counts them. (Task 5 check.)
4. **Content containing `</script>` or non-ASCII text (a sticky saying `</script>`, Spanish accents in DBML)** → the file still opens and shows it; the payload is base64 so nothing is parsed as HTML. (Task 5 check.)
5. **Keys pressed in the viewer (`s`, `v`, `Delete`, `Ctrl+Z`) and double-clicks** → nothing changes, the tool stays `hand`, no selection appears. (Task 7 check.)

---

### Task 1: Placeholder art in the engine

The plugin placeholder reuses the design's question-mark seal; move it where both products reach it.

**Files:**

- Create: `src/canvas/image/placeholder-svg.ts`, `src/canvas/image/placeholder-ink.ts`, `src/canvas/image/placeholder-svg.types.ts`
- Delete: `src/products/design/modules/image/placeholder/placeholder-svg.ts`, `placeholder-ink.ts`
- Modify: `src/canvas/image/index.ts` (export them), `src/products/design/modules/image/placeholder/image-placeholder.ts` and its `index.ts` (import from `@canvas`), `src/products/design/modules/image/README.md`, `src/canvas/README.md` (image folder line)

**Interfaces:**

- Produces: `placeholderSvg(background: string, size: Size, options?: PlaceholderSvgOptions): string`, `PlaceholderSvgOptions { label?: string }`, `placeholderInk(background: string): string`, both from `@canvas`.

- [ ] **Step 1:** Move both files unchanged, then add `options.label`: when set, draw it as one centered `<text>` line under the art (`fill` = the ink, `font-family="Inter, sans-serif"`, font size `min(w, h) * 0.08`, XML-escaped, clipped to the picture width with `textLength` only when it's longer than `w * 0.9`). Without `label` the output is byte-identical to today's.
- [ ] **Step 2:** Run `pnpm lint && pnpm typecheck && pnpm format:check`. Expected: all pass.
- [ ] **Step 3:** Commit `refactor(canvas): placeholder art shared by both products`.

### Task 2: Every board module's canvas side in `<name>.canvas.ts`

The viewer must compose the board's drawing without the editor UI. `er/er.canvas.ts` is the pattern.

**Files:**

- Create: `src/products/board/modules/<name>/<name>.canvas.ts` for `colors, connector, core, db, draw, embed, geo, image, library, section, sticker, sticky, table, text` (only those with `boardCanvas.*` contributions)
- Modify: each `<name>.module.ts` (call `register<Name>Canvas(host)` instead of the inline `boardCanvas.*` contributions), each module's `README.md` (Files list), `docs/modules.md` (Module anatomy: `<name>.canvas.ts` = every `boardCanvas`/`designCanvas` contribution, plain TS, no React or `ui/`)

**Interfaces:**

- Produces: `register<Name>Canvas(host: ModuleHost): void` per module, e.g. `registerDbCanvas`, `registerStickyCanvas` (`registerErCanvas` exists).

- [ ] **Step 1:** For each module, move every `host.contribute(boardCanvas.<point>, …)` into `register<Name>Canvas` in `<name>.canvas.ts`, keeping order; the module file calls it where those lines were. A `.canvas.ts` file imports no React, no `ui/`, no `lucide-react`, no `@board/ui`.
- [ ] **Step 2:** Check no canvas file reaches UI: `grep -lE "react|lucide|/ui|@board/ui|@canvas-ui" src/products/board/modules/*/*.canvas.ts`. Expected: no output.
- [ ] **Step 3:** `pnpm lint && pnpm typecheck && pnpm format:check`. Expected: pass.
- [ ] **Step 4:** Commit `refactor(board): modules' canvas contributions in <name>.canvas.ts`.

### Task 3: The viewer module, its point and file format

**Files:**

- Create in `src/products/board/modules/viewer/`: `viewer.module.ts` (tier `feature`, id `viewer`, `exports: { ...viewerApi, ...viewerUi }`), `viewer.points.ts`, `viewer.types.ts`, `viewer-file.types.ts`, `viewer.i18n.ts`, `locales/en.json`, `locales/es.json`, `index.ts`, `ui/index.ts`, `README.md` (module template)
- Modify: `src/products/board/ui/modules/board-modules.ts` (add `viewerModule` after `libraryModule`), `docs/modules.md` (Module anatomy: `<name>.viewer.ts`, a module for the viewer build: `register<Name>Canvas(host)` plus its viewer parts; may import its `ui/` like the module file), `eslint.config.js` and `scripts/check-modules.mjs` (treat `*.viewer.ts(x)` like `*.module.ts`: React allowed, import rules the same)

**Interfaces:**

- Produces (from `@board/modules/viewer`, `index.ts`):

```ts
/** viewer.points.ts */
export const boardViewerParts = definePoint<ViewerPart>("board.viewerParts", {
  keyOf: (p) => p.id,
});

/** viewer.types.ts */
export interface ViewerPart<D = unknown> {
  id: string;
  /** Export time, in the app: what the file carries for this part; `null` leaves it out. */
  collect(doc: CanvasDocument): D | null;
  /** Its toggle in the brand bar (parts without one only react to clicks). */
  button?: { icon: { svg: string }; label: string; order: number };
  /** Element types a click on which this part handles. */
  types: readonly string[];
  /** The side panel; `element` is the clicked element, `null` when opened by the button. */
  panel?: ComponentType<ViewerPanelProps<D>>;
  /** A click on one of `types` that does something instead of opening the panel (e.g. a link). */
  click?(el: CanvasElement): void;
}
export interface ViewerPanelProps<D = unknown> {
  data: D;
  element: CanvasElement | null;
  close(): void;
}

/** viewer-file.types.ts: the JSON the file carries (gzipped, base64). */
export interface ViewerFile {
  format: 1;
  appVersion: string;
  locale: Locale;
  meta: DocumentMeta;
  elements: CanvasElement[];
  /** Asset id → base64 data URL. */
  assets: Record<string, string>;
  fonts: { request: FontRequest; data: string }[];
  /** Part id → what its `collect` returned (parts that returned `null` are absent). */
  parts: Record<string, unknown>;
  plugins: { id: string; name: string; code: string }[];
}
```

- [ ] **Step 1:** Write the files above. Icons are SVG strings so the viewer bundle doesn't need `lucide-react`. Locale keys (en / es): `bar.viewOnly` "view only" / "solo lectura", `bar.brand` "Cloudy Canvas" (same in es), `zoom.in` "Zoom in" / "Acercar", `zoom.out` "Zoom out" / "Alejar", `zoom.fit` "Fit" / "Ajustar", `panel.all` "All code" / "Todo el código", `panel.copy` "Copy" / "Copiar", `panel.copied` "Copied" / "Copiado", `panel.close` "Close" / "Cerrar", `error.webgl` "This browser can't draw the board (WebGL is off or unavailable)." / "Este navegador no puede dibujar el tablero (WebGL está desactivado o no disponible).", `error.data` "This file is damaged and can't be opened." / "Este archivo está dañado y no se puede abrir.", `export.format` "HTML (view only)" / "HTML (solo lectura)", `export.placeholders` "{count} elements from {plugins} will show as placeholders." / "{count} elementos de {plugins} se verán como marcadores.", `placeholder.unknown` "Unknown plugin" / "Plugin desconocido".
- [ ] **Step 2:** `pnpm lint && pnpm typecheck && pnpm format:check`. Expected: pass.
- [ ] **Step 3:** Commit `feat(board): viewer module and its parts point`.

### Task 4: Export formats contributed by modules

**Files:**

- Modify: `src/canvas-ui/modules/editor-points.types.ts` (add `ExportFormatEntry`, `EditorPoints.exportFormats`), `src/canvas-ui/modules/create-editor-points.ts` (`exportFormats: definePoint(id("exportFormats"), { keyOf: (e) => e.id })`), `src/canvas-ui/components/export-dialog/export-dialog.tsx` (+ split a `use-export-formats.ts` hook if it grows past ~200 lines), `src/canvas-ui/README.md`, `src/canvas-ui/modules/README.md`

**Interfaces:**

- Produces:

```ts
export interface ExportFormatEntry {
  id: string;
  /** Short name in toasts, e.g. "HTML". */
  name: string;
  extension: string;
  label: string;
  /** Exports the whole canvas only: the dialog hides area and background. */
  wholeCanvasOnly: boolean;
  /** A line the dialog shows under the format (e.g. placeholders), or `null`. */
  note?(engine: CanvasEngine): string | null;
  run(engine: CanvasEngine): Promise<Blob | null>;
}
```

- [ ] **Step 1:** `ExportDialog` lists `EXPORT_FORMATS` then the host's `exportFormats` (read through the editor modules context; the design contributes none, so its dialog is unchanged). For a module format: hide area/background, show `note`, call `run` inside the same `toastProgress`, save with `exportFile(blob, name, { extension, label })`.
- [ ] **Step 2:** `pnpm lint && pnpm typecheck && pnpm format:check`. Expected: pass.
- [ ] **Step 3:** Commit `feat(canvas-ui): export formats contributed by modules`.

### Task 5: Plugins opt in with `activateViewer`

**Files:**

- Create: `src/shared/core/plugins/plugin-viewer-sources.ts` (+ `.types.ts`)
- Modify: `src/shared/core/plugins/index.ts`, `src/app/plugins/import-plugin.ts` (after a successful import, when the module exports `activateViewer` as a function, register its code), `src/app/plugins/README.md`, `docs/plugins.md` (new section "In the HTML export", plain words: elements export as a placeholder with your plugin's name unless `main.js` also exports `activateViewer(api)`; then your code is copied into the file and runs in the reviewer's browser; `api` there has `apiVersion`, `plugin` (`id`, `manifest`), `core`, `canvas`, `board` (engine side only), `libs.React`; return the modules that draw (kinds, links, `boardViewerParts` via `host.require("viewer")`, with `uses: ["viewer"]`); nothing edits there; a minimal example with one kind and one part)

**Interfaces:**

- Produces: `pluginViewerSources` from `@shared/core`: `set(id: string, source: PluginViewerSource): void`, `get(id: string): PluginViewerSource | undefined`, `drop(id: string): void`; `PluginViewerSource { name: string; code: string }`. Failed plugins are dropped where `stickerCatalog.drop` is called (`board-modules.ts` `failPlugin`, `load-plugins.ts`).

- [ ] **Step 1:** Implement; `importPlugin` already reads the code (`pluginStorage.readMain`), reuse that string.
- [ ] **Step 2:** `pnpm lint && pnpm typecheck && pnpm format:check`. Expected: pass.
- [ ] **Step 3:** Commit `feat(plugins): plugins opt into the HTML export with activateViewer`.

### Task 6: Export-time collector and the HTML format

**Files (all in `src/products/board/modules/viewer/ui/export/`, one function per file, types in siblings):**

- `collect-elements.ts`: `collectElements(engine: CanvasEngine, doc: CanvasDocument, owners: PluginOwners): { elements: CanvasElement[]; placeholders: PlaceholderCount[]; extraAssets: Record<string, Uint8Array> }`
- `plugin-owners.ts`: `pluginOwners(): PluginOwners` — `PluginOwners.of(type: string): { id: string; name: string } | null` from `getBoardModules().ownerOf(boardCanvas.kinds, type)` → the plugin whose `PluginStatus.modules` lists that module (`usePluginsStore`), name from its manifest
- `collect-assets.ts`: `collectAssets(engine: CanvasEngine, doc: CanvasDocument, elements: readonly CanvasElement[], extra: Record<string, Uint8Array>): Promise<Record<string, string>>`
- `collect-fonts.ts`: `collectFonts(engine: CanvasEngine, elements: readonly CanvasElement[]): Promise<ViewerFile["fonts"]>` (each distinct `kind.fonts(el)` request through `fontLibrary.fontData`; skip `null`)
- `collect-parts.ts`: `collectParts(doc: CanvasDocument): Record<string, unknown>` (every `boardViewerParts` entry's `collect`, `null`s left out)
- `collect-plugins.ts`: `collectPlugins(elements, owners): ViewerFile["plugins"]` (opted-in owners present on the board, plus their `requires`/`uses` that are opted in, from `pluginViewerSources`)
- `encode-viewer-html.ts`: `encodeViewerHtml(runtime: string, file: ViewerFile): Promise<Blob>`
- `export-html.ts`: `exportBoardHtml(engine: CanvasEngine): Promise<Blob>` (calls the above; `runtime` from `await import("virtual:board-viewer-runtime")`, Task 9)
- `html-export-format.ts`: `htmlExportFormat: ExportFormatEntry` (`id: "html"`, `name: "HTML"`, `extension: "html"`, `wholeCanvasOnly: true`, `note` = the placeholder count line or `null`)
- Modify: `viewer.module.ts` (contribute `boardEditor.exportFormats, htmlExportFormat`), viewer `README.md`

**Interfaces:**

- Consumes: `ViewerFile`, `boardViewerParts` (Task 3), `ExportFormatEntry` (Task 4), `pluginViewerSources` (Task 5), `placeholderSvg` (Task 1).

- [ ] **Step 1: elements.** Every element of the board (`engine.elements()`, derived geometry resolved, bottom to top). An element whose type has no registered kind, or whose owner plugin isn't in `pluginViewerSources`, becomes a board image element (the `image` module's element, read its type for the fields) at `elementBounds(kind, el)` (no kind: `x, y, w, h`), same `id` and `index`, showing asset `viewer-placeholder:<pluginId>:<w>x<h>` = `placeholderSvg("#E4E7EB", { w, h }, { label: name })` (name: plugin name, else `t("placeholder.unknown")`). Count them per plugin.
- [ ] **Step 2: assets.** For every element, `kind.assets(el)`; placed long side = `max(bounds.w, bounds.h)`; keep the largest per asset. SVG assets (bytes start with `<svg` or `<?xml`) are kept as `data:image/svg+xml;base64,…`. Others: decode with `createImageBitmap`, scale so the long side is `min(placed × 2, natural long side)`, draw on an `OffscreenCanvas`, `convertToBlob({ type: "image/webp", quality: 0.85 })`; on decode failure keep the original bytes with their sniffed type. Base64 in chunks of 32 KB (never `String.fromCharCode(...bigArray)`).
- [ ] **Step 3: encode.** `JSON.stringify(file)` → `CompressionStream("gzip")` → base64; replace the runtime's single `<!--cloudy-board-data-->` marker with `<script id="cloudy-board" type="application/octet-stream">BASE64</script>`, the `<title>` content with the HTML-escaped title, and add `<meta name="description" content="…">` (escaped). Throw if the marker is missing.
- [ ] **Step 4: Review Focus checks** (read the code against each input and fix what doesn't hold): one asset used at two sizes → one entry at the larger; 6000 px photo at 200 px → 400 px long side; disabled plugin element → placeholder with its name and same bounds; `</script>` in content → only inside base64.
- [ ] **Step 5:** `pnpm lint && pnpm typecheck && pnpm format:check`. Expected: pass (Task 9 adds the `virtual:board-viewer-runtime` declaration; until then declare it in `src/vite-env.d.ts` now: `declare module "virtual:board-viewer-runtime" { const html: string; export default html; }`).
- [ ] **Step 6:** Commit `feat(board): collect a board into a viewer file`.

### Task 7: Viewer chrome

**Files (in `src/products/board/modules/viewer/ui/viewer/`, exported from the module's `ui/index.ts`):**

- `viewer-app.tsx`: `ViewerApp({ file, product }: ViewerAppProps)` — hosts the engine; owns which part's panel is open and the clicked element
- `use-viewer-engine.ts`: creates `CanvasEngine({ product, theme: readCanvasTheme(container), document, fonts })` with `document.setReadOnly(true)`, mounts, sets tool `hand`, and sets it back to `hand` whenever the state's tool changes
- `use-viewer-clicks.ts`: pointerdown/up on the container; when `!pastThreshold(down, up, MOVE_THRESHOLD_PX)`, `engine.elementAt(engine.clientToWorld(up))` → the part whose `types` include its type: `click(el)` or open its panel with `el`; pointer cursor while hovering such an element
- `brand-bar.tsx`: top-left floating card: seal logo (`SealLogo` from `@shared/ui/brand`), "Cloudy Canvas", `/`, title (a button opening `TitlePopover`), "· view only", then one toggle per part with a `button` and data, sorted by `order`, pressed while its panel is open
- `title-popover.tsx`: kit `Popover`, plain text title + description (description omitted when empty), Esc/outside closes
- `zoom-bar.tsx`: bottom-left: −, zoom % (from engine state), +, Fit (`zoomOut`, `zoomIn`, `zoomToFit`)
- `viewer-panel-host.tsx`: right side panel (one open at a time) rendering the part's `panel`
- `viewer-code-panel.tsx`: `ViewerCodePanel({ title, code, onAll, onClose }: ViewerCodePanelProps)` — header with title, All code (hidden when `onAll` is undefined), Copy (`navigator.clipboard.writeText`, then "Copied" for 1.5 s), ✕; body a monospaced `<pre>` that scrolls
- `embedded-font-loader.ts`: `embeddedFontLoader(fonts: ViewerFile["fonts"]): FontLoader` (registers each with `new FontFace(family, bytes, { style, weight })` + `document.fonts.add` once; `load` resolves whether the request is among them)
- `viewer-error.tsx`: full-window message for `error.webgl` / `error.data`

**Interfaces:**

- Consumes: `ViewerFile`, `ViewerPart`, `boardViewerParts` (Task 3).
- Produces: `ViewerApp`, `ViewerAppProps { file: ViewerFile; product: CanvasProduct<BoardToolOptions>; parts: readonly ViewerPart[] }`, `ViewerCodePanel`, `embeddedFontLoader`, `ViewerError`.

- [ ] **Step 1:** Write the components with kit pieces and semantic tokens (floating cards `bg-surface border rounded-lg shadow`, buttons `rounded-md`). Layout follows the approved mockup `viewer-layout-v4.html` (option A).
- [ ] **Step 2: Review Focus check.** Read `use-viewer-engine.ts` + `use-viewer-clicks.ts` against: `s`/`v` keys (tool resets to `hand`), `Delete`/`Ctrl+Z` (document read-only), double-click (hand tool doesn't edit). Nothing may change.
- [ ] **Step 3:** `pnpm lint && pnpm typecheck && pnpm format:check`. Expected: pass.
- [ ] **Step 4:** Commit `feat(board): viewer chrome`.

### Task 8: Built-in parts and the `.viewer.ts` modules

**Files:**

- Create: `src/products/board/modules/db/ui/viewer/db-viewer-part.tsx` (+ `.types.ts`), `src/products/board/modules/er/ui/viewer/er-viewer-part.tsx` (+ `.types.ts`), `src/products/board/modules/embed/embed-viewer-part.ts`
- Create: `src/products/board/modules/<name>/<name>.viewer.ts` for every module with a `.canvas.ts` (incl. `er`), plus `modules/viewer/viewer.viewer.ts` (contributes nothing but its `exports`, so plugins can `require("viewer")`)
- Modify: `db.module.ts`, `er.module.ts`, `embed.module.ts` (also contribute their part to `boardViewerParts` so `collect` runs in the app), READMEs of db, er, embed, viewer

**Interfaces:**

- Consumes: `register<Name>Canvas` (Task 2), `ViewerPart`, `ViewerCodePanel` (Tasks 3, 7), `DbSchema.schemaDbml()/tableDbml(id)/enumDbml(id)`, `ErModel.diagrams()` / `diagram(id).text()`.
- Produces: `dbViewerPart: ViewerPart<DbViewerData>` with `DbViewerData { schema: string; items: Record<string, { name: string; code: string }> }` (tables and enums by id); `erViewerPart: ViewerPart<ErViewerData>` with `ErViewerData { diagrams: Record<string, { name: string; text: string }> }` (an ER element's `diagram` picks one; All code = every diagram's text joined by a blank line); `embedViewerPart` (no button, `click` opens the element's URL with `window.open(url, "_blank", "noopener")`); `<name>ViewerModule` per `.viewer.ts` (same `id`, `requires`, `uses`, `after` as its `.module.ts`).

- [ ] **Step 1:** Parts: `collect` returns `null` when the board has no tables/enums (db) or no diagrams (er). Buttons: db `{ label: t("viewer.schema"), order: 10 }` (en "Schema", es "Esquema"), er `{ label: t("viewer.er"), order: 20 }` (en "ER", es "ER"), keys in each module's locales; icons as SVG strings of the same Lucide glyphs the editor uses (`Database`, the ER icon).
- [ ] **Step 2: Review Focus check.** A board without tables or diagrams: both `collect` return `null`, so `parts` has no `db`/`er` and the bar shows no toggles.
- [ ] **Step 3:** `pnpm lint && pnpm typecheck && pnpm format:check`. Expected: pass.
- [ ] **Step 4:** Commit `feat(board): schema and ER code in the viewer`.

### Task 9: The viewer runtime build

**Files:**

- Create: `src/viewer/index.html` (light theme root, `<!--cloudy-board-data-->` marker, `<title>`), `src/viewer/main.tsx` (imports `../app/styles.css`, reads the file, sets locale with `setLocale`, activates plugins, composes, renders `ViewerApp` or `ViewerError`), `src/viewer/read-viewer-file.ts` (`readViewerFile(): Promise<ViewerFile>`: base64 → `DecompressionStream("gzip")` → JSON; checks `format === 1`), `src/viewer/board-viewer-modules.ts` (the `.viewer.ts` modules in `board-modules.ts`'s order), `src/viewer/viewer-plugins.ts` (`activateViewerPlugins(file): Promise<AppModule[]>`: each plugin's code imported from a `blob:` URL, `activateViewer(createViewerPluginApi(plugin))`; a plugin that throws is skipped, its elements stay as they were exported), `src/viewer/viewer-plugin-api.ts`, `src/viewer/README.md`
- Create: `scripts/vite/viewer-runtime-plugin.ts` (`viewerRuntime(): Plugin` — resolves `virtual:board-viewer-runtime`; `load` runs Vite's `build()` with `vite.viewer.config.ts`, `write: false`, and returns `export default <the HTML as a JSON string>`; cached per process, rebuilt in dev when a file under `src/` changes), `vite.viewer.config.ts` (root `src/viewer`, the same aliases, `react()`, `tailwindcss()`, `viteSingleFile()`, `build.assetsInlineLimit: Infinity`, `define: { __APP_VERSION__ }`)
- Modify: `vite.config.ts` (add `viewerRuntime()`), `tsconfig.node.json` (include the new files), `tsconfig.json` (include `src/viewer`), `eslint.config.js` (layering: `src/viewer` is a shell like `src/app`: may import products' engine and module files, never `@app`, `@pages`, `@platform`, `@tauri-apps/*`), `package.json` (dev dependency `vite-plugin-singlefile`), `src/vite-env.d.ts` (keep the declaration from Task 6), root `CLAUDE.md` "Where to look" tree (`viewer/`)

**Interfaces:**

- Consumes: everything above.
- Produces: `virtual:board-viewer-runtime` (default export: the runtime HTML string with the marker).

- [ ] **Step 1:** `pnpm add -D vite-plugin-singlefile`, then write the files. `composeProduct("board", createModuleHost([...builtIns, ...pluginModules], { isOptional: plugin modules }), boardCanvas)`; the document is a new `CanvasDocument` with the product's kinds, filled with `addUntracked` per element and `addAsset` per asset (data URL → bytes).
- [ ] **Step 2:** Run `pnpm exec vite build --config vite.viewer.config.ts --outDir /tmp/claude-viewer-check` once. Expected: one `index.html`, no other files; `grep -c "@tauri-apps\|__TAURI" /tmp/claude-viewer-check/index.html` prints `0`. If Tauri code is pulled in through a barrel, import that piece from its own file in the viewer chrome instead and re-run.
- [ ] **Step 3:** `pnpm lint && pnpm typecheck && pnpm format:check`. Expected: pass.
- [ ] **Step 4:** Commit `feat(board): HTML viewer runtime build`.

### Task 10: Changelog and final docs

**Files:**

- Modify: `CHANGELOG.md`, `CHANGELOG.es.md` (unreleased, New / Novedades), `src/products/board/README.md` (the viewer module, `.canvas.ts`/`.viewer.ts`), `src/canvas/README.md` export paragraph (HTML is a board module format), `docs/superpowers/specs/2026-10-29-board-html-export-design.md` status → implemented

- [ ] **Step 1:** Entries:
  - en: "**Export boards as HTML.** Send a board to anyone as a single file that opens in their browser, with no installation: they can move around and zoom in as sharp as in the app, and open the code of each table or ER diagram, but can't change anything."
  - es: "**Exporta tableros como HTML.** Envía un tablero a cualquiera en un solo archivo que se abre en su navegador, sin instalar nada: puede moverse y acercarse con la misma nitidez que en la app y ver el código de cada tabla o diagrama ER, pero no puede cambiar nada."
- [ ] **Step 2:** `pnpm lint && pnpm typecheck && pnpm format:check`. Expected: pass.
- [ ] **Step 3:** Commit `docs: HTML export in the changelog and READMEs`.
- [ ] **Step 4:** Ask the user to try it in `pnpm tauri dev`: export a board with tables, an ER diagram, an image and a plugin element; open the file from disk in Chrome and Firefox.
