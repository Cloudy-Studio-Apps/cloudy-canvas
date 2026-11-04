# Data merge, phase 2: Bindings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Layers show data: text templates with `{tokens}` that keep their styling, layer fields (image fill, colors, numbers) bound to data fields, show/hide conditions, field formats, and images from URLs, base64 or file names saved into the file.

**Architecture:** Data fields on any design node (`dataText`, `dataBindings`, `dataVisible`, `dataHideEmpty`). A pure planner turns a node plus a **scope** (the names in reach: sources now, iterator rows in phase 3) into a patch; one `afterEdit` hook, `syncData`, runs it for the nodes an edit affected. The text editor edits a bound text's template through a new `textTemplates` point owned by the text module.

**Tech Stack:** as phase 1; `Intl.NumberFormat` / `Intl.DateTimeFormat`.

**Spec:** [docs/superpowers/specs/2026-11-04-catalog-data-merge-design.md](../specs/2026-11-04-catalog-data-merge-design.md) · [00-overview](2026-11-04-data-merge-00-overview.md) · needs [phase 1](2026-11-04-data-merge-01-sources.md)

## Global Constraints

The [phase 1 constraints](2026-11-04-data-merge-01-sources.md#global-constraints), plus:

- Source and row names can't be `page`, `pages`, `title`, `section`, `date`, `toc` or start with `$`; tokens whose first name is one of those are left to the catalog.
- A token takes the style of the run it sits in.
- Binding a field to data removes that field's variable binding (`el.bindings[path]`) in the same undo step, so the two syncs never fight. (Planning decision; the spec said data "overrides" the variable.)
- `syncData` writes only differences, inside the edit's undo step, never a checkpoint of its own.
- Texts with a catalog template (`catalogText`) are the catalog's: `syncData` never touches them.
- **From the phase 1 review:** field paths can hold any key (`Product Name`, `unit-price`, accents). Pickers and `namesInScope` build expressions from `PathStep[]` with `["…"]` quoting (as `guessFields` writes them), never by joining strings; the token regex accepts `["…"]` steps. Aliases are display-only labels, never names in tokens.
- **From the phase 1 review:** snapshot rows are frozen and shared: copy before sorting or filtering. `affectedData` ignores a data-source change that only touched `snapshot.updatedAt` (a no-op Update). `formatValue` never throws: bad formats fall back to the plain value.

## Review Focus

1. **Renaming a source** must rewrite every token and binding that names it, in the same undo step, or every bound layer breaks. → Task 6 (`renameReferences`).
2. **A token naming a field that isn't there** (typo, field gone after Update) shows nothing in the layer, not `{prodcut.name}` text and not "undefined", and is reported by phase 3's checks (`unresolvedTokens`). → Task 2 (`resolveRichTemplate` returns `missing`).
3. **Editing a bound text on the canvas** must show and edit the template (`{product.name}`), not the resolved text, and committing must not freeze the resolved value. → Task 4.
4. **Numbers and dates as strings** (`"1299.5"`, `"2026-03-01"` from CSV) must format by the field's type, not print raw. → Task 2 (`formatValue` coerces).
5. **An image URL that fails or isn't an image** must leave the layer's current picture and count as a failure, never paint an empty fill. → Task 5.

---

### Task 1: Node fields, scopes and paths in scope

**Files:**

- Create: `data/bindings/{binding.types.ts,binding-fields.ts,scope.ts,scope.types.ts,index.ts}`
- Modify: `data/index.ts`

**Interfaces:**

- Produces (`binding.types.ts`):
  ```ts
  interface DataTemplate {
    text: string;
    runs: TextNodeRun[];
  } // runs over the template text
  interface DataBinding {
    path: string;
    format?: FieldFormat;
  } // path: an expression in scope
  type ConditionOp = "exists" | "empty" | "eq" | "neq" | "gt" | "lt" | "contains";
  interface DataCondition {
    path: string;
    op: ConditionOp;
    value?: string | number;
  }
  interface NodeDataFields {
    dataText?: DataTemplate;
    dataBindings?: Record<string, DataBinding>;
    dataVisible?: DataCondition;
    dataHideEmpty?: boolean;
  }
  ```
  `dataBindings` keys are field paths as `BindableField.path` (`"fills.0.color"`, `"opacity"`) plus `"fills.<i>.image"` for an image paint.
- Produces (`binding-fields.ts`): `dataFieldsOf(el: CanvasElement): NodeDataFields` (reads defensively, as `pageItemTemplate` does), `hasDataFields(el): boolean`.
- Produces (`scope.types.ts`, `scope.ts`):
  ```ts
  interface DataScope { names: Record<string, unknown>; parent: DataScope | null;
    fields: Map<string, DataField> }   // "product.price" → its field, for formats and types
  rootScope(sources: DataSourceElement[], rowsOf: (id: string) => DataRow[]): DataScope
    // each source by name → its rows array; "<name>.$count" readable
  childScope(parent: DataScope, names: Record<string, unknown>, fields?: Map<string, DataField>): DataScope
  lookup(scope: DataScope, expr: string): { value: unknown; field: DataField | null } | null
    // first step resolved up the chain, rest with readPath; `$count` on a list is its length
  namesInScope(scope: DataScope): { expr: string; field: DataField | null }[]   // for pickers
  ```
- [ ] **Step 1:** Write the files. `rootScope`'s `fields` maps `"<source>[].<path>"`-style keys; `lookup` normalizes `products[3].price` to `products[].price` to find the field.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): data fields on layers and scopes to read them in`.

### Task 2: Tokens, formats and conditions

**Files:**

- Create: `data/bindings/{parse-tokens.ts,parse-tokens.types.ts,resolve-template.ts,format-value.ts,format-value.types.ts,evaluate-condition.ts}`

**Interfaces:**

- Produces:
  - `parseTokens(text: string): TemplatePart[]` with `type TemplatePart = { kind: "text"; text: string; start: number; end: number } | { kind: "token"; expr: string; start: number; end: number }`. A token is `{expr}` where `expr` matches `^[$A-Za-z_][\w$]*(\.[\w$]+|\[\d+\]|\["[^"]*"\])*$` and its first name isn't a catalog word; anything else is text. `{{` is a literal `{` (as in catalog templates).
  - `formatValue(value: unknown, field: DataField | null, format: FieldFormat | undefined, locale: string): string`: coerces strings by the field's type (`integer`/`number`/`currency` via `Number`, `date` via `Date.parse`), then `Intl.NumberFormat(locale, { maximumFractionDigits: decimals ?? 2 })`, currency with `style: "currency", currency: format.currency ?? "USD"`, dates with `dateStyle ?? "medium"`, booleans with `trueText`/`falseText` (default `"Yes"`/`"No"` from `t`), lists joined with `", "`, objects `""`; `prefix`/`suffix` added when the result isn't empty; `null`/`undefined` → `""`. The binding's `format` overrides the field's.
  - `resolveRichTemplate(template: DataTemplate, resolve: (expr: string) => string | null): { text: string; runs: TextNodeRun[]; empty: boolean; missing: string[] }`: rebuilds text and remaps each run's `start`/`end` across replaced tokens (a token's output gets the style of the run containing its `{`); `null` from `resolve` → `""` and the expr in `missing`; `empty` when every token resolved to `""` and the template's text parts are whitespace only.
  - `evaluateCondition(condition: DataCondition, scope: DataScope): boolean` (`gt`/`lt` numeric, `eq`/`neq` compare as strings unless both numeric, `contains` on strings and lists, `empty` = null/undefined/`""`/`[]`).
