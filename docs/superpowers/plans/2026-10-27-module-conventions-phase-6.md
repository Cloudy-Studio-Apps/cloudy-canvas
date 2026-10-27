# Module conventions, phase 6: the plugin API is the barrels

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task (the user runs phases inline, no subagents). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A plugin gets what a built-in feature imports, by construction: `api` is the barrels
(`@canvas`, `@canvas-ui`, `@shared/core`, `@board` + `@board/ui`, `@design` + `@design/ui`) plus
three small curated groups, modules declare `exports` and reach each other with `host.require`,
and a check fails when a feature imports something a plugin couldn't reach.

**Architecture:** `createPluginApi` stops listing names: each group is a spread of a barrel (or of a
curated group file in `app/plugins/api/`) wrapped once by a non-recursive `strictApi`.
`AppModule.exports` + `ModuleHost.require(id)` give modules each other's public API. The gaps a
feature still has (measured below) are opened in the barrels; the few places where core knows a
feature (shader code, DBML/ER languages) move into the feature. `scripts/check-public-api.mjs`
(TypeScript API) keeps it that way.

**Tech Stack:** TypeScript (strict), React 19, Zustand, the `typescript` package (for the check
script), Node ESM scripts.

**Spec:** `docs/superpowers/specs/2026-10-25-module-conventions-design.md` (§12 phase 6, §14).

## Global Constraints

- Git is the user's: never commit, branch or `git mv` (use `mv`). Each task ends with the checks,
  not a commit; the user gets one commit message at the end.
- Verification is only `pnpm lint`, `pnpm typecheck`, `pnpm format:check`. No builds, cargo, `tauri
dev` or browser checks.
- No legacy: no aliases, no deprecated names, no old `api` groups kept "for compatibility".
- `PLUGIN_API_VERSION` stays `1`.
- **Never delete the i18n docs** (`docs/superpowers/specs/2026-10-27-i18n-design.md`, any i18n plan,
  `.superpowers/sdd/2026-10-27-i18n/`, the `../cloudy-canvas-i18n` worktree).
- **Translations (rule 30, `src/shared/core/i18n/README.md`)**: user-facing text goes through the
  folder's `t` (`<name>.i18n.ts` + `locales/en.json` + `locales/es.json`), generic words through
  `tCommon`; MCP text, ids and developer messages stay English. When code moves between folders,
  its keys move with it, **in both `en.json` and `es.json`, keeping the Spanish text**, and keys
  nobody uses any more are deleted from both. A folder's `t` is private: no `index.ts` or barrel
  exports it, so module `exports` and the barrel spreads never carry a `t`. `pnpm lint` runs
  `check-locales.mjs` and `cloudy/no-literal-ui-text`.
- Rule 25: every `interface`/`type` in a sibling `.types.ts`. Rule 21: small files.
- Built-in features keep importing **the declaring file** (relative, or `@design/ui/<path>`), never
  their own product barrel (`barrel` rule, and importing `@design/ui` from a module would make an
  import cycle through the module list). The barrels are the public list; Task 8's check ties the
  two together.

## Measured gaps (2026-10-27, after 5b)

