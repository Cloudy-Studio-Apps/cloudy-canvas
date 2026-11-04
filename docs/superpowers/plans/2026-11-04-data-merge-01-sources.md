# Data merge, phase 1: Sources Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A design file holds data sources (a local CSV/JSON file or an HTTP API), each with an Update button that fetches, parses and saves a snapshot; they're listed in a new Data tab and agents can manage them.

**Architecture:** A new core module `data` in `src/products/design/modules/data/`. Sources are record elements (`DataSourceKind`, like `BrochureKind`); parsed data is a JSON document asset (the snapshot). Two points, `dataSourceTypes` and `dataFormats`, carry the built-ins and plugins' additions alike. Platform access reaches the engine through a `DataServices` object a session hook installs.

**Tech Stack:** TypeScript (strict, `noUncheckedIndexedAccess`), Yjs via `CanvasDocument`, React 19 + kit components, Tauri plugin-http / plugin-fs, `papaparse`.

**Spec:** [docs/superpowers/specs/2026-11-04-catalog-data-merge-design.md](../specs/2026-11-04-catalog-data-merge-design.md) · Overview and file tree: [00-overview](2026-11-04-data-merge-00-overview.md)

## Global Constraints

- Verification is `pnpm typecheck && pnpm lint && pnpm format:check` only; no test framework, no `tauri dev`, no builds.
- Engine code (everything outside `ui/` and `data.module.ts`) never imports React, `@platform`, `@tauri-apps/*`, `@shared/ui`, `@shared/stores`, `@canvas-ui`.
- Content only through `CanvasDocument` (`add`, `update`, `updateMany`, `remove`), `doc.checkpoint()` before a user action; agent tools wrap writes in one `asUndoStep` and validate first.
- Ids from `createId()`. Every `interface`/`type` in a sibling `.types.ts`.
- User text through `t` with `en.json` + `es.json`; MCP tool text English.
- Secrets never written to the document.
- Nothing fetches on its own: only an explicit Update (button, agent tool).
- Kit components (`SelectField`, `Field`, `NumberInput`, …), semantic tokens, radii ≤ 8px, `notifyError` for failures.

## Review Focus

1. **A failed Update** (network down, 404, bad JSON, CSV with one column) must leave the source exactly as it was and show the error in the tab; never a half-written snapshot. → Task 6 step 3.
2. **Undo after Update** must bring the old data back (record points back at the old asset). → Task 6 step 3 (one `checkpoint` before the write, asset added before the record update).
3. **JSON whose rows are not at the top** (`{ "data": { "items": [...] } }`) and **a top-level object** (one row) must still give a table. → Task 4 `normalizeRows`.
4. **A source opened on another machine without its API key** must say so and keep the saved data. → Task 6 (`missingSecrets`) and Task 7 (row state).
5. **A CSV with a BOM, `;` delimiter, quoted newlines or duplicate headers** must parse into the right columns (duplicates become `name`, `name_2`). → Task 5 CSV format.

---

### Task 1: Platform: HTTP requests and a secret store

**Files:**

- Modify: `src/shared/core/links/links.types.ts` (HttpClient)
- Create: `src/shared/core/secrets/secret-store.types.ts`, `src/shared/core/secrets/index.ts`
- Modify: `src/shared/core/index.ts`
- Modify: `src/platform/http.ts`
- Create: `src/platform/secret-store.ts`
- Modify: `src/platform/index.ts`, `src/platform/README.md` (or the README that lists platform pieces), `src/shared/core/README.md` if it lists interfaces

**Interfaces:**

- Produces:

  ```ts
  type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  interface HttpRequest { url: string; method?: HttpMethod; headers?: Record<string, string>;
    body?: string; timeoutMs?: number; signal?: AbortSignal }
  interface HttpResponse { status: number; ok: boolean; headers: Record<string, string>;
    bytes: Uint8Array }
  interface HttpClient { getText…; getBytes…; request(req: HttpRequest): Promise<HttpResponse> }
  interface SecretStore { get(key: string): Promise<string | null>;
    set(key: string, value: string | null): Promise<void> }   // null deletes
  export const secretStore: SecretStore   // from @platform
  ```

