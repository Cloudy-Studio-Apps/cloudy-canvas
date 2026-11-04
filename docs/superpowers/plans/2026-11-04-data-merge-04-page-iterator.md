# Data merge, phase 4: Page iterator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In the Catalog mode a brochure page can repeat for each row (or each N rows) of a source, grouped by a field into sections with an optional opener page; while designing only a few pages are made but numbering and the table of contents count them all; the export makes every page on a forked document and asks whether to update the sources first.

**Architecture:** A brochure slot's `repeat` (`PageRepeat`). The pure `planDataPages` turns rows into pages (chunks, groups, openers); `syncDataPages` (a catalog `afterEdit` hook) makes generated frames and slots up to `designLimit` and the brochure layout counts the rest as **pending** sides. Group sections are computed, never stored. The export forks the document (`CanvasDocument.fork()`), generates everything there in `export` phase and prints from an `ActorWorkspace` on the fork.

**Tech Stack:** as phase 1; Yjs (`encodeStateAsUpdate`) for the fork.

**Spec:** [docs/superpowers/specs/2026-11-04-catalog-data-merge-design.md](../specs/2026-11-04-catalog-data-merge-design.md) · [00-overview](2026-11-04-data-merge-00-overview.md) · needs [phase 3](2026-11-04-data-merge-03-element-iterator.md)

## Global Constraints

The earlier phases' constraints, plus:

- The catalog reaches data only through the data module's `index.ts` (`uses: ["data"]` in `catalog.module.ts`); data never imports catalog.
- Generated pages are page frames of the brochure's design page, tagged and locked like data copies, listed as slots with `generated`; the template slot stays the first page of its run.
- Group sections are derived from the data at read time (`sectionsWithData`), not written into `record.sections`.
- The export never adds pages to the user's document.
- Data shown on brochure pages is formatted in the brochure's language (`brochureLanguage`).

## Review Focus

1. **Pages after a repeated run** (the back cover, a closing page) must keep the right printed numbers while pending pages aren't made. → Task 3 (pending sides in `bookLayout`).
2. **Moving or deleting a generated page by hand** in the page list: moving is refused with a toast ("Generated pages follow their template"); deleting one detaches it (like Detach) instead of letting it come back. → Task 4.
3. **Changing the brochure's language** must re-format data on its pages (dates, prices) in the same undo step. → Task 2 (`syncDataPages` runs on brochure settings changes and passes the locale).
4. **Export with "Update the data first" when the update fails** must stop and say so, not export stale data silently; "Use the saved data" never fetches. → Task 6.
5. **An empty source** (0 rows) leaves the template page showing its first-row placeholders empty and generates nothing, with a check "products has no rows". → Task 2 and Task 7.

---

### Task 1: Slot fields and the page plan

**Files:**

- Create: `catalog/model/data-pages/{page-repeat.types.ts,plan-data-pages.ts,plan-data-pages.types.ts,count-data-pages.ts,data-page-scope.ts,index.ts}`
- Modify: `catalog/brochure/brochure.types.ts` (`BrochureSlot.repeat?: PageRepeat`, `BrochureSlot.generated?: GeneratedSlot`), `catalog/brochure/brochure.kind.ts` (nothing to fill: both optional; note it), `catalog/catalog.module.ts` (`uses: ["image", "text", "data"]`), `catalog/model/index.ts`

**Interfaces:**