An audit of every **feature** module's value imports from outside its folder, checked against the
barrels (engine and other modules' `index.ts` already pass, 0 gaps):

| From                           | Names a plugin can't reach today                                                                                                                                                                                                                                            |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@design/ui/…`                 | `BindSlot`, `BindableNumberField`, `NodeCheckbox`, `NodeOptionButtons`, `NodeSelectField`, `NumberField`, `PanelAddButton`, `PanelIconButton`, `PanelSection`, `PropertyGrid`, `useDesignEngine`, `useDesignState`, `useEditNodes`, `useSelectedNodes`, `useImageCropStore` |
| `@board/ui/…`                  | `BoardColorPalette`, `DocumentColorsButton`, `SourceEditor`, `dbmlLanguage`, `dbmlCompletions`, `erLanguage`, `erCompletions`, `defineBoardMode`, `registerBoardMode`, `useBoardEngine`, `useBoardState`, `useBoardPanelStore`                                              |
| `@shared/stores`, `@shared/ui` | `toast`, `notifyError`, `runWithLoading`, `usePaletteFavoritesStore`, `CelebratingSeal`, `CodeEditor`                                                                                                                                                                       |
| `@platform`                    | `exportFile`, `pickTokenFile`, `importDbmlFile`, `exportDbmlFile`, `http`, `openExternal`, `clipboard`, `fontLibrary`                                                                                                                                                       |
| npm                            | `react`, `react-dom` (`createPortal`), `zustand` (+`persist`), `lucide-react`, `@codemirror/language` (`StreamLanguage`), `fractional-indexing`; feature-only: `perfect-freehand`, `simple-icons`, `react-icons/si`, `lucide` (embed's svg icons)                           |

## Rulings (decided here, write them into the spec in Task 9)

1. **Names are the barrels' names.** No renaming layer: `api.board.boardCanvas`,
   `api.design.designEditor`, `api.design.defineDesignMode` (the 5b aliases `api.design.defineMode` /
   `registerMode` and `api.board.defineMode` / `registerMode` go; spec §15.3 is updated).
2. **Core modules' UI is reached with `host.require`.** `boardLibrary` (library), `designEffectTypes`
   / `defineEffectType` / `ScrubField` / `EffectChoice` (effects), `FramePresetPicker` (frame), … are
   in their module's `exports`, not in `@design/ui`/`@board/ui`. The product barrels keep exporting
   the modules' engine side (`export * from "./modules"`) as today.
3. **`strictApi` wraps only the api and its groups** (and `api.ui.kit`), not the values inside: a
   plugin can look up `api.board.STICKY_COLORS[name]` and get `undefined`, and points stay the same
   objects.
4. **Fractional indexes belong to the engine:** `keyBetween`/`nKeysBetween` in `@canvas`; only that
   file imports `fractional-indexing`.
5. **One way to open and save a file:** `openFile(pick)` replaces `pickTokenFile` and
   `importDbmlFile`; DBML export uses `exportFile`. (In the browser DBML export now downloads, like
   every other export.)
6. **The DBML and ER languages live in db and er**; `@board/ui` keeps the language-agnostic
   `SourceEditor` and the helpers to write a language.

## Review Focus

- A plugin using an old name (`api.board.palette`, `api.ui.React`, `api.design.nodes`) gets an error
  that names it (`api.board.palette isn't part of the plugin API (version 1).`), not `undefined`.
  Pinned by Task 7 step 3.
- Data lookups inside a group return `undefined` for a missing key instead of throwing
  (`api.board.STICKY_COLORS.nope`). Pinned by Task 7 step 3 (strictApi is not recursive).
- `host.require` misuse fails with both module ids in the message: outside `register`, an id not in
  `requires`/`uses`, a module without `exports`. Pinned by Task 1 step 2.
- A module's `<name>.module.ts` importing `"."`/`"./ui"` must not create a cycle: no `index.ts`
  exports its own `<name>.module`. Pinned by Task 2 step 4.
- Strings that change folder keep their Spanish: with the app in Spanish, the DBML import/export
  dialogs and the variables import dialog show the same text as before. Pinned by Task 4 step 3
  (keys moved in both files, `check-locales` passes).
- Points keep their identity through the spread (`{ ...design }` copies references), so a plugin's
  `host.contribute(api.board.boardCanvas.kinds, …)` lands on the built-in point. Pinned by Task 10's
  example plugin, which the user loads.

---

### Task 1: `exports` and `host.require`

**Files:**

- Modify: `src/shared/core/modules/modules.types.ts`, `src/shared/core/modules/module-host.ts`,
  `src/shared/core/modules/README.md`

**Interfaces:**

- Produces: `AppModule.exports?: ModuleExports`, `type ModuleExports = Readonly<Record<string, unknown>>`,
  `ModuleHost.require<T extends object = ModuleExports>(moduleId: string): T`.

- [ ] **Step 1: Types.** In `modules.types.ts` add `ModuleExports` and on `AppModule`:

```ts
/**
 * Its public API, for modules that require it (`host.require`): built-in modules hand their
 * `index.ts` and `ui/index.ts`, `{ ...frame, ...frameUi }`.
 */
readonly exports?: ModuleExports;
```

and on `ModuleHost`: `require<T extends object = ModuleExports>(moduleId: string): T;` documented as
"The `exports` of a module this one `requires` or `uses`. Only while registering."

- [ ] **Step 2: `require` in `createModuleHost`.** Keep `byId` of all given modules (before
      sorting) and the registering module (`target` already has its id; also keep the `AppModule`).
      Errors, exact text:
  - not registering: `` `host.require("${id}") can only be called while modules register.` ``
  - not declared: `` `The module "${from}" requires "${id}" without listing it in requires or uses.` ``
  - no exports: `` `The module "${id}" exports nothing, so "${from}" can't require it.` ``

  Return the target's `exports` object itself (same object every call). A target in `uses` may not
  have registered yet: `exports` is static, so that's fine.

- [ ] **Step 3: README.** In `shared/core/modules/README.md` describe `exports` and `host.require`
      (who may call it, the three errors, that built-in features still import statically).

- [ ] **Step 4: Verify.** `pnpm typecheck` passes.

### Task 2: every built-in module declares `exports`

**Files:**

- Modify: every `src/products/*/modules/*/<name>.module.ts` (41), `scripts/check-modules.mjs`,
  `docs/modules.md` (Module anatomy)

**Interfaces:**

- Consumes: `AppModule.exports` (Task 1).
- Produces: check-modules rule `exports`.

- [ ] **Step 1: Each module file** imports its own entries as namespaces and spreads them:

```ts
import * as frame from ".";
import * as frameUi from "./ui"; // only when ui/index.ts exists
…
export const frameModule = defineModule({
  id: "frame",
  tier: "core",
  requires: ["core"],
  exports: { ...frame, ...frameUi },
```

Namespace names: the module's camelCase name (`autoLayout`, `autoLayoutUi`). If that name is
already taken in the file, suffix `Api` (`frameApi`). Place `exports` after `after`/`uses`.
A file pushed over 120 lines by this gets its imports tidied, not split.

- [ ] **Step 2: Rule `exports` in `check-modules.mjs`** (header comment line too): for a built-in
      module whose `index.ts` or `ui/index.ts` has a value export (`/^export (\{|\*|const|function|class)/m`
      on lines not starting `export type`), the `.module.ts` must contain `exports:`, and must contain
      `from "."` and, when `ui/index.ts` exists, `from "./ui"`. Message: `` `${name} exports nothing; add exports: { ...${name}, ...${name}Ui } (docs/modules.md, Module anatomy)` ``.

- [ ] **Step 3: `docs/modules.md`** Module anatomy: `<name>.module.ts` sets `exports` to its
      `index.ts` + `ui/index.ts`; a plugin reaches them with `host.require(id)`.

- [ ] **Step 4: Verify.** `grep -rn "\.module\"" src/products/*/modules/*/index.ts src/products/*/modules/*/ui/index.ts`
      prints nothing (no entry exports its own module file: no cycle). `pnpm lint` and `pnpm typecheck`
      pass.

### Task 3: engine-owned fractional indexes; shader code to shader-effect

**Files:**

- Create: `src/canvas/utils/fractional-keys.ts`
- Modify: `src/canvas/utils/index.ts` (and `src/canvas/index.ts` if utils aren't re-exported whole),
  every file importing `fractional-indexing` (22: canvas, board, design, figma/figjam converters),
  `eslint.config.js`, `src/products/design/modules/effects/{effect.defaults.ts,index.ts,README.md}`,
  `src/products/design/modules/shader-effect/` (`shader-presets.ts`, the module, its reader)

**Interfaces:**

- Produces: `keyBetween(a: string | null, b: string | null): string`,
  `nKeysBetween(a: string | null, b: string | null, n: number): string[]` from `@canvas`;
  `DEFAULT_SHADER_CODE` exported by shader-effect's `index.ts`.

- [ ] **Step 1:** `fractional-keys.ts` wraps `generateKeyBetween`/`generateNKeysBetween` with the
      signatures above (doc comment: element `index` and variable `order` keys). Replace every import of
      `fractional-indexing` with these (relative inside `src/canvas`, `@canvas` elsewhere).
- [ ] **Step 2:** ESLint `no-restricted-imports`: `fractional-indexing` is forbidden everywhere but
      `src/canvas/utils/fractional-keys.ts` (message: "Use keyBetween/nKeysBetween from @canvas.").
- [ ] **Step 3:** Move `DEFAULT_SHADER_CODE` (with its doc comment; it's GLSL, so its comments stay English) to
      `shader-effect/shader-defaults.ts`, exported from shader-effect's `index.ts`;
      `EFFECT_DEFAULTS.shader` becomes `{ code: "", params: {} }`. shader-effect's effect type `create`
      returns `{ ...createEffect("shader"), code: DEFAULT_SHADER_CODE }`, and, if it registers an agent reader for `shader`, that reader fills
      `code` with `DEFAULT_SHADER_CODE` when the agent gave none. Update effects' README.
- [ ] **Step 4: Verify.** `grep -rln "fractional-indexing" src` prints only `fractional-keys.ts`;
      `grep -rn DEFAULT_SHADER_CODE src/products/design/modules/effects` prints nothing. `pnpm lint`,
      `pnpm typecheck` pass.

### Task 4: `openFile` replaces the per-feature pickers

**Files:**

- Create: `src/platform/open-file.ts`, `src/platform/open-file.types.ts`
- Delete: `src/platform/token-file.ts`, `token-file.types.ts`, `dbml-file.ts`
- Modify: `src/platform/index.ts`, `src/platform/README.md`,
  `src/products/board/modules/db/ui/db-panel/schema-editor.tsx`,
  `src/products/board/modules/colors/ui/colors-exchange-menu.tsx`,
  `src/products/design/modules/variables/ui/exchange/exchange-menu.tsx`

**Interfaces:**

- Produces: `interface OpenFilePick { title: string; filters: { name: string; extensions: string[] }[] }`,
  `openFile(pick: OpenFilePick): Promise<{ name: string; bytes: Uint8Array } | null>` (desktop only;
  in the browser warns and returns `null`, as `pickTokenFile` does).

- [ ] **Step 1:** `openFile` is `pickTokenFile` without the default. The design-tokens filter
      (`DESIGN_TOKEN_FILES`) moves to the variables exchange menu, which passes it, built with
      variables' `t`.
- [ ] **Step 2:** Schema editor: import with `openFile({ title, filters: [{ name, extensions: ["dbml"] }] })`
      and `new TextDecoder().decode(file.bytes)`; export with
      `exportFile(new Blob([schema.schemaDbml()], { type: "text/plain" }), file.name, { extension: "dbml", label })`,
      failures through `notifyError` (rule 29), not `console.error`. `title` and the filter
      `name`/`label` come from db's `t`.
- [ ] **Step 3: Move the dialog strings** out of `src/platform/locales/{en,es}.json`, Spanish text
      kept:
  - `importDbml`, `dbmlFilter` → db's locales (e.g. `schema.file.import`, `schema.file.filter`;
    group them with db's existing schema keys). `exportDbml` is deleted: `exportFile`'s dialog
    title is the generic `export`.
  - `importVariables`, `filters.designsTokens`, `filters.designs`, `filters.tokens` → variables'
    locales, under its exchange group.
  - db's and variables' error titles for a failed import/export: reuse an existing key or add one
    to both languages.
- [ ] **Step 4: Verify.** `grep -rn "pickTokenFile\|importDbmlFile\|exportDbmlFile\|TokenFilePick" src docs`
      prints nothing; `grep -n "Dbml\|dbml\|designsTokens\|importVariables" src/platform/locales/*.json`
      prints nothing. `pnpm lint` (check-locales included), `pnpm typecheck` pass.

### Task 5: the DBML and ER languages move into db and er

**Files:**

- Move (`mv`): from `src/products/board/ui/components/source-editor/`
  `languages/dbml-language.ts` and `completions/dbml-completions.ts` (+ `.types.ts`) →
  `src/products/board/modules/db/ui/source/`; `languages/er-language.ts`,
  `completions/er-completions.ts`, `completions/entity-attribute-names.ts` →
  `src/products/board/modules/er/ui/source/`
- Modify: the `source-editor` `index.ts`s, `db/ui/db-panel/dbml-editor.tsx`,
  `er/ui/er-panel/er-text-editor.tsx`, db's and er's `ui/index.ts` if others import them,
  `src/products/board/ui/README.md`, db and er READMEs

**Interfaces:**

- Produces: `@board/ui/components/source-editor` exports `SourceEditor`, `createSourceLanguage`,
  `completionResult`, `nameOptions`, `startingWith`, `definedNames`, `writtenName`,
  `readSourceContext` (+ their types): what a language is written with. db/er import them from
  there (declaring path); `COLUMN_TYPES` / `notationValues` come from their own module, so
  `board/ui` no longer imports a feature.

- [ ] **Step 1:** Move the files, fix imports (`COLUMN_TYPES` from db's own files,
      `notationValues` from er's), export the helpers above from the source-editor index.
      The completions' `label`/`detail` text is DBML/ER syntax and stays English (i18n README,
      "Not translated yet"); `SourceEditor`'s own strings (`sourceEditor.*` in board-ui's locales)
      stay in `board/ui`. If a moved file calls board-ui's `t`, its keys move to db's or er's
      locales in both languages.
- [ ] **Step 2: Verify.** `grep -rn "COLUMN_TYPES\|notationValues\|dbml\|erLanguage" src/products/board/ui`
      prints only README/docs prose, if anything. `pnpm lint`, `pnpm typecheck` pass.

### Task 6: the product UI barrels export the editor pieces

**Files:**

- Modify: `src/products/design/ui/index.ts`, `src/products/board/ui/index.ts`, both `ui/README.md`

**Interfaces:**

- Produces (value exports added):
  - `@design/ui`: `export * from "./components/panel"`, `export * from "./hooks"`,
    `useDesignEngine`, `useDesignState` (`design-engine-context`), `useImageCropStore`, and every value
    of `./modules` (`export * from "./modules"`, replacing today's partial list).
  - `@board/ui`: `useBoardEngine`, `useBoardState` (`board-engine-context`), `useBoardPanelStore`,
    `BoardColorPalette`, `DocumentColorsButton` (`components/board-colors`), `export * from
"./components/source-editor"` (Task 5), and every value of `./modules`.

- [ ] **Step 1:** Add the exports. If `tsc` reports an `export *` name clash, export that name
      explicitly from the file that owns it.
- [ ] **Step 2:** READMEs: "the barrel is the editor's public API: what modules import by path
      and plugins get as `api.design`/`api.board`".
- [ ] **Step 3: Verify.** `pnpm typecheck`, `pnpm lint` pass.

### Task 7: the barrel-shaped `api`

**Files:**

- Create: `src/app/plugins/api/plugin-ui.ts`, `src/app/plugins/api/plugin-platform.ts`,
  `src/app/plugins/api/plugin-libs.ts`, `src/app/plugins/api/index.ts`
- Rewrite: `src/app/plugins/create-plugin-api.ts`, `src/app/plugins/plugin-api.types.ts`,
  `src/app/plugins/strict-api.ts`

**Interfaces:**

- Consumes: Tasks 1, 3, 4, 6.
- Produces: the `PluginApi` shape below; the three group files (Task 8 reads their exports).

- [ ] **Step 1: Group files** (re-exports only):
  - `plugin-ui.ts`: `toast`, `notifyError` (toast-store), `runWithLoading` (loading-store),
    `usePaletteFavoritesStore`, `CodeEditor`, the brand seals (`CelebratingSeal`, `HoppingSeal`,
    `PaintingSeal`, `PattingSeal`), and `export * as kit from "@shared/ui/kit"`.
  - `plugin-platform.ts`: `exportFile`, `openFile`, `pickImageFiles`, `readLocalFile`, `http`,
    `openExternal`, `clipboard`, `fontLibrary` from `@platform`.
  - `plugin-libs.ts`: `export * as React from "react"`, `createPortal` (react-dom),
    `export * as icons from "lucide-react"`, `create as createStore` (zustand), `persist`
    (zustand/middleware), `StreamLanguage` (@codemirror/language).
  - Translations need nothing new: `api.core` is all of `@shared/core`, so `defineMessages`,
    `getLocale` and `tCommon` keep their names (`api.core.defineMessages`, as `docs/plugins.md`
    already shows). The api's own errors (`strictApi`, `host.require`) are developer messages and
    stay English.
- [ ] **Step 2: `PluginApi`** in `plugin-api.types.ts`, with `import type * as X`:

```ts
export interface PluginApi {
  apiVersion: number;
  plugin: PluginInfo; // unchanged
  core: typeof sharedCore; // @shared/core
  canvas: typeof canvas; // @canvas
  canvasUi: typeof canvasUi; // @canvas-ui
  ui: typeof pluginUi; // ./api/plugin-ui
  platform: typeof pluginPlatform;
  libs: typeof pluginLibs;
  board: typeof board & typeof boardUi; // @board + @board/ui
  design: typeof design & typeof designUi; // @design + @design/ui
  stickers: PluginStickersApi; // unchanged
  themes: PluginThemesApi; // unchanged
}
```

Remove every hand-written group type the old shape had.

- [ ] **Step 3: `strictApi(value, path)` is not recursive:** it wraps exactly the object it gets
      (same error text as today). `createPluginApi` builds each group as a plain spread
      (`{ ...canvas }`, `{ ...board, ...boardUi }`, `ui` with `kit: strictApi({ ...kit }, "api.ui.kit")`)
      and wraps the root and each group. Drop `isPlainObject`.
- [ ] **Step 4:** `createPluginApi` has no name lists left: only `plugin`, the spreads,
      `stickers`, `themes`. Delete the 5b `defineMode`/`registerMode` aliases.
- [ ] **Step 5: Verify.** `pnpm typecheck`, `pnpm lint` pass;
      `grep -c "," src/app/plugins/create-plugin-api.ts` is a small number (no name lists).

### Task 8: the `public` check

**Files:**

- Create: `scripts/check-public-api.mjs`
- Modify: `package.json` (`lint`, new `check:public-api`), `docs/modules.md` (Enforcement),
  spec §11

**Interfaces:**

- Consumes: the barrels, `src/app/plugins/api/*.ts` (Task 7), modules' `index.ts`/`ui/index.ts`.

- [ ] **Step 1: The script** builds a TypeScript program from `tsconfig.json` (the `typescript`
      package) and, for every **feature** module (tier read with `readModules` from
      `scripts/module-info.mjs`), each value import (skip `import type` and inline `type`, and names
      whose symbol isn't a value) from outside the module's folder, resolves the target file and
      requires the name to be in:

  | Target file                                | Allowed names                                         |
  | ------------------------------------------ | ----------------------------------------------------- |
  | `src/canvas/**`                            | `src/canvas/index.ts` exports                         |
  | `src/canvas-ui/**`                         | `src/canvas-ui/index.ts`                              |
  | `src/shared/core/**`                       | `src/shared/core/index.ts`                            |
  | `src/shared/ui/kit/**`                     | `src/shared/ui/kit/index.ts`                          |
  | another module's files                     | that module's `index.ts` / `ui/index.ts`              |
  | `src/products/<p>/ui/**`                   | `src/products/<p>/ui/index.ts`                        |
  | `src/products/<p>/**` (not modules, ui)    | `src/products/<p>/index.ts`                           |
  | `src/shared/**`, `src/platform/**` (other) | `app/plugins/api/plugin-ui.ts` + `plugin-platform.ts` |
  | npm packages                               | not checked (libs or bundled by the feature)          |

  One line per miss, the check-modules format:
  `` `${file}:${line}  public: ${name} from "${spec}" isn't in ${barrel}; export it there (rule 18)` ``,
  exit 1. The header comment says what it checks and why (rule 18, spec §14.5).

- [ ] **Step 2:** `package.json`: `"lint": "eslint . && node scripts/check-modules.mjs && node scripts/check-locales.mjs && node scripts/check-public-api.mjs"`,
      `"check:public-api": "node scripts/check-public-api.mjs"`.
- [ ] **Step 3: Prove it fails.** Temporarily remove `useSelectedNodes` from `@design/ui`'s exports:
      `pnpm check:public-api` prints the boolean/image/mask lines and exits 1. Restore it.
- [ ] **Step 4: Verify.** `pnpm lint` passes (prints nothing from the script).

### Task 9: docs, spec, CLAUDE.md, memory

**Files:**

- Rewrite: `docs/plugins.md` ("The API" and every example in it)
- Modify: `src/app/plugins/README.md`, `docs/modules.md` (Plugin column, Modes import table),
  spec (§12 phase 6 done 2026-10-27, §14 "Done in 6" note with the rulings above, §15.3 table),
  `CLAUDE.md` (Transition: remove the phase 6 row, the table and the "Until phase 6" bullet; if the
  Transition section is empty, remove it), memory `module-conventions.md` + `MEMORY.md` ("1-6 done;
  7 next")

- [ ] **Step 1: `docs/plugins.md` "The API"** becomes the group table (`core`, `canvas`,
      `canvasUi`, `ui`, `platform`, `libs`, `board`, `design`, `stickers`, `themes`, `plugin`) saying
      each is a barrel, plus a "Using another module" section (`requires` + `host.require`, the three
      errors) and a short "Moved in v1" table: old name → new name for every name the old shape had
      under a different path (`board.canvas` → `board.boardCanvas`, `board.palette.X` → `board.X`,
      `ui.React` → `libs.React`, `ui.useEngine` → `canvasUi.useEngine`, `design.nodes.X` / `network.X` /
      `panel.X` / `hooks.X` / `sections.X` → `design.X`, `design.effects.*` → `host.require("effects")`,
      `board.library` → `host.require("library").boardLibrary`, `*.defineMode` → `defineDesignMode` /
      `defineBoardMode`). Every code sample in the doc uses the new names, and the translations
      section (`locales/`, `api.core.defineMessages`, `api.plugin.readText`) points at the
      callout as its working example (Task 10).
- [ ] **Step 2:** The rest as listed under Files. The app/plugins README describes the group files
      and the non-recursive `strictApi`.
- [ ] **Step 3: Verify.** `grep -rn "api\.ui\.React\|board\.palette\|api\.design\.nodes\|defineMode\b" docs src examples`
      prints nothing outside the "Moved in v1" table. `pnpm format:check` passes.

### Task 10: the example plugins

**Files:**

- Modify: `examples/plugins/callout/main.js` (and `theme-nord/main.js` only if it uses a moved name:
  it uses `api.themes.register`, which stays)
- Create: `examples/plugins/callout/locales/en.json`, `examples/plugins/callout/locales/es.json`

- [ ] **Step 1:** Rewrite every `api` access to the new names (`board.boardCanvas.kinds`,
      `board.boardEditor.toolPanels`, `board.boardMcpTools`, `board.INK_COLOR`, `libs.React`,
      `canvasUi.FloatingPanel`/`useEngine`/`useEngineState`, `ui.kit…`); `ColorSwatch` from
      `canvasUi`. Keep it plain JS with no imports.
- [ ] **Step 2: Translate it** the way `docs/plugins.md` says: `activate` reads
      `locales/en.json` and `locales/es.json` with `api.plugin.readText` and builds
      `const t = api.core.defineMessages({ en, es })`. Every user-facing string goes through `t`,
      grouped (`kind.label`, `kind.description`, `colors.ice`, …, the options panel's text);
      generic words through `api.core.tCommon`. The MCP tool's name, description and argument text
      stay English (rule 30). Both files have the same keys and placeholders (`check-locales` doesn't
      see `examples/`, so compare them by hand).
- [ ] **Step 3:** If the callout has a natural use for another module (e.g. its library card via
      `host.require("library")`), use `host.require` once and declare it in `requires`, so the example
      shows it; otherwise leave `requires` as is.
- [ ] **Step 4: Verify.** `grep -noE "\b(board|canvas|canvasUi|ui|libs|core)\.[A-Za-z_]+" examples/plugins/callout/main.js`
      lists only names that exist in the matching barrel (check each against the barrel's exports).
      `pnpm format:check` passes. The user loads it in the app, in English and in Spanish, to
      confirm (Review Focus, last line).

---

**Commit message (for the user, after review):**

```
refactor: the plugin API is the barrels

- modules declare exports (their index.ts + ui/index.ts); host.require(id) hands a
  required module's exports to plugins
- api groups are the barrels (core, canvas, canvasUi, board + board/ui, design +
  design/ui) plus curated ui, platform and libs; strictApi wraps only the groups
- @design/ui and @board/ui export the editor pieces features use; keyBetween/
  nKeysBetween in @canvas; openFile replaces the token and DBML pickers
- the shader default, DBML and ER languages move into their features
- check-public-api: a feature can't import what a plugin couldn't reach
- the callout example on the new names, translated (en, es)
- docs/plugins.md, spec and CLAUDE.md updated; still API v1

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>
```