- [ ] **Step 1:** Add the types above to `links.types.ts` (HttpMethod, HttpRequest, HttpResponse next to `HttpClient`; `request` doesn't throw on non-2xx, throws on network errors, timeout and abort). Export them from the `shared/core` barrels with `export type`.
- [ ] **Step 2:** Implement `request` in `platform/http.ts`: default `timeoutMs` 30 000, combine it with `req.signal` (`AbortSignal.any`), Tauri `fetch` when `isTauri()`, header names lower-cased in the response. Leave the 10 s link-preview timeout of `getText`/`getBytes` as it is.
- [ ] **Step 3:** Create `SecretStore` in `shared/core/secrets/`, and `platform/secret-store.ts`: desktop reads/writes `join(await appDataDir(), "secrets.json")` (one JSON object, written whole; read once and cached in memory) with `@tauri-apps/plugin-fs`; browser uses `localStorage["cloudy.secrets"]`. Export `secretStore` from `platform/index.ts`. Check `src-tauri/capabilities/default.json` allows fs read/write in `$APPDATA` (sticker library already writes there); if not, add the narrowest scope.
- [ ] **Step 4:** Run `pnpm typecheck && pnpm lint && pnpm format:check`. Expected: all pass (TypeScript flags any other `HttpClient` object missing `request`; today only `platform/http.ts` implements it).
- [ ] **Step 5:** Commit: `git commit -m "feat(platform): HTTP requests with methods and headers, and a device secret store"`.

### Task 2: The `data` module and the source record

**Files:**

- Create: `src/products/design/modules/data/{README.md,data.module.ts,data.i18n.ts,index.ts,locales/en.json,locales/es.json}`
- Create: `src/products/design/modules/data/source/{data-source.constants.ts,data-source.types.ts,data-source.defaults.ts,data-source.kind.ts,data-source.factory.ts,is-data-source.ts,index.ts}`
- Modify: `src/products/design/modules/index.ts` (`export * from "./data"`), `src/products/design/ui/modules/design-modules.ts` (import `dataModule`, list it after `frameModule`, before `catalogModule`), `docs/modules.md` (Design tiers table: `data`, Core, "data sources, bindings and iterators; the `dataSourceTypes`/`dataFormats` points"), `src/products/design/README.md` (module list)

**Interfaces:**

- Produces (`source/data-source.types.ts`):
  ```ts
  type SettingValue = string | number | boolean | Record<string, string> | null;
  type FieldType =
    | "text"
    | "integer"
    | "number"
    | "currency"
    | "boolean"
    | "date"
    | "color"
    | "url"
    | "image-url"
    | "image-base64"
    | "image-file"
    | "list"
    | "object";
  interface FieldFormat {
    decimals?: number;
    currency?: string;
    dateStyle?: "short" | "medium" | "long";
    prefix?: string;
    suffix?: string;
    trueText?: string;
    falseText?: string;
  }
  interface DataField {
    path: string;
    alias?: string;
    type: FieldType;
    format?: FieldFormat;
    hidden?: boolean;
  }
  interface DataSnapshot {
    assetId: string;
    updatedAt: number;
    rowCount: number;
    hash: string;
  }
  interface DataSourceElement extends CanvasElement {
    type: "data-source";
    name: string;
    sourceType: string;
    settings: Record<string, SettingValue>;
    format: string; // "auto" or a format id
    formatOptions: Record<string, SettingValue>;
    fields: DataField[];
    snapshot: DataSnapshot | null;
    images: Record<string, string>;
  }
  ```
  `DATA_SOURCE_TYPE = "data-source"`; `createDataSource(index: string, init: { name: string; sourceType: string; settings: Record<string, SettingValue>; format?: string }): DataSourceElement`; `isDataSource(el): el is DataSourceElement`; `class DataSourceKind` (`creatable = false`, `boxed = false`, empty `draw`, `hitTest` false, `assets(el)` = snapshot asset + every `images` value, `fillDefaults` filling every field for older records).
- Produces: `dataModule` (id `"data"`, tier `"core"`, `requires: ["core", "pages", "frame"]`, `uses: ["text", "image", "auto-layout"]`, `exports: { ...dataApi, ...dataUi }`), registering `designCanvas.kinds` ← `new DataSourceKind()`.

- [ ] **Step 1:** Write `data-source.types.ts`, constants, defaults (`format: "auto"`, empty `formatOptions`/`fields`/`images`, `snapshot: null`), factory (over `createElementBase(DATA_SOURCE_TYPE, { x: 0, y: 0, w: 0, h: 0 }, index)`, as `createBrochure`), `is-data-source.ts`, kind, `source/index.ts`.
- [ ] **Step 2:** Write `data.i18n.ts` (as `catalog.i18n.ts`), locales with a `tab.title` key ("Data" / "Datos"), `index.ts` exporting `./source`, `data.module.ts` with only the kind for now (`exports` with a `ui/index.ts` that exports nothing yet is fine: create `ui/index.ts` with `export {};`).
- [ ] **Step 3:** Write `README.md` from the template in `docs/modules.md` (Tier core; Requires core, pages, frame; uses text, image, auto-layout; Contributes kinds `DataSourceKind`; Points it owns: filled in Task 3), with a "How it works" paragraph on the record. Register the module and update the docs listed above.
- [ ] **Step 4:** Run `pnpm typecheck && pnpm lint && pnpm format:check`. Expected: pass (`check-modules.mjs` accepts the module; `check-locales.mjs` sees `es.json` complete).
- [ ] **Step 5:** Commit: `feat(data): the data module and its source record`.

### Task 3: Points, settings and services

**Files:**

- Create: `data/data.points.ts`, `data/data.points.types.ts`
- Create: `data/settings/{setting-spec.types.ts,read-settings.ts,index.ts}`
- Create: `data/services/{data-services.types.ts,index.ts}`
- Modify: `data/index.ts`, `data/README.md` (Points it owns)

**Interfaces:**

- Produces (`settings/setting-spec.types.ts`):
  ```ts
  type SettingSpec =
    | {
        key: string;
        kind: "text" | "url" | "multiline";
        label: string;
        placeholder?: string;
        required?: boolean;
      }
    | { key: string; kind: "number"; label: string; min?: number; max?: number }
    | { key: string; kind: "boolean"; label: string }
    | { key: string; kind: "select"; label: string; options: { value: string; label: string }[] }
    | { key: string; kind: "pairs"; label: string; secretValues?: boolean } // headers: name → value
    | { key: string; kind: "file"; label: string; extensions: string[] }
    | { key: string; kind: "secret"; label: string; required?: boolean };
  ```
  Labels are already translated strings (built-ins pass `t(…)`; plugins pass their own).
- Produces (`settings/read-settings.ts`): `missingSettings(specs: SettingSpec[], settings: Record<string, SettingValue>, secrets: Record<string, string>): string[]` (keys of required ones that are empty); `splitSecrets(specs, values): { settings, secrets }` (secret-kind values and, for `pairs` with `secretValues`, the pair values, go to `secrets` keyed `key` or `key.name`).
- Produces (`services/data-services.types.ts`):
  ```ts
  interface DataServices {
    http: Pick<HttpClient, "request" | "getBytes">;
    readFile(path: string): Promise<Uint8Array>;
    pickFile(
      extensions: string[],
    ): Promise<{ path: string | null; name: string; bytes: Uint8Array } | null>;
    secrets: SecretStore;
  }
  interface RawData {
    text?: string;
    bytes?: Uint8Array;
    mime?: string;
    fileName?: string;
  }
  interface SourceContext {
    services: DataServices;
    signal: AbortSignal;
    secrets: Record<string, string>;
  }
  ```
- Produces (`data.points.types.ts`, `data.points.ts`):

  ```ts
  interface DataSourceType {
    id: string;
    label: string;
    icon: ExtensionIcon;
    settings: SettingSpec[];
    defaultName(settings: Record<string, SettingValue>): string;
    update(settings: Record<string, SettingValue>, ctx: SourceContext): Promise<RawData>;
  }
  interface DataFormat {
    id: string;
    label: string;
    extensions: string[];
    mimes: string[];
    options?: SettingSpec[];
    sniff?(raw: RawData): boolean;
    parse(raw: RawData, options: Record<string, SettingValue>): Promise<unknown>;
  }
  export const dataSourceTypes = definePoint<DataSourceType>("design.data.sourceTypes", {
    keyOf: (t) => t.id,
  });
  export const dataFormats = definePoint<DataFormat>("design.data.formats", { keyOf: (f) => f.id });
  ```

  (`ExtensionIcon` is the type `LeftTabEntry.icon` uses; import it from where that type does. If that's a UI type, keep `icon` as `string`, a lucide icon name, and map it in the UI; decide by what `check-modules` allows in engine files.)

- [ ] **Step 1:** Write the types and `read-settings.ts`.
- [ ] **Step 2:** Write `data.points.ts` and export points + types from `data/index.ts`. README: "Points it owns: `dataSourceTypes` (where data comes from; built-ins and plugins), `dataFormats` (how raw data becomes rows)".
- [ ] **Step 3:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): source type and format points`.

### Task 4: The table: paths, rows and guessed fields

**Files:**

- Create: `data/table/{data-table.types.ts,read-path.ts,read-path.types.ts,normalize-rows.ts,guess-fields.ts,index.ts}`

**Interfaces:**

- Produces:
  - `type DataRow = Record<string, unknown>`; `interface DataTable { rows: DataRow[]; fields: DataField[] }`
  - `parsePath(path: string): PathStep[]` with `type PathStep = { key: string } | { index: number }`; accepts `a.b`, `a[0].b`, `a.0.b`, quoted keys `a["x.y"]`; throws `Error("Bad path: …")`.
  - `readPath(value: unknown, path: string | PathStep[]): unknown` (`undefined` when missing).
  - `normalizeRows(parsed: unknown): DataRow[]`: an array of objects → it; an array of scalars → `{ value }` rows; an object → the first array of objects found breadth-first (depth ≤ 4) or, with none, `[object]`; anything else → `[]`.
  - `guessFields(rows: DataRow[], keep: DataField[]): DataField[]`: the union of leaf paths over the first 200 rows (objects are descended into; arrays are kept whole as `list`), types guessed by value: integers → `integer`, other numbers → `number`, `true/false` (and `"true"/"false"`) → `boolean`, ISO dates → `date`, `#rgb/#rrggbb` → `color`, `http(s)://…` ending in an image extension → `image-url`, other URLs → `url`, `data:image/` → `image-base64`, numeric strings → `number`/`integer`, else `text`. Fields already in `keep` (same path) keep their alias, type, format and hidden.

- [ ] **Step 1:** Write the types, then `read-path.ts`, `normalize-rows.ts`, `guess-fields.ts` as specified.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): read data paths and guess a table's fields`.