- [ ] **Step 1:** Write the four files.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): tokens, field formats and conditions`.

### Task 3: Planning a node's patch, and the sync

**Files:**

- Create: `data/bindings/plan-bindings.ts`
- Create: `data/sync/{sync-data.ts,affected-data.ts,index.ts}`
- Modify: `data/data.module.ts` (`host.contribute(designCanvas.afterEdit, (doc, change) => syncData(doc, change))`), README

**Interfaces:**

- Consumes: Tasks 1–2; the text module's re-layout helper that `catalog/model/page-items/item-text-patch.ts` uses (`textSize`), extended to runs (check `text/retypeset.ts` for one that handles runs; use it).
- Produces:
  - `planBindings(el: DesignNode, scope: DataScope, ctx: { locale: string; images: (value: string) => string | null }): { patch: Partial<DesignNode> | null; missing: string[] }` — text from `dataText` (re-laid out keeping `autoResize` and the aligned edge as `itemTextPatch` does), each `dataBindings` entry written into its field (numbers coerced; colors parsed as the field's color format; images: `ctx.images(value)` → the paint's `assetId`, unchanged when `null`), `visible` from `dataVisible`, and `dataHideEmpty` hides a text whose template came out `empty` or an image whose value is empty. Only differing values go in the patch.
  - `affectedData(doc, change: EditedChange): { all: boolean; nodes: string[] }` — `all` when a data-source record changed (snapshot, fields, name); otherwise the changed nodes that have data fields.
  - `syncData(doc: CanvasDocument, change: EditedChange): void` — builds the root scope once (`DESIGN_DATA_SOURCES`'s rows), plans every affected node (all nodes with data fields when `all`), writes the patches with `doc.updateMany`. Phase 3 replaces the root scope per node with the iterator scope it's in.
  - `locale`: the app's locale here (`getLocale()`); phase 4 passes the brochure's language for nodes on brochure pages.
- [ ] **Step 1:** Write `plan-bindings.ts`, `affected-data.ts`, `sync-data.ts`; skip nodes with `catalogText` (`pageItemTemplate` is the catalog's; check the field directly instead of importing catalog: `(el as { catalogText?: unknown }).catalogText !== undefined`).
- [ ] **Step 2:** Register the hook; README section "Bindings".
- [ ] **Step 3:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): keep bound layers up to date`.

