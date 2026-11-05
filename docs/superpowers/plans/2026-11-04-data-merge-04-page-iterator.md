# Data merge, phase 4: Repeating sections and pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In a brochure, a **section** (a group of pages) repeats for each row of a list, and a **page** repeats for each row or each N rows; repeats nest like loops in code and every layer reads the rows of the loops around it, in Design and Catalog mode alike. While designing, the template pages show a preview row, a few copies are made and the rest are counted as pending pages; the export makes everything on a forked document and asks whether to update the sources first.

**Architecture:** Repeats are stored on `BrochureSection.repeat` and `BrochureSlot.repeat` (`BrochureRepeat`). One pure function, `expandBrochure`, walks the brochure like an interpreter: for each repeat it reads rows in the scope of the loops around it and yields the full page sequence (template pages, made copies, pending copies) with each page's scope layers and the derived copy sections. `syncBrochureRepeats` (a catalog `afterEdit`) diffs the made pages against the document's generated frames and slots. Copy sections and pending pages are never stored: layout, numbering and the table of contents read the expansion. The data module gets a point so catalog can add scope layers around page frames; the same layers feed bindings and the **In scope** view.

**Tech Stack:** as phase 1; Yjs (`encodeStateAsUpdate`) for the fork.

**Spec:** [docs/superpowers/specs/2026-11-04-catalog-data-merge-design.md](../specs/2026-11-04-catalog-data-merge-design.md) ("Repeating sections and pages", revised 2026-11-05) · [00-overview](2026-11-04-data-merge-00-overview.md) · needs [phase 3](2026-11-04-data-merge-03-element-iterator.md)

## Global Constraints

The earlier phases' constraints, plus:

- The catalog reaches data only through the data module's `index.ts` (`uses: ["image", "text", "data"]` in `catalog.module.ts`); data never imports catalog.
- Generated pages are page frames of the brochure's design page, tagged and locked like data copies, listed as slots with `generated`; template pages stay where the user put them, copies follow their run.
- Copy sections and pending pages are derived from `expandBrochure` at read time, never written into `record.sections`/`record.slots`.
- One undo step per user action; the sync writes inside the edit's step, and writes nothing when nothing differs.
- The export never adds pages to the user's document.
- Data shown on brochure pages is formatted in the brochure's language (`brochureLanguage`).
- **Words in the UI:** "Repeat for each row" (section), "Repeat this page" (page), "Rows per page", "While designing, make", "In scope", "+N pages at export", "Copy of <section/page name>". No "iterator" in user text.
- **From the phase 1 review:** snapshot assets pile up; prune data-snapshot assets no source record references when the document is saved (Task 9).
- **From the phase 3 review:** (a) exports read every row (`repeatRows(…, "export")`), element iterators included: today PNG/PDF exports show only the 24 copies in the document (Task 9). (b) Wrapping or grouping a repeated card ends its repeat; point `repeat.template` at the wrapper when the card is wrapped in place (Task 7).

## Review Focus

1. **Nested pending counts:** a pending outer copy (category 5 of 12, not made) still counts its inner pages (its products, their gallery chunks) so later page numbers are right. → Task 1 (`expandBrochure` plans pending copies fully, only `made` differs).
2. **An empty list makes no page:** a gallery page over `product.photos` with no photos prints nothing for that product, including on the template when its preview row has none (the template frame stays on the canvas, marked "Not printed for this row"). → Task 1 and Task 4.
3. **Pages after a repeated run** (back cover, closing page) keep the right printed numbers and the table of contents lists every copy section, made or pending. → Task 3.
4. **Moving or deleting a generated page by hand:** moving is refused with a toast; deleting one detaches it (its key into `detached`, the frame becomes a normal page) instead of it coming back. → Task 5.
5. **Removing a repeat** removes its generated frames and slots in one undo step and leaves the template pages as normal pages; undo brings everything back. → Task 4 and Task 5.

---

### Task 1: Repeat fields and the expansion

**Files:**

- Create: `catalog/model/repeats/{brochure-repeat.types.ts,expand-brochure.ts,expand-brochure.types.ts,repeat-runs.ts,copy-name.ts,index.ts}`
- Modify: `catalog/brochure/brochure.types.ts` (`BrochureSection.repeat?`, `BrochureSlot.repeat?`, `BrochureSlot.generated?`; all optional, nothing to fill in `brochure.kind.ts`: note it), `catalog/catalog.module.ts` (`uses: ["image", "text", "data"]`), `catalog/model/index.ts`