### Task 5: Built-in formats and source types

**Files:**

- Modify: `package.json` (`papaparse`, dev `@types/papaparse`) via `pnpm add papaparse && pnpm add -D @types/papaparse`
- Create: `data/formats/{csv.format.ts,json.format.ts,detect-format.ts,index.ts}`
- Create: `data/sources/{file.source.ts,http.source.ts,index.ts}`
- Modify: `data/data.module.ts` (contribute them), locales

**Interfaces:**

- Consumes: Task 3 points and `RawData`.
- Produces: `CSV_FORMAT` (id `csv`, options: `delimiter` select auto/`,`/`;`/tab/`|`, `header` boolean default true), `JSON_FORMAT` (id `json`, also accepts NDJSON: one object per line when the whole text doesn't parse), `detectFormat(raw: RawData, formats: DataFormat[]): DataFormat | null` (by file extension, then mime, then each `sniff`), `FILE_SOURCE` (id `file`, settings: `path` (`file`, extensions from all formats); `update` reads `ctx.services.readFile(path)`; `defaultName` the file's base name), `HTTP_SOURCE` (id `http`, settings: `url` (required), `method` select GET/POST, `headers` pairs with `secretValues: true`, `body` multiline; `update` calls `ctx.services.http.request`, throws `Error("<url> answered <status>.")` on non-2xx, passes the response's `content-type` as `mime`; `defaultName` the URL's last path segment or host).
- CSV: decode bytes as UTF-8 stripping a BOM; `Papa.parse` with `header`, `skipEmptyLines: "greedy"`, `dynamicTyping: false` (types come from `guessFields`); duplicate headers renamed `name_2`, `name_3`; empty headers `column_N`. Parse errors other than "too few fields" throw.

