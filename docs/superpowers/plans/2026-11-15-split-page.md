# Split a page into a new file — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Right-click a page in the Pages list for its menu; "Split into new file…" moves the page
into its own `.cdesign`, and modules/plugins copy what they own through a `pageSplitSteps` hook.

**Architecture:** The pages module (core) builds the new document in memory (the page, its layers,
the pictures they use, the project link), runs every contributed step (`before`, then `copy`),
writes the file through a new `canvas-ui` helper, opens it in a tab, and only then removes the page
from the source. Variables, the design system (styleguide) and data each contribute a step that
copies only when the new file needs it.

**Tech Stack:** TypeScript (strict), React 19, Yjs `CanvasDocument`, the module host (`definePoint`,
`host.contribute`), react-router, Radix dropdown (`@shared/ui/kit`).

**Spec:** `docs/superpowers/specs/2026-11-15-split-page-design.md`

## Global Constraints

- No test framework: every task verifies with `pnpm lint`, `pnpm typecheck`, `pnpm format:check`
  (run from the repo root). Don't run `tauri dev`, cargo or builds.
- Every `interface`/`type` in a sibling `<file>.types.ts`, imported with `import type`.
- User-facing text through the folder's `t` (`pages.i18n.ts`, `locales/en.json` + `es.json`); generic
  words via `tCommon`. Thrown errors / console stay English.
- Report failures with `notifyError(title, error)`; never only `console.error`.
- Core (pages) never imports variables / styleguide / data: they contribute to its point.
- Work on master. Commit messages have **no** `Co-Authored-By` or Claude attribution line.
- Changelog (Task 6): one entry under the unreleased `New` / `Novedades`, no internal names, no
  product names (Figma/FigJam).

## Review Focus

1. **The write fails or the Save dialog is cancelled** → the source file keeps the page; nothing
   removed. (Task 3: removal happens only after `saveNewCanvasFile` returned a `FileInfo`.)
2. **A step's `before` returns `false`** → no file written, source untouched. (Task 3, `splitPage`.)
3. **The page being split is the one on screen** → after removal the editor shows another page,
   as Delete does (`DESIGN_PAGES.remove` already moves the scope; Task 3 checks by reading it).
4. **Only one visible page** → the menu item is absent (the design system's hidden page doesn't
   count: use `pagesOf`/`DESIGN_PAGES.pages()`, never `allPagesOf`). (Task 3.)
5. **In a project but the current file was never saved (`path` null)** → falls back to the Save
   dialog instead of writing nowhere. (Task 3, `folder` computation.)

---

### Task 1: `saveNewCanvasFile` helper (canvas-ui)

**Files:**

- Create: `src/canvas-ui/file/save-new-canvas-file.ts`, `src/canvas-ui/file/save-new-canvas-file.types.ts`
- Modify: `src/canvas-ui/file/index.ts`, `src/canvas-ui/index.ts` (export it), `src/canvas-ui/file/README.md` (one line)

**Interfaces:**

- Produces:

  ```ts
  interface SaveNewCanvasFileInput {
    doc: CanvasDocument;
    format: CanvasFileFormat;
    /** File name without extension (the page's name). */
    name: string;
    /** Folder to write into without asking; `null` asks with the Save dialog. */
    folder: string | null;
  }
  function saveNewCanvasFile(input: SaveNewCanvasFileInput): Promise<FileInfo | null>; // null: dialog cancelled
  ```

- [ ] **Step 1:** Implement: `path = folder ? await freeFilePath(folder, name, FILE_EXTENSIONS[format.type]) : await saveCanvasFileDialog(format.type, name)`; `null` path → return `null`; else `return saveCanvasDocument({ id: createId(), doc, info: null, format, dir: null, path })`. Errors propagate (the caller toasts).
- [ ] **Step 2:** Add one sentence to `canvas-ui/file/README.md` (Files section): what it does and that the page split uses it.
- [ ] **Step 3:** `pnpm lint && pnpm typecheck && pnpm format:check` — all pass.
- [ ] **Step 4:** Commit `feat(files): saveNewCanvasFile writes a new document next to a folder or via Save`.