**Interfaces:**

- Consumes from data's `index.ts`: `DataCondition`, `SortRule`, `repeatRows`, `rowScope`, `DataScope`, `resolveTemplate`-style token resolution for names (export what's missing).
- Produces:
  ```ts
  interface BrochureRepeat {
    source: string; // a list in scope: `products`, `category.products`
    as: string; // default "item"
    key?: string;
    filter: DataCondition[];
    sort: SortRule[];
    limit?: number;
    designLimit?: number; // copies made while designing, default 3
    previewRow?: number; // the row the template shows, default 0
    perPage?: number; // pages only, ≥ 1, default 1
    detached: string[]; // copy keys
  }
  interface GeneratedSlot {
    from: string /* template slot id */;
    path: string[]; /* copy keys, outermost first */
  }
  interface ScopeLayer {
    name: string;
    value: unknown;
    owner: string /* section or slot id */;
    label: string;
    index: number;
    count: number;
  }
  interface ExpandedPage {
    id: string; // `${from}` for a template page, `${from}@${path.join("/")}` for a copy
    from: string; // template slot id
    path: string[]; // [] for template pages
    layers: ScopeLayer[]; // outermost first
    made: boolean; // false: pending
    printed: boolean; // false when a page repeat's list is empty in this scope
  }
  interface ExpandedSection {
    id: string;
    from: string;
    path: string[];
    name: string;
    level: number;
    start: string; /* ExpandedPage id */
  }
  interface BrochureExpansion {
    pages: ExpandedPage[];
    sections: ExpandedSection[];
    pending: number;
  }
  ```
  `repeatRuns(record): Map<string, string[]>` — each repeating section's slot ids (from its start to the next section at its depth or less, `placeSections`/`sectionWithChildren`), nested subsections included; a page repeat's run is its one slot.
  `expandBrochure(record, root: DataScope, phase: "design" | "export"): BrochureExpansion` — walks the slots in order; at a repeating section's start, reads rows with `repeatRows` in the scope of the layers around it, then yields the run once per row: the first row on the template pages (`path` unchanged, row = `previewRow` clamped, made), the rest as copies with `path` + the row key, `made` when the copy index ≤ `designLimit ?? 3` and every outer copy is made (all made in `export`); inner repeats expand inside each copy with its layers. A page repeat chunks its rows by `perPage` (`as` = the row when 1, the chunk array when > 1) and an empty list yields the template page with `printed: false` and no copies. Layers carry `$index`, `$number`, `$count` in `value`'s scope via `rowScope`. Section names resolve tokens in the copy's scope (`copyName`). Detached keys yield no copy (the detached frame stays a plain page). Plans pending copies fully: only `made` differs.
- [ ] **Step 1:** The types and the pure functions.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(catalog): expand a brochure's repeating sections and pages`.

### Task 2: Scope around pages (data side)

**Files:**