- [ ] **Step 1:** Install the dependency; write the formats and `detectFormat`.
- [ ] **Step 2:** Write the two source types (labels through `t`: add `sources.file.*`, `sources.http.*`, `formats.*` keys in both locales).
- [ ] **Step 3:** Contribute them in `data.module.ts`: `host.contribute(dataSourceTypes, FILE_SOURCE, HTTP_SOURCE); host.contribute(dataFormats, CSV_FORMAT, JSON_FORMAT);`.
- [ ] **Step 4:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): file and HTTP sources, CSV and JSON formats`.

### Task 6: Snapshots, Update and the sources service

**Files:**

- Create: `data/update/{snapshot.ts,snapshot.types.ts,update-source.ts,update-source.types.ts,index.ts}`
- Create: `data/model/{design-data-sources.ts,design-data-sources.types.ts,source-name.ts,index.ts}`
- Modify: `data/index.ts`, `data/README.md`

**Interfaces:**

- Consumes: Tasks 2–5.
- Produces:
  - `writeSnapshot(doc: CanvasDocument, rows: DataRow[]): Promise<DataSnapshot>` (JSON `{ version: 1, rows }` encoded UTF-8, `hash` = SHA-256 hex via `crypto.subtle`, asset id `createId()`, `doc.addAsset`); `readSnapshot(doc, snapshot: DataSnapshot | null): DataRow[]` (parses once per asset id, cached in a module-level `Map<string, DataRow[]>`).
  - `RESERVED_NAMES = ["page", "pages", "title", "section", "date", "toc", "item"]`; `sourceName(wanted: string, taken: string[]): string` (lower-case identifier `[a-z_][a-z0-9_]*` from the text, not reserved, not starting with `$`, made unique with `_2`…).
  - `type UpdateStage = "fetching" | "parsing" | "saving"`; `interface UpdateOptions { signal?: AbortSignal; onStage?(stage: UpdateStage): void }`; `interface UpdateResult { ok: boolean; rowCount: number; error?: string; changed: boolean }`.
  - `updateSource(doc, id, ctx: { types: DataSourceType[]; formats: DataFormat[]; services: DataServices }, options?): Promise<UpdateResult>`: load secrets (`services.secrets.get("data-source:<id>:<key>")` for each secret key), check `missingSettings` (error `"Missing: <keys>"`), `type.update`, pick format (`record.format` or `detectFormat`), `parse`, `normalizeRows`, `guessFields(rows, record.fields)`, `writeSnapshot`; then **one** `doc.checkpoint()` and `doc.update(id, { snapshot, fields })`. If the new hash equals the old one, only `updatedAt` changes (`changed: false`). Any throw → nothing is written to the document; the result is `ok: false` with the message, and the previous snapshot stays. **Errors are not in the record** (decided while planning, a change from the spec's `error?` field): an error is this device's (another machine may have the key), so `DesignDataSources` keeps the last one per source in memory and writing it would only add undo steps and collaboration traffic.
  - `DESIGN_DATA_SOURCES = defineService("design.dataSources", (doc) => new DesignDataSources(doc))` with: `setContext(ctx: { types; formats; services } | null)`, `list(): DataSourceElement[]` (by index), `get(id)`, `create(init: { sourceType: string; settings; secrets?: Record<string,string>; format?; name? }): Promise<DataSourceElement>` (one undo step; secrets written to the store; name from `type.defaultName` via `sourceName`), `rename(id, name)`, `setSettings(id, settings, secrets?)`, `setFields(id, fields)`, `setFormat(id, format, options)`, `remove(id)` (one undo step each, `checkpoint` first), `update(id, options?)`, `updateAll(options?)`, `rows(id): DataRow[]`, `table(id): DataTable`, `missingSecrets(id): Promise<string[]>`, `error(id): string | null` (the last failed Update's message on this device, cleared by a successful one), `onChange(listener): () => void` (fires on record changes and update stages; use `Emitter`). Throws `Error("Data sources aren't ready: no editor is open.")` from `update` when no context is set.

- [ ] **Step 1:** Write `snapshot.ts` and `source-name.ts`.
- [ ] **Step 2:** Write `update-source.ts` as specified.
- [ ] **Step 3:** Write `DesignDataSources` and the service; check that undoing the Update step restores the previous `snapshot` and `fields` (the asset is outside history and is never deleted; the record points back at it).
- [ ] **Step 4:** README "How it works": the record, the snapshot asset and why it's outside undo, Update's steps, secrets keys, names and reserved words.
- [ ] **Step 5:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): update a source into a saved snapshot`.