### Task 4: Editing a template on the canvas (text module point)

**Files:**

- Create: `src/products/design/modules/text/{text.points.ts,text.points.types.ts}`
- Modify: `src/products/design/modules/text/text.kind.ts` (its `ElementText` `get`/`set` and `TEXT_RICH` read/write), `text/index.ts`, `text/README.md` (Points it owns)
- Create: `data/bindings/bound-text-template.ts`
- Modify: `data/data.module.ts`

**Interfaces:**

- Produces (text module):
  ```ts
  interface TextTemplateSource {
    id: string;
    claims(el: TextNodeElement): boolean;
    read(el: TextNodeElement): { text: string; runs: TextNodeRun[] };
    write(el: TextNodeElement, text: string, runs: TextNodeRun[]): Partial<TextNodeElement>;
  }
  export const textTemplates = definePoint<TextTemplateSource>("design.text.templates", {
    keyOf: (s) => s.id,
  });
  ```
- Produces (data): `BOUND_TEXT_TEMPLATE: TextTemplateSource` (claims texts with `dataText`; read returns it; write returns `{ dataText: { text, runs } }`, and `syncData` then writes the resolved text).
- [ ] **Step 1:** Find who calls the text kind's `text.get`/`set` and the rich spec (grep `TEXT_RICH`, `.text.get(`, `textContentPatch` across `src/canvas` and `src/products/design`). If they are only the editor's paths, make them consult the first claiming `textTemplates` entry; if rendering also uses them, add the consult only at the editor's open and commit (`canvas/text/text-editor.ts` reads through the kind; give the kind an `editingText`/`commitText` pair instead). Write down which in the text README.
- [ ] **Step 2:** The text module reads its point's entries the way other modules read theirs (through the module host when it registers; keep a module-level list set in `register`, as other points' readers do).
- [ ] **Step 3:** Write and contribute `BOUND_TEXT_TEMPLATE` (`host.contribute(textModule's textTemplates, …)` through `host.require("text")` or the import allowed by `uses: ["text"]`).
- [ ] **Step 4:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(text): texts can be edited through a template`.

### Task 5: Images from data

**Files:**

- Create: `data/update/{download-images.ts,download-images.types.ts}`
- Modify: `data/update/update-source.ts` (after guessing fields), `data/sources/file.source.ts` (setting `imagesFolder`, kind `"folder"`), `data/settings/setting-spec.types.ts` (`kind: "folder"`), `data/services/data-services.types.ts` (`pickFolder(): Promise<string | null>`), `data/ui/hooks/use-data-services.ts`, `data/ui/data-tab/setting-field.tsx`

**Interfaces:**

- Produces: `downloadImages(rows: DataRow[], fields: DataField[], known: Record<string, string>, ctx: { doc: CanvasDocument; services: DataServices; settings: Record<string, SettingValue>; signal: AbortSignal; onProgress?(done: number, total: number): void }): Promise<{ images: Record<string, string>; failed: string[] }>` — for every value of an `image-url`, `image-base64` or `image-file` field not already in `known`: URLs via `services.http.getBytes` (4 at a time), base64 decoded from `data:` URLs, file names read from `join(imagesFolder, value)` with `services.readFile`; bytes checked to be an image by magic number (PNG, JPEG, GIF, WebP, SVG text); good ones `doc.addAsset(createId(), bytes)`. Keys: the URL, the file name, or `"b64:" + first 64 chars + length` for base64. Returns the merged map; never throws for one image.
- `UpdateResult` gains `imagesFailed: number`; the snapshot write also writes `images` in the same record update. `UpdateStage` gains `"images"`.
- `planBindings`' `ctx.images(value)` looks the value up in the source's `images` (by the same key rule).
- [ ] **Step 1:** Extend the types, write `downloadImages`, wire it into `updateSource`.
- [ ] **Step 2:** Add the `folder` setting kind (UI `pickFolder` over the dialog plugin's directory pick in `@platform`; add a `pickFolder` export there if there's none).
- [ ] **Step 3:** In the Data tab, changing a field's type to an image type shows "Update to download its images" next to the field.
- [ ] **Step 4:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): images from data are saved in the file`.

