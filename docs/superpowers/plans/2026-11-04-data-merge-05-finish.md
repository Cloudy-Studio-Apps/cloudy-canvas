# Data merge, phase 5: Finish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Excel files, the optional Shape step, paginated APIs, an example plugin that registers its own source type (proving the plugin API), and the plugin docs; then the roadmap item closes.

**Architecture:** Each piece slots into phase 1's pipeline: Excel is a `dataFormats` entry; Shape is a record field applied between `normalizeRows` and `guessFields`; pagination is an option of the HTTP source's `update`; the example plugin uses only `host.require("data")`.

**Tech Stack:** as phase 1; `read-excel-file` (MIT) loaded with `import()`.

**Spec:** [docs/superpowers/specs/2026-11-04-catalog-data-merge-design.md](../specs/2026-11-04-catalog-data-merge-design.md) · [00-overview](2026-11-04-data-merge-00-overview.md) · needs [phase 4](2026-11-04-data-merge-04-page-iterator.md)

## Global Constraints

The earlier phases' constraints, plus:

- Shape is optional: a source without one behaves exactly as before.
- The example plugin uses only what `host.require("data")` gives and the plugin API (`docs/plugins.md`); no deep imports (`scripts/check-public-api.mjs`).
- API pagination stops at a page cap (default 50) and never loops on a repeated "next" URL.

## Review Focus

