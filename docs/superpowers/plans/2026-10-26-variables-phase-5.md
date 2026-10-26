# Variables Phase 5 (Import/export) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring variables and styles into a design from another `.cdesign`, W3C Design Tokens
(DTCG) JSON, Tokens Studio JSON and Figma files, and write them out as DTCG, CSS, Tailwind v4,
SCSS, Swift and Kotlin.

**Architecture:** The pure token side lives in `canvas/tokens/exchange/` (selection with alias
closure, an import plan that keeps ids and resolves name conflicts, DTCG and Tokens Studio
readers, code writers over resolved values per mode), so boards can reuse it in phase 6. The
design's styles get DTCG codecs in the variables module (`variables/exchange/`), and the module
owns a `tokenFormats` extension point that the UI (Import… / Export ▸ in the Variables window)
and the agent tools (`export_tokens`, `import_tokens`) read. Figma's variables, collections,
modes, aliases, bound fields and shared styles become token records and bindings during the
`.fig` conversion (`products/design/figma/convert/tokens/`), reusing the old-file mode
migration (`migrateCollectionModes`) to turn Figma's per-collection modes into axes.

**Tech Stack:** TypeScript strict, Yjs (`CanvasDocument` token records), React 19, Tauri dialog/fs
plugins, the app's Kiwi `.fig` reader.

**Spec:** `docs/superpowers/specs/2026-10-24-variables-design-system-design.md` (Import/export,
Figma import, Agent tools; Phases §5).

## Global Constraints

- Verification is `pnpm lint`, `pnpm typecheck`, `pnpm format:check` only (no test framework, no
  builds). Behavioural checks run as a scratch harness bundled with Vite's `build({ ssr })` from
  the repo root into the session scratchpad, run with Node, then deleted; live checks through the
  app's MCP tools on a scratch design, every step undone.
- Small single-purpose files; every `interface`/`type` in a sibling `.types.ts`; kit components
  before raw elements (the variables module is exempt); semantic tokens; sharp radii.
- Engine code (`canvas/`, module engine files) is plain TS: no React, UI or platform imports.
- Ids from `createId()`. Re-importing keeps ids so it updates ("copy in keeping ids").
- Conflicts — same name, other id — ask: keep both / replace / skip (spec).
- Nothing is committed; the user commits.

## Review Focus

1. Re-importing the same DTCG/`.cdesign` source a second time updates in place (no duplicates),
   and an import whose aliases point outside the picked set still resolves (closure).
2. Figma paints dropped by the converter (video, missing images) don't shift `fills.N.color`
   bindings onto the wrong paint.