### Task 2: Copy helpers (pages engine side)

**Files:**

- Create: `src/products/design/modules/pages/split/copy-page-into.ts`, `src/products/design/modules/pages/split/copy-used-assets.ts`, `src/products/design/modules/pages/split/index.ts`
- Modify: `src/products/design/modules/pages/index.ts` (export both)

**Interfaces:**

- Produces:

  ```ts
  /** Adds page `pageId` and every element with that `pageId` to `target` untracked, same ids. Returns the copied nodes (not the page). */
  function copyPageInto(
    source: CanvasDocument,
    target: CanvasDocument,
    pageId: string,
  ): CanvasElement[];
  /** Copies into `target` the bytes (and `assetIndex` entries) of every source asset whose id appears in target's elements or token records. */
  function copyUsedAssets(source: CanvasDocument, target: CanvasDocument): void;
  ```

- [ ] **Step 1:** `copyPageInto`: page = `source.get(pageId)`, throw `Error("No page ${pageId}")` when missing; nodes = `source.all()` filtered by `(el as { pageId?: unknown }).pageId === pageId`; `target.addAllUntracked([page, ...nodes])`.
- [ ] **Step 2:** `copyUsedAssets`: `text = JSON.stringify(target.all()) + JSON.stringify(target.tokenRecords())`; for each `id` of `source.assetIds()` with `text.includes(id)`: `target.addAsset(id, bytes)`; then each `source.assetIndex()` entry with a copied id → `target.setAssetIndexEntry(entry)`. Comment: `// shortcut: finds uses by searching the data for the id, upgrade if an asset id can appear without being a use`.
- [ ] **Step 3:** lint / typecheck / format:check pass.
- [ ] **Step 4:** Commit `feat(pages): copy a page and the pictures it uses into another document`.

### Task 3: The hook, the split and the menu (pages UI)

**Files:**

- Create: `modules/pages/ui/pages.points.ts` (+ `.types.ts`), `modules/pages/ui/split/split-page.ts` (+ `.types.ts`), `modules/pages/ui/split/use-page-split.ts`, `modules/pages/ui/split/split-dialog-host.tsx` + `split-dialog-store.ts` (+ types)
- Modify: `modules/pages/ui/index.ts`, `ui/page-menu.tsx`, `ui/page-row.tsx`, `ui/page-row.types.ts`, `pages.module.ts`, `locales/en.json`, `locales/es.json`, `README.md`
- (all paths under `src/products/design/`)

**Interfaces:**

- Consumes: `saveNewCanvasFile` (Task 1, `@canvas-ui`), `copyPageInto`, `copyUsedAssets` (Task 2), `useProjectLibrariesState()` and `useCanvasFile()` (`@canvas-ui`), `parentFolder` (`@shared/core`), `DESIGN_FILE_FORMAT` (`@design/ui`), `useEditorModules().host`.
- Produces (exported from `modules/pages/ui/index.ts`, so `host.require("pages")` gives them to plugins):

  ```ts
  interface PageSplitContext {
    source: CanvasDocument;
    target: CanvasDocument; // page + its layers already in it
    page: PageElement;
    nodes: readonly CanvasElement[]; // the page's layers, as copied
    inProject: boolean; // project libraries status "ready"
    /** Shows a dialog over the editor; resolves with what `done` gets (null: cancelled). */
    dialog<T>(render: (done: (value: T | null) => void) => ReactNode): Promise<T | null>;
  }
  interface PageSplitStep {
    id: string;
    order?: number; // default 100; built-ins: variables 10, styleguide 20, data 30
    before?(ctx: PageSplitContext): unknown | Promise<unknown>; // `false` cancels the split
    copy?(ctx: PageSplitContext, prepared: unknown): void | Promise<void>;
  }
  const pageSplitSteps: Point<PageSplitStep>; // definePoint("design.pageSplitSteps", { keyOf: (s) => s.id })
  ```