- Modify: `data/data.points.ts` (`dataScopeProviders`: `(doc, node: DesignNode) => ScopeLayer[] | null` for a top-level frame; `dataLocaleProviders`: `(doc, node) => string | null`), `data/repeat/data-scopes.ts` and `scope-at.ts` (at a top-level frame, layer the providers' rows over the root; never in `bindings/`, which would bring back the import cycle), `data/sync/sync-data.ts` (locale per node from `dataLocaleProviders`), `data/index.ts` (export `ScopeLayer`, `scopeLayersAt(doc, nodeId): ScopeLayer[]` — every layer around a node, card repeaters included, outermost first — and `syncDataFor(doc, nodeIds)` for the catalog sync), `data/README.md`
- Add to data: a document data phase (`DesignDataSources.phase(): "design" | "export"`, `setPhase`), read by `repeatRows` callers in the sync.

**Interfaces:** `ScopeLayer` as in Task 1 lives in data (`data/repeat/scope-layer.types.ts`); catalog imports it. A card repeater's layer has `owner` = the frame id.

- [ ] **Step 1:** The points, the layered scopes, `scopeLayersAt`, the phase, the locale.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): scopes from around a layer, for brochures`.

### Task 3: Making the copies and counting the rest

**Files:**

- Create: `catalog/model/repeats/sync-brochure-repeats.ts`, `catalog/model/repeats/page-scope-provider.ts`
- Modify: `catalog/catalog.module.ts` (register `syncBrochureRepeats` as an `afterEdit` before page items, the scope and locale providers), `catalog/model/brochure-pages.ts` + `.types.ts` (`BrochurePage` gains `pending?: ExpandedPage`, `notPrinted?: true`; `pages()` follows the expansion), `catalog/model/book-layout.ts`, numbering, `catalog/model/sections/` and the table of contents (`placeSections` callers read `record.sections` plus the expansion's copy sections), `catalog/model/design-brochure.ts` + `.types.ts` (`expansion()`, `pendingPages(): number`, `setRepeat(target: { section } | { slot }, repeat: Partial<BrochureRepeat> | null)` as one undo step; removing deletes generated frames and slots), `catalog/export/printed-pages.ts` (a pending page there throws `Error("Pending pages must be made before printing.")`; `notPrinted` pages are skipped)

**Interfaces / behavior:**

- `syncBrochureRepeats(doc, change)`: for each brochure with repeats whose record, template frames' subtrees or sources changed: `expandBrochure`; make, patch or remove generated frames (data's `copyNode` of the template slot's chosen frame, tagged `dataCopy { iterator: owner id, key: path.join("/"), source: template frame id }`, locked, placed after the previous page as the brochure's arrange does) and their slots (`generated: { from, path }`), ordered as the expansion; then `syncDataFor` the frames it made or changed. Writes nothing when nothing differs.
- The scope provider answers a template or generated page frame with its `ExpandedPage.layers`.
- [ ] **Step 1:** The sync and providers.
- [ ] **Step 2:** Pending and not-printed pages through `pages()`, layout, numbering, sections and the TOC (grep `placeSections(` and `.sections` in catalog).
- [ ] **Step 3:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(catalog): brochure sections and pages repeat for each row`.

### Task 4: Setting a repeat from the page list

**Files:**

- Create: `catalog/ui/sidebar/brochure-repeat-section.tsx` + `.types.ts`, `catalog/ui/brochure-tab/pending-pages-row.tsx` + `.types.ts`
- Modify: `catalog/ui/brochure-tab/section-folder-menu.tsx` ("Repeat for each row…"), `page-row-menu.tsx` ("Repeat this page…"), `page-tree.ts` (copy sections as folders, not renameable, section actions off; generated rows with a data mark and "Copy of …"; one `PendingPagesRow` per run: "+36 pages at export"; a repeat badge and bracket on template sections/pages; not-printed template pages dimmed with "Not printed for this row"), `catalog/ui/sidebar/` (the panel shows `BrochureRepeatSection` for the selected section or page), locales
- Export from `data/ui/index.ts` if missing: `FilterRows`, `SortRows`, `FieldPicker`, the list picker and `PreviewRowField`.

**Behavior:** `BrochureRepeatSection`: list (lists in scope), row name, key, rows per page (pages only, `NumberInput` ≥ 1), filter, sort, limit, "While designing, make" (default 3), preview row ◀ n of N ▶, "N copies from M rows", Remove repeat. Reuse the card repeat panel's pieces; no copies of them.

- [ ] **Step 1:** The menus, the panel, the rows.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(catalog): repeat a section or a page from the page list`.

### Task 5: Generated pages by hand

**Files:** `catalog/ui/brochure-tab/use-page-list-drag.ts` (moving a generated row is refused: `toast(t("repeat.generatedMove"))`), `catalog/mode/delete-selected-pages.ts` and the take-out path (a generated page deleted or taken out → its copy key into the owner's `detached`, the frame unlocked and untagged and kept as a normal page when taking out), `catalog/mcp` paths that remove slots (same rule), locales.

- [ ] **Step 1:** Drag, take-out and delete.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(catalog): generated pages detach when taken out`.

### Task 6: In scope, and template tags on the canvas

**Files:**

- Create: `data/ui/data-section/in-scope.tsx` + `.types.ts` (rows from `scopeLayersAt`: name, where it comes from — "Section Product", "Card repeater in Grid", "source" —, ◀ n of N ▶ stepping that owner's preview row through a `dataPreviewSetters` point catalog answers for section/page owners, the card repeater's own setter for frames)
- Modify: `data/ui/data-section/` (show In scope above the bindings), `data/data.points.ts`, the canvas label of template page frames: find where frame names are drawn on the canvas (frame module); if there's no hook for extra text, add a `frameLabelSuffix` point there and answer it from catalog with "Product · row 1 of 40"; locales, `data/README.md`

- [ ] **Step 1:** In scope and the preview setters.
- [ ] **Step 2:** The frame label tag.
- [ ] **Step 3:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): see what a layer has in scope`.

### Task 7: Wrapping a repeated card keeps its repeat

**Files:** `data/repeat/template-of.ts`, `data/sync/sync-iterators.ts` (or where the template leaving the frame ends the repeat): when the template is now inside a new direct child of the frame (wrapped in place by group, frame selection or auto layout), point `repeat.template` at the wrapper in the same step instead of ending the repeat. `data/README.md`; changelog `Fixed` entry (en + es).

- [ ] **Step 1:** The fix.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `fix(data): wrapping a repeated card keeps its repeat`.

### Task 8: Forking the document for the export

**Files:**

- Modify: `src/canvas/document/canvas-document.ts` (`fork(): CanvasDocument`), `src/canvas/document/README.md`
- Create: `catalog/export/{scratch-document.ts,scratch-document.types.ts}`

**Interfaces:** `CanvasDocument.fork()` — a new document over a new `Y.Doc` applied with `Y.encodeStateAsUpdate(this.ydoc)`, same assets, no history, never saved. `scratchWorkspace(engine): { workspace; doc; dispose(): void }` — the fork with the product's `afterEdit` (as `canvas-engine.ts` sets it) and an `ActorWorkspace` over it built as agents' are (if the host type needs the engine, add a small `engine.scratchWorkspace(doc)` beside that code).

- [ ] **Step 1:** `fork()`, `scratchWorkspace`, README line.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(canvas): fork a document for throwaway work`.