3. A Figma collection with several modes becomes an axis and layers keep showing the values they
   had (bindings resolve to the same colors in the file's current modes).
4. Code exports never emit invalid identifiers (paths with spaces, digits first, `/`, accents,
   duplicates after slugging).
5. Importing into a file with a same-named collection merges into it (no second "Primitives"),
   and mode names match the file's existing axis modes instead of adding new axes.

---

### Task 1: Exchange core — names, selection, import plan

**Files:**

- Create: `src/canvas/tokens/exchange/token-names.ts` (+ `.types.ts`), `select-tokens.ts`,
  `import-plan.ts`, `import-plan.types.ts`, `index.ts`
- Modify: `src/canvas/tokens/document-tokens.ts` (`importTokens`), `src/canvas/tokens/index.ts`

**Interfaces:**

- Produces:
  - `slugPath(path: string, separator: "-" | "_"): string` (lowercase ASCII, accents stripped,
    `/` and spaces → separator), `camelPath(path: string, upper?: boolean): string` (a valid
    identifier: a leading digit gets `_`), `uniqueNames(names: string[]): string[]` (`-2`, `-3`).
  - `TokenPick` = `{ collections: string[]; groups: { collectionId: string; group: string }[];
styles: string[]; styleTypes: string[] }`;
    `selectTokens(records: readonly TokenRecord[], pick: TokenPick): SelectedTokens`
    (`{ records: TokenRecord[]; extra: number }`: the picked variables/styles plus every alias
    target and style binding they need, their collections and axes, generators/scales of picked
    collections; `extra` counts the added dependencies).
  - `ImportChoice` = `"keep-both" | "replace" | "skip"`;
    `importConflicts(store: TokenStore, incoming: readonly TokenRecord[]): ImportConflict[]`
    (`{ incomingId, existingId, kind: "variable" | "style", name }`: same collection name + path,
    or same style type + name, with another id);
    `planTokenImport(store, incoming, choice): TokenImportPlan` (`{ records: TokenRecord[];
added: number; updated: number; skipped: number }`).
  - `DocumentTokens.importTokens(incoming: readonly TokenRecord[], choice: ImportChoice):
TokenImportPlan` — one undo step.

Plan rules (`planTokenImport`):

- Axes: same id → kept (modes merged by id, new modes appended); else same name → mapped to the
  existing axis with modes matched by name (unmatched modes appended); else added.
- Collections: same id → renamed to the incoming name; else same name → mapped; else added.
- Variables/styles: same id → replaced (updated). Conflict: `keep-both` adds it under a free
  name; `replace` writes the incoming value over the existing record (existing id kept, incoming
  id remapped to it everywhere); `skip` drops it and remaps the incoming id to the existing one.
- Every reference is remapped: `collectionId`, `axisId`, value mode keys, `{ alias }`,
  `contrastWith`, style `bindings`, generator `collectionId`/`baseVar`/`axisId`, `generatorId`.
- `order` keys are regenerated after the target's last ones for added records.

- [ ] **Step 1:** Write the scratch harness `exchange-core.check.ts` (scratchpad): two stores;
      asserts re-import of the same records gives `added 0, updated N`; an incoming "Primitives" with
      another id maps into the existing one; each `ImportChoice` on a conflicting `brand/500`
      (keep-both → `brand/500 2`, replace → existing id with incoming value, skip → unchanged) and an
      incoming alias to the skipped id points at the existing id; `selectTokens` of one group pulls
      its alias targets from another collection (`extra > 0`); `slugPath("Brand / Primário 500",
"-") === "brand-primario-500"`, `camelPath("2xl/space") === "_2xlSpace"`.
- [ ] **Step 2:** Run it — fails (modules missing).
- [ ] **Step 3:** Implement the files and `importTokens`.
- [ ] **Step 4:** Run harness → all assertions pass; `pnpm lint && pnpm typecheck`.

### Task 2: DTCG export and import (variables and styles)

**Files:**

- Create: `src/canvas/tokens/exchange/dtcg/` — `dtcg.types.ts`, `to-dtcg.ts`, `from-dtcg.ts`,
  `dtcg-values.ts` (colors, dimensions, references), `index.ts`
- Create: `src/products/design/modules/variables/exchange/style-codecs.ts` (+ `.types.ts`
  re-export of `DtcgStyleCodec`), `index.ts`

**Interfaces:**

- Produces:
  - `DtcgStyleCodec` = `{ styleType; dtcgType: string; write(style, ref: (variableId) => string |
null): unknown | null; read(value: unknown, refOf: (path) => string | null):
{ value: Record<string, unknown>; bindings: Record<string, string> } | null }`.
  - `toDtcg(store: TokenStore, options: { styles?: DtcgStyleCodec[]; records?: readonly
TokenRecord[] }): Record<string, unknown>`.
  - `fromDtcg(json: unknown, options: { styles?: DtcgStyleCodec[] }): TokenReadResult`
    (`{ records: TokenRecord[]; warnings: string[] }`), shared by Task 3.
  - `DESIGN_STYLE_CODECS: DtcgStyleCodec[]`: text → `typography`, effect (shadows only) →
    `shadow`, paint (one solid) → `color`.

Mapping (decided here, documented in CLAUDE.md):

- Root keys are collection names; nested groups are path segments; a token is
  `{ $type, $value, $description? }`. Styles go under a root group `Styles` (`Styles 2` if a
  collection already has that name), one subgroup per style type label.
- Colors `#rrggbb` (or `#rrggbbaa` when translucent); numbers `number`, or `dimension`
  `{ value, unit: "px" }` for px-like scopes (width-height, gap, padding, corner-radius,
  stroke-weight, font-size, letter-spacing, effect-value); strings `string` (`fontFamily` for the
  font-family scope); booleans `boolean`. Aliases `{Collection.path.to.token}`.
- `$extensions["cloud.cloudy-canvas"]`: on the root `{ version: 1, axes: [{ id, name, modes:
[{ id, name }] }] }`; on a token `{ id, axis?: axisName, modes?: { [modeName]: value },
scopes, hidden, codeSyntax, contrastWith? (paths) }`; on a style `{ id, styleType, value,
bindings (paths) }`. Our own extension wins on import (exact round trip); other files are read
  from the standard parts.
- Import accepts DTCG 2025 color objects (`{ colorSpace: "srgb", components, alpha }`), hex
  strings, `dimension` strings (`"16px"`, `"1rem"` = 16) and objects; unknown `$type`s and
  composite types without a codec are skipped with a warning; `$type` inherits from groups.

- [ ] **Step 1:** Harness `dtcg.check.ts`: build a store (Theme axis Light/Dark, a Primitives
      color ramp, a Semantic color aliasing it with a Dark override, a spacing number, a text style
      bound to a font-size variable); `fromDtcg(toDtcg(store))` gives the same ids, names, values per
      mode, scopes and style bindings; a hand-written third-party file (`{ color: { $type: "color",
brand: { $value: "#ff0000" }, link: { $value: "{color.brand}" } }, size: { $type: "dimension",
sm: { $value: "0.5rem" } } }`) imports as 3 variables with the alias and `sm = 8`.
- [ ] **Step 2:** Run — fails.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run harness → passes; lint + typecheck.

### Task 3: Tokens Studio import

**Files:**

- Create: `src/canvas/tokens/exchange/tokens-studio/` — `tokens-studio.types.ts`,
  `from-tokens-studio.ts`, `studio-values.ts`, `index.ts`

**Interfaces:**

- Consumes: `TokenReadResult`, `dtcg-values.ts` parsers, `DtcgStyleCodec` (reads `typography`
  and `boxShadow` through the codecs by mapping their field names first).
- Produces: `fromTokensStudio(json: unknown, options: { styles?: DtcgStyleCodec[] }):
TokenReadResult`; `isTokensStudio(json: unknown): boolean` (`$themes` or `$metadata`, or
  `value`/`type` tokens without `$value`).

Rules: each token set is a collection (`$metadata.tokenSetOrder` order). With `$themes`, every
theme `group` (or "Theme" without one) becomes an axis whose modes are its themes; a token path
defined in sets enabled by different themes of a group becomes one variable in a collection named
after the group, varying by that axis (each mode's value from its theme's set); sets enabled in
every theme (or `source`) stay plain collections. Types: `color`, `spacing`/`sizing`/
`borderRadius`/`borderWidth`/`dimension`/`fontSizes`/`letterSpacing`/`paragraphSpacing` →
number with the matching scope, `opacity` (`"40%"` → 40), `fontWeights` (names → CSS weights),
`lineHeights` (`"150%"` → 1.5), `fontFamilies`/`text` → string, `boolean`, `typography` and
`boxShadow` → styles. Aliases `{path}` resolve across sets (the first set in order defining it);
math expressions (`{space} * 2`) are skipped with a warning (phase 7).

- [ ] **Step 1:** Harness `tokens-studio.check.ts`: a file with sets `global`, `light`, `dark`,
      `$themes` Light/Dark (group "Mode"); asserts a "Mode" axis with Light/Dark, `bg` varying by it,
      `global.space.md` a gap-scoped number 16, an alias into `global`, one warning for a math value.
- [ ] **Step 2:** Run — fails. **Step 3:** Implement. **Step 4:** Passes; lint + typecheck.

### Task 4: Code exports

**Files:**

- Create: `src/canvas/tokens/exchange/code/` — `code-tokens.ts` (+ `.types.ts`: the variables
  resolved per mode, names per platform), `to-css.ts`, `to-tailwind.ts`, `to-scss.ts`,
  `to-swift.ts`, `to-kotlin.ts`, `index.ts`

**Interfaces:**

- Produces: `codeTokens(store: TokenStore, styles?: CodeStyle[]): CodeTokens` — each visible
  variable with `cssName` (`codeSyntax.web`'s `--name` when it has one, else `slugPath`),
  `swiftName`/`kotlinName` (`codeSyntax.ios/android` or `camelPath`), its `base` value (the file's
  base modes), `alias` (target's `cssName`), and `modes: { axis, mode, value }[]` for each
  non-base mode of its axis; `CodeStyle` (text and shadow styles as CSS declarations, given by
  the design). Writers: `toCss`, `toTailwind`, `toScss`, `toSwift`, `toKotlin`
  `(tokens: CodeTokens) => string`.

Output rules:

- CSS: `:root { … }` with aliases as `var(--target)`; each axis mode block
  `[data-<axis-slug>="<mode-slug>"] { … }`; when an axis has a mode named "Dark" (any case) and
  its base isn't, also `@media (prefers-color-scheme: dark) { :root:not([data-<axis>]) { … } }`.
  Numbers get `px` for px-like scopes, opacity values over 1 become `/100`; strings quoted. Text
  styles as `.text-<slug> { … }`, shadow styles as `--shadow-<slug>`.
- Tailwind v4: `@theme { … }` with namespaces by type/scope (`--color-`, `--spacing-`,
  `--radius-`, `--text-`, `--font-`, `--font-weight-`, `--leading-`, `--tracking-`, `--shadow-`,
  `--opacity-`), a path's first segment dropped when it repeats the namespace; mode blocks as in
  CSS after it.
- SCSS: `$name: value;` for the base, then a map per non-base mode (`$theme-dark: (name: value,
…);`).
- Swift: `import SwiftUI`, `enum Tokens` with nested `enum Colors`/`Numbers`/`Strings`/`Flags`;
  a variable varying by an axis is a `static func name(_ mode: <Axis>) -> T` over a generated
  `enum <Axis> { case … }`.
- Kotlin: Compose `object Tokens` with `Colors` (`Color(0xAARRGGBB)`), `Dimens` (`.dp`, `.sp` for
  font sizes), `Strings`, `Flags`; axis variables as `fun name(mode: <Axis>) = when (mode) { … }`
  with `enum class <Axis>`.
- Names are de-duplicated (`uniqueNames`) per output namespace.

- [ ] **Step 1:** Harness `code.check.ts`: the Task 2 store; asserts the CSS has
      `--semantic-text: var(--primitives-teal-700)` (or the codeSyntax name), a `[data-theme="dark"]`
      block, a `prefers-color-scheme` block; Tailwind has `@theme` and `--spacing-md: 16px`; Swift
      and Kotlin contain no identifier starting with a digit (regex) and the axis enum.
- [ ] **Step 2:** Run — fails. **Step 3:** Implement. **Step 4:** Passes; lint + typecheck.

### Task 5: Formats point, `.cdesign` reading, platform file access

**Files:**

- Create: `src/products/design/modules/variables/exchange/token-formats.ts` (`tokenFormats`
  point), `token-format.types.ts`, `built-in-formats.ts`, `read-token-source.ts`
- Create: `src/products/design/file/read-design-tokens.ts`; modify `file/index.ts`
- Create: `src/platform/token-file.ts` (`pickTokenFile`); modify `src/platform/index.ts`
- Modify: `variables.module.ts` (contribute the built-ins)

**Interfaces:**

- Produces:
  - `TokenFormat` = `{ id; label; extension; fileLabel; write?(store: TokenStore): string;
read?(text: string): TokenReadResult; detect?(json: unknown): boolean }`;
    `tokenFormats = definePoint<TokenFormat>("design.tokenFormats", { keyOf: (f) => f.id })`.
    Built-ins: `dtcg` (read+write, `.tokens.json`), `tokens-studio` (read), `css`, `tailwind`
    (`.css`), `scss`, `swift`, `kotlin` (`.kt`).
  - `readDesignTokens(bytes: Uint8Array, kinds): TokenRecord[]` (decode, `migrateCollectionModes`
    applied in memory, nothing opened as an editor).
  - `readTokenSource(file: { name: string; bytes: Uint8Array }, formats, kinds):
TokenSourceRead` (`{ label; records; warnings }`): `.cdesign` by magic, else JSON detected by
    the formats' `detect` (Tokens Studio before DTCG).
  - `pickTokenFile(): Promise<{ name: string; bytes: Uint8Array } | null>` (filters: tokens JSON,
    designs).
- Export saving reuses `exportFile(new Blob([text]), name, { extension, label })`.

- [ ] **Step 1:** Implement; lint + typecheck pass.

### Task 6: Import and export UI

**Files:**

- Create: `src/products/design/modules/variables/ui/exchange/` — `exchange-menu.tsx` (title bar:
  "Import…", "Export ▸" each write format), `import-tokens-dialog.tsx`, `import-pick-tree.tsx`
  (collections → top-level groups, style types → styles, all ticked), `import-conflicts.tsx`
  (the conflicting names and the three choices), `use-token-formats.ts`, `use-import-source.ts`,
  `exchange.types.ts`
- Modify: `variables-window.tsx` (title bar gets `ExchangeMenu`), `ui/index.ts`

Behaviour: Import… picks a file (`pickTokenFile`), reads it (`readTokenSource`), shows the dialog
(source name, warnings, the tree, "+ N variables they use" from `selectTokens`, conflicts with a
choice defaulting to `replace`), and Import writes `tokens.importTokens` (one undo step) then
toasts the counts. Export ▸ format saves `format.write(store)` through `exportFile`, named after
the document title. Failures toast with `notifyError`.

- [ ] **Step 1:** Implement; lint + typecheck pass.

### Task 7: Agent tools `export_tokens`, `import_tokens`

**Files:**

- Create: `src/products/design/modules/variables/agent/exchange.agent-tools.ts`
- Modify: `agent/index.ts`, `variables.module.ts` (tools get the formats through the host, as the
  styleguide's do)

**Interfaces:**

- `export_tokens { format, path? }` → the text (or `{ written: path }` when `path` given, through
  `writeFile`).
- `import_tokens { path? , text?, format?: "auto" | <read format id>, collections?: string[]
(names), conflict?: ImportChoice (default "replace"), preview?: boolean }` → `{ added, updated,
skipped, conflicts: names[], warnings }`; `preview` writes nothing.

- [ ] **Step 1:** Implement; lint + typecheck. **Step 2:** Live (MCP, scratch design): export
      DTCG, import it back (updated N, added 0), export CSS; undo everything.

### Task 8: Figma variables, styles and bindings

**Files:**

- Create: `src/products/design/figma/convert/tokens/` — `fig-variables.ts` (sets → collections
  with `modes`, variables with values by mode id, scopes, code syntax, description, hidden),
  `fig-variable-value.ts`, `fig-scopes.ts`, `fig-token-styles.ts` (text, effect, fill/stroke
  paint styles → `StyleRecord`s, with style bindings from their own `colorVar`/consumption maps),
  `fig-bindings.ts` (a layer's bindings: paints' `colorVar` by converted index,
  `variableConsumptionMap` fields, `styleIdFor*` → style paths), `fig-token-ids.ts`, `index.ts`
- Modify: `src/canvas/figma/nodes/fig-node.types.ts` (the fields read), `fig-import-context.ts`
  (`tokenId(guid)`: our id for a Figma variable/style guid, `null` when not imported),
  `src/products/design/figma/convert/fig-paints.ts` (`convertPaintsFrom` returns source indexes),
  `fig-node-base.ts` (paint bindings), `convert-node.ts` (merge bindings), `fig-text-runs.ts`
  (a run's `textStyle` + `runs.textStyle.<id>` binding), `convert-figma.ts`,
  `figma-import.types.ts` (`tokens: TokenRecord[]`), `figma-design-document.ts`
  (`setTokenRecordsUntracked` before the migrations, so `migrateVariableModes` makes the axes)

Field map (`variableConsumptionMap` → path): `STACK_SPACING` → `layout.gap`,
`STACK_COUNTER_SPACING` → `layout.counterGap`, `STACK_PADDING_{LEFT,TOP,RIGHT,BOTTOM}` →
`layout.padding.<side>`, the four corner radii → `cornerRadius` only when all four use one
variable, `WIDTH`/`HEIGHT` → `w`/`h`, `OPACITY` → `opacity`, `STROKE_WEIGHT` → `strokeWeight`,
`FONT_SIZE` → `fontSize`, `FONT_FAMILY` → `fontFamily`, `FONT_STYLE` → `fontStyle`,
`TEXT_DATA` → `text`, `VISIBLE` → `visible`. Anything else is counted ("bound fields …
kept as values"). Paths are kept only when the element's kind lists them as bindable.
Scopes: `ALL_SCOPES` → `[]`, `ALL_FILLS`, `FRAME_FILL`, `SHAPE_FILL`, `TEXT_FILL`,
`STROKE`/`STROKE_COLOR` → `stroke-color`, `EFFECT_COLOR`, `CORNER_RADIUS`, `WIDTH_HEIGHT`, `GAP`,
`STROKE_FLOAT` → `stroke-weight`, `OPACITY`, `FONT_SIZE`, `LINE_HEIGHT`, `LETTER_SPACING`,
`FONT_WEIGHT`, `EFFECT_FLOAT` → `effect-value`, `TEXT_CONTENT`, `FONT_FAMILY`, `FONT_STYLE`.
Values: `colorValue` → `#RRGGBBAA`, `floatValue`, `textValue`, `boolValue`, `alias` → `{ alias }`
(an alias to a variable not in the file — a library's — keeps its resolved value with a warning).
Grid styles and unknown data types are counted.

- [ ] **Step 1:** Harness `figma-tokens.check.ts` on `~/Downloads/DAW II - DIW.fig`
      (`readAndConvertFigma`): asserts 3 collections, 78 variables, 11 text styles and 3 effect
      styles; `color/bg/page` aliases a Primitivos color; "Guía de estilos" frame has
      `fills.0.color` and `layout.gap` bindings to the right variables; ≥300 texts carry a
      `textStyle` binding; every binding path is bindable on its element; NavarrOliver imports with
      no tokens and unchanged warnings.
- [ ] **Step 2:** Run — fails. **Step 3:** Implement. **Step 4:** Passes; lint + typecheck.

### Task 9: Docs and finish

- [ ] **Step 1:** CLAUDE.md: the Variables bullet says "phases 1, 2, 4 and 5" with an
      Import/export paragraph (exchange folder, DTCG mapping and extension, Tokens Studio rules,
      code writers, `tokenFormats`, UI, agents) and the Figma import paragraph mentions variables and
      styles; remove "token import/export, Figma variables" from "Not yet".
- [ ] **Step 2:** `pnpm lint && pnpm typecheck && pnpm format:check`.