- [ ] **Step 1: Point.** `pages.points.ts` like `layers/ui/layers.points.ts`.
- [ ] **Step 2: Dialog host.** A `Store` (`@canvas`) holding the current `ReactNode | null`; `dialog()` sets it and resolves when `done` runs (then clears). `SplitDialogHost` renders the store's node; contributed in `pages.module.ts` as `designEditor.overlays` `{ id: "pages.split-dialog", component: SplitDialogHost }`.
- [ ] **Step 3: `splitPage(input)`** in `split-page.ts`, plain async (no React):
  ```ts
  interface SplitPageInput {
    engine: DesignEngine;
    pageId: string;
    steps: readonly PageSplitStep[];
    inProject: boolean;
    folder: string | null;
    dialog: PageSplitContext["dialog"];
  }
  function splitPage(input: SplitPageInput): Promise<FileInfo | null>;
  ```
  Order: target = `new CanvasDocument(engine.kinds)`; `nodes = copyPageInto(engine.doc, target, pageId)`; when `inProject`, `target.setProjectLink(engine.doc.projectLink())`; `target.setMeta({ title: page.name })`; steps sorted by `order ?? 100`; every `before` (a result `=== false` → return `null`); every `copy(ctx, prepared)`; `copyUsedAssets(engine.doc, target)`; `file = await saveNewCanvasFile({ doc: target, format: DESIGN_FILE_FORMAT, name: page.name, folder })`; `null` → `target.destroy()`, return `null`; else `engine.service(DESIGN_PAGES).remove(pageId)`, `target.destroy()`, return `file`. Destroy `target` in a `finally` too.
- [ ] **Step 4: `usePageSplit()`** returns `(pageId: string) => void`: steps from `host.get(pageSplitSteps)`; `inProject = state.status === "ready"`; `folder = inProject && file.path ? parentFolder(file.path) : null`; on a `FileInfo` → `navigate(`/design/${file.id}`)` (react-router `useNavigate`, as `plugins-tab.tsx`); errors → `notifyError(t("errors.split"), error)`.
- [ ] **Step 5: Menu.** `PageMenu` gets `open`/`onOpenChange` (controlled `DropdownMenu`) and `splittable: boolean`; adds "Split into new file…" (`t("list.split")`) above the separator, shown only when `splittable`. `PageRow` holds `menuOpen` state and adds `onContextMenu={(e) => { e.preventDefault(); setMenuOpen(true); }}`; `splittable` = the list's page count > 1 (passed down like `deletable`). Types in `page-row.types.ts`.
- [ ] **Step 6: Text.** `list.split`: en "Split into new file…", es "Separar en un archivo nuevo…"; `errors.split`: en "Couldn't split the page", es "No se pudo separar la página".
- [ ] **Step 7: README.** In `modules/pages/README.md`: Contributes gains `designEditor.overlays`; Points it owns: `pageSplitSteps`; a "Split into new file" paragraph (the flow above, the step order rule, "a step that has nothing to add does nothing", that `before` may use `ctx.dialog`).
- [ ] **Step 8:** lint / typecheck / format:check pass (the `check-modules` and `check-locales` scripts are in `pnpm lint`).
- [ ] **Step 9:** Commit `feat(pages): right-click menu and Split into new file with the pageSplitSteps hook`.

### Task 4: Variables and design system steps

**Files:**

- Create: `src/products/design/modules/variables/split/copy-tokens-step.ts`, `src/products/design/modules/styleguide/system/copy-system-step.ts`
- Modify: `variables.module.ts`, `styleguide.module.ts` (or `styleguide.canvas.ts`, where its canvas wiring lives), both READMEs

**Interfaces:**