### Task 7: The Data tab

**Files:**

- Create: `data/ui/{index.ts,data.points.ts,data.points.types.ts}` (UI point `dataSourceForms`: `{ type: string; component: ComponentType<SourceFormProps> }`, keyed by `type`)
- Create: `data/ui/hooks/{use-data-sources.ts,use-data-services.ts,use-update-source.ts}`
- Create: `data/ui/data-tab/{data-tab.tsx,source-list.tsx,source-row.tsx,add-source-menu.tsx,source-detail.tsx,settings-form.tsx,setting-field.tsx,field-list.tsx,field-row.tsx,rows-table.tsx,update-button.tsx}` + a `.types.ts` per component with props
- Modify: `data/data.module.ts` (left tab, session hook), `catalog/catalog.mode.ts` (`rail.keep: ["data"]` next to `tabs`), locales, README

**Interfaces:**

- Consumes: `DESIGN_DATA_SOURCES`, `dataSourceTypes`, `dataFormats` (read their entries through the module host's point registry, the way other modules read their points' entries in UI; e.g. `catalogPageItems` in the catalog's Page items list).
- Produces: `useDataSources(): DataSourceElement[]` (re-renders on `onChange`); `useUpdateSource(id): { run(): void; stage: UpdateStage | null; cancel(): void }` (an `AbortController`; failures → `notifyError(t("update.failed"), error)`); `useDataServices` session hook: on mount `setContext({ types, formats, services: { http, readFile: readLocalFile, pickFile, secrets: secretStore } })`, `null` on unmount (`pickFile` over `openFile` from `@platform`, returning its path when it has one).
- Left tab: `host.contribute(designEditor.leftTabs, { id: "data", label: t("tab.title"), icon: Database, order: 30, component: DataTab })` (check the orders used by Layers 10 and the other tabs and pick the next free slot after Assets).

UI behavior (kit pieces only):

- **List:** each `SourceRow`: type icon, name (`LayerName`-style rename on double-click via `useCommitField`), "N rows · updated 3 days ago" (`Intl.RelativeTimeFormat` in the app's locale), an error line in `text-destructive` when `error(id)` isn't `null`, a "Needs a key on this device" line when `missingSecrets` is non-empty, `UpdateButton` (spinner and stage while running, click again cancels). Header: "+ Add source" (`AddSourceMenu`: one item per source type) and "Update all".
- **Add:** picking a type opens `SourceDetail` in create mode with `SettingsForm` (the type's `dataSourceForms` component when there is one); "Create and update" creates then runs Update. For `file`, the file setting's button calls `pickFile` and also proposes the format from the extension.
- **Detail** (a click on a row; back arrow returns to the list): settings form (edits commit with `setSettings`), format `SelectField` ("Automatic" + every format) with its options, `FieldList` (path, alias via `useCommitField`, type `SelectField`, hidden `CheckboxField`, a sample value from row 0), `RowsTable` (the first 200 rows, visible fields as columns, text truncated, "Showing 200 of N"), Remove source (destructive, with confirm via `confirmDelete` from `@platform` if the app uses it for deletes).
- [ ] **Step 1:** Hooks and the UI point.
- [ ] **Step 2:** The components, listed above, each in its own file with a `.types.ts` for props; i18n keys under `tab.*`, `source.*`, `fields.*`, `update.*`.
- [ ] **Step 3:** Register the tab and the session hook (`designEditor.sessionHooks` or the point the catalog uses for `hooks`; follow what `variablesModule` contributes as `sessionHooks`). Add `rail.keep: ["data"]` to the Catalog mode.
- [ ] **Step 4:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass (`cloudy/no-literal-ui-text` clean). Commit: `feat(data): the Data tab`.

### Task 8: Agent tools for sources

**Files:**

- Create: `data/mcp/{source-args.ts,describe-source.ts,data-sources.mcp.ts,index.ts}`
- Modify: `data/data.module.ts` (`host.contribute(designMcpTools, { id: "data", tools: () => dataTools })`), `data/index.ts` (`export { dataTools } from "./mcp"`), README (MCP tools list), `src/app/mcp/README.md` if it lists tool groups

**Interfaces:**

- Consumes: `DESIGN_DATA_SOURCES`, `requireDesign(host)`, arg helpers from `@canvas` (`stringArg`, `optionalString`, …) as `brochure-list.mcp.ts` uses them.
- Produces tools (all English text; each edit one `asUndoStep`, validating ids, types and settings before writing):
  - `list_data_sources` → `{ sources: [{ id, name, type, format, rows, updatedAt, lastError, needsSecrets: string[] }] }`
  - `get_data_source { source, rows?: number (default 5, max 50) }` → settings (secret values never returned, only their keys with `"set": true|false`), fields, sample rows
  - `add_data_source { type, settings, secrets?, format?, name?, update?: boolean (default true) }` → the source (after Update when asked)
  - `update_data_source { source }` (or `all: true`) → `UpdateResult`s
  - `set_data_source { source, name?, settings?, secrets?, format?, formatOptions?, fields?: [{ path, alias?, type?, format?, hidden? }] }` (fields patch by path; unknown paths are an error)
  - `remove_data_source { source }`
  - Tool descriptions say: nothing updates on its own; secrets are kept on this device, never in the file.
- [ ] **Step 1:** Write the args helpers (`readSource(engine, args)` throwing `"No data source <id>. Call list_data_sources."`) and `describeSource`.
- [ ] **Step 2:** Write the tools.
- [ ] **Step 3:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): agent tools for data sources`.

### Task 9: Changelog and docs

**Files:** `CHANGELOG.md`, `CHANGELOG.es.md`, `data/README.md` (final pass), `docs/catalog-roadmap.md` (C2 Notes: "Phase 1 shipped: sources").

- [ ] **Step 1:** Under the unreleased `New` / `Novedades`: "Designs can now hold data sources: a CSV or JSON file, or a web API. The new Data tab lists them and shows their rows, and Update reads them again when you choose. API keys stay on this device and are never saved in the file." (and its Spanish version, same meaning, professional).
- [ ] **Step 2:** `pnpm lint` (runs the changelog check) `&& pnpm typecheck && pnpm format:check` → pass. Commit: `docs(changelog): data sources`.