### Task 9: Export makes everything, and asks about the data

**Files:**

- Modify: `catalog/export/export-brochure.ts` + `.types.ts` (`BrochureExportOptions.data?: "update" | "saved"`), `catalog/export/index.ts`, `catalog/ui/hooks/use-export-brochure.ts`, `catalog/mcp/brochure-settings.mcp.ts` (`export_brochure_pdf` gains `updateSources?: boolean`, default false), the design PNG/PDF export path (element iterators at every row: fork when any repeat has rows past its design limit), data's snapshot asset pruning on save, locales
- Create: `catalog/ui/export-data-dialog.tsx` + `.types.ts`

**Behavior:** `brochureSources(doc, brochure)` — the sources its repeats and bound layers read. With `data: "update"`, update each on the **live** document first (one undo step each); any failure throws `Error("<name> couldn't be updated: <message>")` and nothing is exported. Then, if anything is pending or capped, fork with `scratchWorkspace`, `setPhase("export")`, run the syncs for everything and export from the fork; `dispose()` in `finally`. The dialog opens when the brochure uses sources: "Update the data first" (primary) or "Use the saved data" with each source's "updated 3 days ago"; Esc cancels.

- [ ] **Step 1:** The export path and pruning.
- [ ] **Step 2:** The dialog, the hook, the agent tool argument.
- [ ] **Step 3:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(catalog): export makes every page from data`.

### Task 10: Checks, agent tools, docs, changelog

**Files:**

- Modify: `catalog/checks/check-brochure.ts` (data issues of its pages; `empty-source`, "more than 1,000 pages" warning), `catalog/mcp/brochure-read.mcp.ts` (`get_brochure`: each page's `generated`, each repeat and its pending count)
- Create: `catalog/mcp/brochure-repeat.mcp.ts`: `set_brochure_repeat { brochure, section? | position?, source, as?, key?, perPage?, filter?, sort?, limit?, designLimit?, previewRow? }` and `remove_brochure_repeat { brochure, section? | position? }`, one `asUndoStep` each, validated before writing
- Modify: `catalog/mcp/index.ts`, `catalog/README.md` (a **Repeating sections and pages** paragraph), `data/README.md`, changelogs, `docs/catalog-roadmap.md` (C2: phase 4 shipped)
- Changelog `New`: "Brochure sections can now repeat for each row of your data: design a product's pages once (a cover, a description, a gallery that grows with its photos) and the brochure makes them for every product. Repeats nest, so categories can hold their products. While you design only the first few copies are made, but page numbers and the table of contents already count them all, and the export makes every page; it asks whether to update the data first." (+ Spanish).
- [ ] **Step 1:** Checks and agent tools.
- [ ] **Step 2:** Docs and changelog.
- [ ] **Step 3:** `pnpm lint && pnpm typecheck && pnpm format:check` → pass. Commit: `feat(catalog): brochure repeat checks and agent tools`.