- Consumes: `pageSplitSteps`, `PageSplitStep` (Task 3, from `../pages/ui`), `copyPageInto` (Task 2, from `../pages`), `libraryIdOf` (`@canvas`), `systemPageOf` (styleguide `system/system-page.ts`).
- Produces: `COPY_TOKENS_STEP: PageSplitStep` (id `"variables"`, order 10), `COPY_SYSTEM_STEP: PageSplitStep` (id `"styleguide"`, order 20).

- [ ] **Step 1:** `COPY_TOKENS_STEP.copy`: `records = source.tokenRecords().filter((r) => !inProject || libraryIdOf(r) === undefined)`; if any, `target.setTokenRecordsUntracked(records)`.
- [ ] **Step 2:** `COPY_SYSTEM_STEP.copy`: return when `target.tokenRecords().length === 0` or `systemPageOf(source)` is undefined; else `copyPageInto(source, target, system.id)`.
- [ ] **Step 3:** Contribute each in its module file (`host.contribute(pageSplitSteps, …)`); add `pageSplitSteps` to each README's Contributes line plus one sentence on when it copies.
- [ ] **Step 4:** lint / typecheck / format:check pass.
- [ ] **Step 5:** Commit `feat(variables): a split page keeps its variables, styles and design system`.

### Task 5: Data step

**Files:**

- Create: `src/products/design/modules/data/source/copy-sources-step.ts`
- Modify: `data.module.ts`, `modules/data/README.md`

**Interfaces:**

- Consumes: `pageSplitSteps`, `PageSplitStep` (Task 3), `hasDataFields` (`bindings/binding-fields.ts`), `repeatOf` (`repeat/repeat-fields.ts`), `isDataSource` (`source/is-data-source.ts`).
- Produces: `COPY_SOURCES_STEP: PageSplitStep` (id `"data"`, order 30).

- [ ] **Step 1:** `copy`: return unless `nodes.some((n) => hasDataFields(n) || repeatOf(n) !== null)`; else `target.addAllUntracked(source.all().filter(isDataSource))`. Comment: `// shortcut: copies every source, not only the ones the page reads; narrow it when bindings name their sources structurally`.
- [ ] **Step 2:** Contribute in `data.module.ts`; README Contributes gains `pageSplitSteps` and one sentence.
- [ ] **Step 3:** lint / typecheck / format:check pass.
- [ ] **Step 4:** Commit `feat(data): a split page keeps the data sources it is bound to`.

### Task 6: Plugin docs and changelog

**Files:**

- Modify: `docs/plugins.md` (Design plugins section), `docs/modules.md` (pages row), `CHANGELOG.md`, `CHANGELOG.es.md`

- [ ] **Step 1:** `docs/plugins.md`: a "### Splitting a page" subsection under Design plugins: what `pageSplitSteps` is, `const { pageSplitSteps } = host.require("pages")`, the `PageSplitContext` fields, order values of the built-ins, "do nothing when you have nothing to add", and a short example step whose `before` uses `ctx.dialog` to ask for a value and whose `copy` writes it with `target.setMeta`/`addAllUntracked`.
- [ ] **Step 2:** `docs/modules.md`: the pages row's "Why" mentions it owns `pageSplitSteps`.
- [ ] **Step 3:** Changelog, unreleased `New`: en "Split into new file: right-click a page (or open its menu) to move it into its own design file. Its variables, styles, design system, pictures and data come with it, and in a project the new file is saved next to the current one." es "Separar en un archivo nuevo: haz clic derecho en una página (o abre su menú) para moverla a su propio archivo de diseño. Sus variables, estilos, sistema de diseño, imágenes y datos la acompañan, y en un proyecto el archivo nuevo se guarda junto al actual."
- [ ] **Step 4:** lint / typecheck / format:check pass (`check-changelog` keeps the two files in step).
- [ ] **Step 5:** Commit `docs: page split hook for plugins, changelog`.