- Consumes: `RepeatSettings`-style pieces from data (`DataCondition`, `SortRule`, `repeatRows`, `rowScope`, `rootScope`, `DESIGN_DATA_SOURCES`).
- Produces:
  ```ts
  interface PageRepeat {
    source: string;
    as: string;
    key?: string;
    filter: DataCondition[];
    sort: SortRule[];
    perPage: number; // ≥ 1, default 1
    groupBy?: string; // a field path
    opener?: string; // a top-level frame id: the group's opening page
    limit?: number;
    designLimit?: number; // designLimit counts pages, default 3
    detached: string[];
  } // page keys
  interface GeneratedSlot {
    from: string /* template slot id */;
    key: string;
  }
  interface PlannedPage {
    key: string;
    rows: { key: string; row: unknown; index: number }[];
    group: string | null;
    opener: boolean;
  }
  interface PagePlan {
    slot: string;
    pages: PlannedPage[];
    groups: { name: string; firstKey: string }[];
    made: number;
  }
  ```
  `planDataPages(slot: BrochureSlot & { repeat: PageRepeat }, scope: DataScope, phase: "design" | "export"): PagePlan` — rows via `repeatRows` (no designLimit there), grouped in first-appearance order by `groupBy`, each group optionally starting with an opener page (`opener: true`, its `rows` the group's), then chunks of `perPage`; page keys `g:<group>/p:<n>` or `p:<n>`, openers `g:<group>/open`; `made` = all pages in `export`, else `min(pages, designLimit ?? 3)`. The template slot is page 0.
  `countDataPages(plan): { made: number; pending: number }`.
  `dataPageScope(root: DataScope, repeat: PageRepeat, page: PlannedPage): DataScope` — `perPage === 1`: `{ [as]: row, $index, $number, $count }`; otherwise `{ page: { rows }, $group, $page: n }` with each row under `as` for an inner element iterator whose `source` is `page.rows`. (`page` stays a catalog word in text tokens; `page.rows` is only valid as a repeat's `source`, so `parseTokens` keeps refusing it in text.)
- [ ] **Step 1:** Write the types and the pure functions.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(catalog): plan a brochure's pages from data`.

### Task 2: Making the pages

**Files:**

- Create: `catalog/model/data-pages/sync-data-pages.ts`
- Modify: `catalog/catalog.module.ts` (a second `afterEdit`: `syncDataPages`), `data/bindings/scope.ts` (an extension so `scopeAt` asks registered scope providers: add `dataScopeProviders` point in data, `(doc, nodeId, parent) => DataScope | null`, which catalog contributes for nodes inside generated or template page frames), `data/data.points.ts`, `data/sync/sync-data.ts` (locale per node via a provider too: `dataLocaleProviders`, catalog answers `brochureLanguage`)

**Interfaces:**

- Produces: `syncDataPages(doc: CanvasDocument, change: EditedChange, phase?: "design" | "export"): void` — for each brochure slot with `repeat` whose record, template frame subtree, opener subtree or source changed: `planDataPages`; then make/patch/remove generated frames (copies of the template frame or the opener: data's `copyNode`, tagged `dataCopy { iterator: slot.id, key, source }`, locked, placed to the right of the previous page with the gap `ARRANGE_GAPS` uses, then the brochure's arrange runs if on) and their slots (`generated: { from, key }`, right after the template slot / previous generated slot, keeping their order by key); detached keys skipped; nothing written when nothing differs. `phase` defaults to the doc's data phase (`DesignDataSources.phase()`, added in this task: `"design"` unless set by the export).
- `scopeAt` for a node inside a generated page frame returns `dataPageScope` for its page; inside the template frame, page 0.
- [ ] **Step 1:** Add `dataScopeProviders`/`dataLocaleProviders` and the `phase` to data; use them in `scopeAt` and `syncData`.
- [ ] **Step 2:** Write `syncDataPages` and register it, plus the providers, in `catalog.module.ts`.
- [ ] **Step 3:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(catalog): brochure pages repeat for each row`.

### Task 3: Counting pending pages and group sections

**Files:**

- Modify: `catalog/model/book-layout.ts`, `book-layout.types.ts` (`BookSide` gains `part: "pending"` with `pending: { slot: string; key: string }`), `catalog/model/brochure-pages.ts` (pending pages after a run's last made page), `catalog/model/numbering/page-numbers.ts`, `catalog/model/sections/` (`sectionsWithData(record, plans): BrochureSection[]`, group sections with ids `data:<slot>:<group>` starting at the group's first page, made or pending; level: one under the section the template is in, 0 when none), `catalog/model/design-brochure.ts` + `.types.ts` (`pendingPages(): number`, `setRepeat(slotId, repeat: Partial<PageRepeat> | null)` one undo step), the TOC (`tableOfContents`) reading `sectionsWithData`.
- Modify: `catalog/export/printed-pages.ts` (pending sides are an error in export: `throw new Error("Pending pages must be made before printing.")`, as the export always makes them), `catalog/ui/preview/…` (pending sides drawn as blank paper with "Made at export" in `text-muted-foreground`)

**Interfaces:**

- `bookLayout(pages, settings)` keeps its signature; `pages()` now yields pending `BrochurePage`s (`{ pending: { slot, key } }`) so every reader (numbering, spreads, labels, TOC) counts them without a second path.
- [ ] **Step 1:** Pending pages in `pages()` and `bookLayout`; numbering and TOC follow.
- [ ] **Step 2:** `sectionsWithData` wherever `placeSections` reads `record.sections` (grep `placeSections(` and `.sections` in catalog).
- [ ] **Step 3:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(catalog): pages from data are counted before they're made`.

### Task 4: Page list and sidebar

**Files:**

- Create: `catalog/ui/sidebar/page-repeat-section.tsx` + `.types.ts`; `catalog/ui/brochure-tab/pending-pages-row.tsx` + `.types.ts`
- Modify: `catalog/ui/brochure-tab/` (the `pageTree` rows: one `PendingPagesRow` per run's pending pages, "+237 pages from products, made at export"; generated rows show a data mark and their row key; group sections show as folders, not renameable, with the menu's section actions disabled), `catalog/ui/brochure-tab/use-page-list-drag.ts` (refuse moving generated rows: `toast(t("data.generatedMove"))`), `catalog/mode/delete-selected-pages.ts` + the take-out path (a generated page taken out or deleted → its key into `repeat.detached`, frame kept as a normal page when deleting is "take out"), `catalog/ui/sidebar/` (the page panel shows `PageRepeatSection` for a slot), locales

**Behavior:**

- `PageRepeatSection`: off → "Repeat for each row" (pick a list from the Data tab's sources). On: list, row name, key, rows per page (`NumberInput` ≥ 1), group by (`FieldPicker`, optional), opener page (a frame of the page, `SelectField` of top-level frames not in the brochure, optional; "Make one" duplicates the template frame as a start), filter, sort (reuse data's `FilterRows`/`SortRows` from `data/ui/index.ts`), limit, "While designing, make" pages (default 3), "N pages from M rows", Remove repeat.
- [ ] **Step 1:** The section and the row; export `FilterRows`, `SortRows`, `FieldPicker` from `data/ui/index.ts` if they aren't yet.
- [ ] **Step 2:** Generated rows' drag, take-out and delete behavior.
- [ ] **Step 3:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(catalog): set a page to repeat from the page panel`.

### Task 5: Forking the document for the export

**Files:**

- Modify: `src/canvas/document/canvas-document.ts` (`fork(): CanvasDocument`), `src/canvas/document/README.md`
- Create: `catalog/export/{scratch-document.ts,scratch-document.types.ts}`

**Interfaces:**

- Produces: `CanvasDocument.fork(): CanvasDocument` — a new document over a new `Y.Doc` applied with `Y.encodeStateAsUpdate(this.ydoc)`, same assets, no history, not read-only, never saved. `scratchWorkspace(engine: DesignEngine): { workspace: DesignWorkspace; doc: CanvasDocument; dispose(): void }` — the fork with the product's `afterEdit` set (`doc.setAfterEdit(product.afterEdit)` as `canvas-engine.ts` does) and an `ActorWorkspace` over it built like `canvas-engine.ts:598` builds agents' (if its host type needs the engine, add a small `engine.scratchWorkspace(doc)` method beside that code instead).
- [ ] **Step 1:** `fork()` and its README line.
- [ ] **Step 2:** `scratchWorkspace`.
- [ ] **Step 3:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(canvas): fork a document for throwaway work`.

### Task 6: Export makes every page, and asks about the data

**Files:**

- Modify: `catalog/export/export-brochure.ts`, `export-brochure.types.ts` (`BrochureExportOptions.data?: "update" | "saved"`), `catalog/export/index.ts`
- Create: `catalog/ui/export-data-dialog.tsx` + `.types.ts`
- Modify: `catalog/ui/hooks/use-export-brochure.ts`, `catalog/mcp/brochure-settings.mcp.ts` (`export_brochure_pdf` gains `updateSources?: boolean`, default false), locales

**Interfaces / behavior:**

- `brochureSources(doc, brochure): DataSourceElement[]` — the sources its repeats and the bound layers on its pages name.
- `exportBrochure(workspace, brochure, options)`: when `options.data === "update"`, `DESIGN_DATA_SOURCES.update` each used source on the **live** document first (one undo step each, as the button); any failure throws `Error("<name> couldn't be updated: <message>")` and nothing is exported. Then, when the brochure has repeats with pending pages, fork with `scratchWorkspace`, `DesignDataSources.setPhase("export")` on the fork's service, run `syncDataPages` and `syncData` for everything (`all: true`), and export from the fork's brochure; `dispose()` in `finally`.
- `ExportDataDialog`: when the brochure uses sources, Export opens it: "Update the data first" (primary) and "Use the saved data" with each source's "updated 3 days ago"; plus "Don't ask again for this file" is **not** offered (YAGNI). Esc cancels the export.
- [ ] **Step 1:** `brochureSources`, the export path.
- [ ] **Step 2:** The dialog and the hook; the agent tool argument.
- [ ] **Step 3:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(catalog): export makes every page from data`.

### Task 7: Checks, agent tool, docs, changelog

**Files:**

- Modify: `catalog/checks/check-brochure.ts` (adds `dataIssues(doc, nodesOfThePages)` and `empty-source`, `group-without-rows`; shown with the other checks), `catalog/mcp/brochure-read.mcp.ts` (`get_brochure` lists each page's `generated` and each run's `pending`)
- Create: `catalog/mcp/brochure-data.mcp.ts`: `set_brochure_page_repeat { brochure, position, source, as?, key?, perPage?, groupBy?, opener?, filter?, sort?, limit?, designLimit? }` and `remove_brochure_page_repeat { brochure, position }`, one `asUndoStep` each
- Modify: `catalog/mcp/index.ts`, `catalog/README.md` (a **Data pages** paragraph), `data/README.md` (providers), changelogs, `docs/catalog-roadmap.md` (C2 notes: phase 4 shipped)
- Changelog `New`: "Brochure pages can now repeat for each product of a source, one or several per page, grouped into sections by any field. While you design only the first few pages are made, but page numbers and the table of contents already count them all, and the export makes every page; it asks whether to update the data first." (+ Spanish).
- [ ] **Step 1:** Checks and agent tools.
- [ ] **Step 2:** Docs and changelog.
- [ ] **Step 3:** `pnpm lint && pnpm typecheck && pnpm format:check` → pass. Commit: `feat(catalog): data page checks and agent tools`.