1. **Shape renames a field that bindings use** (`attributes.title` → `name`): the rename must rewrite references, as source renames do. → Task 2 (`renameFieldReferences`).
2. **An Excel file with merged header cells, empty rows on top or several sheets**: the sheet option lists sheets by name; the first non-empty row is the header. → Task 1.
3. **A "next" URL pointing back to page 1** or an API that ignores the page parameter (same rows again) must stop, keeping what it got, with a warning. → Task 3 (hash of each page's rows).
4. **A plugin's source type removed** (plugin uninstalled) leaves its sources with their saved data, an "Its plugin isn't installed" state, and Update disabled. → Task 4.
5. **A large Excel file (50k rows)** must parse without freezing the UI for long: show the "parsing" stage; the 200-row table keeps the tab fast. → Task 1 (note in README; no worker unless it proves slow).

---

### Task 1: Excel

**Files:**

- Modify: `package.json`/lockfile (`pnpm add read-excel-file`)
- Create: `data/formats/xlsx.format.ts`; Modify: `data/formats/index.ts`, `data/data.module.ts`, locales, README

**Interfaces:**

- Produces: `XLSX_FORMAT` (id `xlsx`, extensions `xlsx`, mime `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, sniff: bytes start with `PK\x03\x04` and the file name ends in `.xlsx`; options: `sheet` (text, empty = first), `headerRow` (number, empty = first non-empty row)). `parse` does `const { default: readXlsxFile, readSheetNames } = await import("read-excel-file")` (check the package's browser entry and exports before use), reads the sheet as rows of cells, turns the header row into keys (duplicates `_2`, empties `column_N`), cells after it into row objects; dates stay `Date` → ISO strings.
- [ ] **Step 1:** Install, write, register.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): Excel files as data`.

### Task 2: The Shape step

**Files:**

- Create: `data/table/{shape.types.ts,shape-rows.ts}`; `data/ui/data-tab/{shape-step.tsx,shape-step.types.ts}`
- Modify: `data/source/data-source.types.ts` (`shape?: DataShape | null`), `data-source.kind.ts` (`fillDefaults`), `data/update/update-source.ts` (apply it), `data/model/design-data-sources.ts` (`setShape`), `data/bindings/rename-references.ts` (`renameFieldReferences`), `data/mcp/data-sources.mcp.ts` (`set_data_source.shape`), locales, README

**Interfaces:**

- Produces:
  ```ts
  interface DataShape { list?: string;                        // path to the rows inside the parsed data
    rename: Record<string, string>;                           // path → new name
    include?: string[] }                                       // only these paths (after rename); unset = all
  shapeRows(parsed: unknown, shape: DataShape | null): DataRow[]   // list → rows (normalizeRows when unset),
                                                                    // each row rebuilt with renamed/flattened keys
  ```
  `setShape(id, shape | null)`: writes the shape, re-shapes the saved snapshot's source rows **without fetching** (the snapshot keeps the unshaped rows as `raw` in its asset from this task on: `{ version: 2, raw, rows }`; `readSnapshot` reads v1 too), rewrites references of renamed fields (`renameFieldReferences(doc, source, renames)`), one undo step.
- `ShapeStep` in the source detail, an "Add a step to shape the data" button when unset (the n8n-style node): "Rows are at" path picker over the raw data's lists, a rename table (path → name, `useCommitField`), include checkboxes, Remove step.
- [ ] **Step 1:** Types, `shapeRows`, snapshot v2, `setShape`, `renameFieldReferences`.
- [ ] **Step 2:** The UI step and the agent argument.
- [ ] **Step 3:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): an optional step to shape a source's data`.

### Task 3: Paginated APIs

**Files:**

- Create: `data/sources/{http-pagination.ts,http-pagination.types.ts}`; Modify: `data/sources/http.source.ts`, locales

**Interfaces:**

- Produces: settings on the HTTP source: `pagination` select `none`/`page`/`offset`/`next`, `pageParam` (default `page`), `sizeParam` + `pageSize` (offset), `nextPath` (a path to the next URL in the response), `listPath` (where each page's rows are), `maxPages` (default 50). `fetchPages(settings, ctx, fetchOne: (url) => Promise<unknown>): Promise<unknown[]>` — concatenates each page's rows (`readPath(page, listPath)` or `normalizeRows`), stops on an empty page, a repeated URL, a page whose rows hash like the previous one, or `maxPages`; returns the rows, and the source's `update` returns them as JSON `RawData` (`mime: "application/json"`).
- [ ] **Step 1:** Write and wire it.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): APIs that return their rows in pages`.

### Task 4: A plugin's sources, and the example plugin

**Files:**

- Modify: `data/ui/data-tab/source-row.tsx`, `source-detail.tsx` (unknown `sourceType` → "Its plugin isn't installed", Update disabled, data still usable), `data/model/design-data-sources.ts` (`update` returns `{ ok: false, error: "No source type <id>." }`)
- Create: `examples/plugins/sample-products-source/{manifest.json,main.js,README.md}` (match the `callout` example's manifest shape and the plugin-kit conventions; JavaScript, no build step), registering a `DataSourceType` `sample-products` with settings `count` (number, default 24) whose `update` returns generated JSON products (`id`, `name`, `price`, `category`, `image` from a placeholder service URL is **not** used: images as small inline SVG `data:` URLs so it works offline)
- Modify: `docs/plugins.md` (a "Data sources and formats" section: `host.require("data")` gives `dataSourceTypes`, `dataFormats`, `SettingSpec` kinds, `SourceContext`; `dataSourceForms` from its UI; the example), `src/app/plugins/README.md` if it lists what modules plugins can require
- [ ] **Step 1:** Unknown-type state.
- [ ] **Step 2:** The example plugin and the docs.
- [ ] **Step 3:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass (`check-public-api.mjs` clean). Commit: `feat(data): plugins can add data sources`.

### Task 5: Close the roadmap item

**Files:**

- Modify: `CHANGELOG.md`, `CHANGELOG.es.md` (`New`: "Data sources can now read Excel files and APIs that return their rows in pages, and an optional step can pick and rename fields before they're used. Plugins can add their own kinds of source." + Spanish), `docs/catalog-roadmap.md` (C2 ticked `[x]`, priority filled, Notes: "Done: sources, bindings, repeat on frames and pages, export"), `data/README.md` (final read-through against the code)
- Delete: `docs/superpowers/plans/2026-11-04-data-merge-0*.md` (memory: delete finished plans); keep the spec
- [ ] **Step 1:** Changelog, roadmap, README.
- [ ] **Step 2:** `git rm docs/superpowers/plans/2026-11-04-data-merge-0*.md`.
- [ ] **Step 3:** `pnpm lint && pnpm typecheck && pnpm format:check` → pass. Commit: `docs: data merge done`.