### Task 6: Renaming a source keeps its references

**Files:**

- Create: `data/bindings/rename-references.ts`
- Modify: `data/model/design-data-sources.ts` (`rename`)

**Interfaces:**

- Produces: `renameReferences(doc: CanvasDocument, from: string, to: string): void` — in every node's `dataText` (token exprs whose first name is `from`), `dataBindings[*].path`, `dataVisible.path` (and, from phase 3, `repeat.source`), replacing the first name; one `updateMany`, called by `rename` inside its undo step.
- [ ] **Step 1:** Write it and call it from `rename`.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): renaming a source keeps what's bound to it`.

### Task 7: The Data section of the properties panel

**Files:**

- Create: `data/ui/data-section/{data-section.tsx,text-template-field.tsx,bind-field-row.tsx,condition-field.tsx,field-picker.tsx}` + `.types.ts` for each
- Create: `data/bindings/bind-data.ts` (the edit both the panel and agents use)
- Modify: `data/data.module.ts` (`designEditor.propertySections` entry `{ id: "data.bindings", tab: "design", order: 40, when: ({ nodes }) => nodes.length === 1, component: DataSection }`), locales, README

**Interfaces:**

- Produces: `bindData(doc, id: string, patch: { text?: DataTemplate | null; bindings?: Record<string, DataBinding | null>; visible?: DataCondition | null; hideWhenEmpty?: boolean }): void` — validates paths parse, writes the node's data fields, removes the variable binding (`el.bindings[path]`) of each newly bound field, one undo step (`checkpoint` first). `text: null` stops the template and keeps the current resolved text.
- Produces: `scopeAt(doc, nodeId): DataScope` (root scope now; phase 3 adds iterator scopes from the node's ancestors) in `data/bindings/scope.ts`.
- UI (kit only):
  - **Text** (texts only): "Text from data" `SwitchField`; on, `TextTemplateField` shows the template (single-line `Field` with `useCommitField`) and a `FieldPicker` button that inserts `{expr}` at the caret.
  - **Fields:** one `BindFieldRow` per compatible bindable field of the node (`kinds.kindOf(el).bindable(el)`: colors ← `color`; numbers ← `integer`/`number`/`currency`) and per image paint (← image types); each a `FieldPicker` (`SelectField` grouped by source / row name from `namesInScope(scopeAt(…))`, showing alias and a sample value) with a clear button.
  - **Show when:** `ConditionField` (path picker, op `SelectField`, value `Field`); "Hide when empty" `CheckboxField`.
- [ ] **Step 1:** `bindData` and `scopeAt`.
- [ ] **Step 2:** The components and the section registration; i18n keys under `section.*`, `condition.*`.
- [ ] **Step 3:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): bind layers to data from the properties panel`.

### Task 8: `bind_data` agent tool, changelog

**Files:**

- Create: `data/mcp/bind-data.mcp.ts`; Modify: `data/mcp/index.ts`, README, `CHANGELOG.md`, `CHANGELOG.es.md`

**Interfaces:**

- Produces: `bind_data { layer, text?: string | null (a template; the layer's current style is used for its runs), bindings?: { [fieldPath]: { path, format? } | null }, visibleWhen?: { path, op, value? } | null, hideWhenEmpty?: boolean }` over `bindData`, one `asUndoStep`; errors name the bad path or field. Its description lists the token syntax, `$` names and the catalog words that aren't data.
- [ ] **Step 1:** Write the tool.
- [ ] **Step 2:** Changelog `New`: "Texts, images and colors can now show data from a source. Write a field's name in braces, such as {products[0].name}, or bind a layer's image or color in the new Data section; numbers, prices and dates are written in your language, and layers can hide when a value is empty." (+ Spanish).
- [ ] **Step 3:** `pnpm lint && pnpm typecheck && pnpm format:check` → pass. Commit: `feat(data): bind_data agent tool`.
