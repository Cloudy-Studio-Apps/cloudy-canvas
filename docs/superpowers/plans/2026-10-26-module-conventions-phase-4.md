# Module conventions, phase 4: split the big module files — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan
> task-by-task (inline, as the user chose). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every `<name>.module.ts` is wiring only and about 100 lines or less. The three over that
size (design `core` 380, board `er` 158, design `styleguide` 155) are split into suffix files that
each export a `register…(host)` function, which the module file calls.

**Architecture:** Pure moves. Every `host.contribute(…)` keeps its arguments and its order inside
its point (contribution order is load order, and a few points depend on it). Engine-only parts go
in engine files (`.canvas.ts`, `.commands.ts`), which ESLint keeps free of React; parts that hold
components go in `.sections.ts`, `.menu.ts`, `.mode.ts`, which ESLint lets import UI, like
`.module.ts`.

**Tech Stack:** TypeScript (strict), the module API (`ModuleHost` from `@shared/core`), ESLint flat
config.

**Spec:** `docs/superpowers/specs/2026-10-25-module-conventions-design.md` (§4 anatomy and
suffixes, §7.4, §7.5, §12 phase 4).

## Global Constraints

- The user handles all git: no commits, no branches. Move files with `mv`, never `git mv`.
- No legacy code or aliases: old paths and names are removed, not re-exported.
- Verification is only `pnpm lint`, `pnpm typecheck`, `pnpm format:check` (run from the repo root).
  No builds, cargo or browser checks.
- Every `interface`/`type` goes in a sibling `<file>.types.ts`.
- Rule 1: update the README of every folder whose layout changes, in the same task.
- Behavior must not change: same contributions, same arguments, same relative order inside each
  point.

## Decisions this plan makes

1. **The split files' shape.** Each exports `export function register<Module><Part>(host:
ModuleHost): void` (e.g. `registerCoreCanvas`), holding `host.contribute` calls moved verbatim
   from the module file, with the comments that sit on them. The module file calls them inside
   `register(host)`, in the order the moved code had.
2. **Suffixes.** From the spec: `.canvas.ts` (canvas hooks: kinds, tools, tree/scene hooks, copies;
   engine), `.commands.ts` (host commands and keys; engine), `.sections.ts` (editor entries:
   property sections, panels, overlays, session hooks, toolbar buttons, context menu; imports UI),
   `.menu.ts` (main menu groups; imports UI), `.mode.ts` (a mode's contributions; imports UI; phase
   5b turns it into one `defineDesignMode`/`defineBoardMode`). `docs/modules.md` gets `.canvas.ts`
   and `.menu.ts` and the wider `.sections.ts` wording.
3. **No `.migration.ts` for a single line.** `host.contribute(<migrations>, { id, migrate })` stays in
   the module file when the migration itself already lives elsewhere (`model/`). The spec's
   `er.migration.ts` is dropped.
4. **Constants an engine file needs move out of `ui/`.** `CREATE_TABLES_COMMAND` and
   `CONVERT_TO_ENTITY_COMMAND` (now in `er/ui/…`) move to `er/er.commands.ts`; the `ui/` files import
   them from there (UI may import engine, not the reverse).
5. **Style type entries become data, as effects' are.** Core's color and stroke style entries move to
   `core/ui/styles/core-style-types.ts` as `CORE_STYLE_TYPES: readonly StyleTypeEntry[]` (like
   `EFFECT_CATALOG`); the module contributes `...CORE_STYLE_TYPES`.
6. **`styleguide-points.ts` → `styleguide.points.ts`** (the suffix rule; no other module has a
   `-points.ts` extension point file; `constraint-points.ts`/`shape-points.ts` are geometry).
7. Modules under ~100 lines (variables 95, catalog 95, board core 81, …) aren't touched.

## Review Focus

1. Order inside a point: `designCanvas.afterEdit`, `selectTarget`, `withMembers`, `onRemove`,
   `prepareCopies`, `resolveElements` chain in contribution order. A split must not move a call
   from before another module's to after it; within a module, keep the relative order of calls on
   the same point.
2. Closures over `host`: `selectTarget` reads `host.get(designSelectRedirects)`, the styleguide's
   `sources` cache `options` once, `erStandards.useSource(() => host.get(…))`. They must still read
   the same host (the one passed to `register…`), and the styleguide's `options` cache must stay one
   variable per registration.
3. Engine files must not import React or `ui/` (ESLint enforces it; a failure means a piece is in
   the wrong file, not that the rule needs an exception).
4. Main menu `order` values (10, 20, 30, 36, 40, 41, 42, 42.5, 90) and context menu ids keep their
   values; the menu's look depends on them.
5. The modules' public entries (`index.ts`, `ui/index.ts`) don't start exporting the register
   functions: they're private to the module.

---

### Task 1: ESLint and docs accept the new suffixes

**Files:**

- Modify: `eslint.config.js` (`PRODUCT_UI`), `docs/modules.md` (anatomy, suffix table)

- [ ] **Step 1:** In `PRODUCT_UI`, replace `"src/products/*/modules/*/*.module.ts"` with
      `"src/products/*/modules/*/*.{module,sections,menu,mode}.ts"`, and update the comment above it
      ("its `ui/` and the files that plug it into the UI: `.module.ts`, `.sections.ts`,
      `.menu.ts`, `.mode.ts`").
- [ ] **Step 2:** `docs/modules.md`: add to the anatomy `<name>.canvas.ts  canvas hooks (kinds,
tools, scene and tree hooks, copies), when there are several` and `<name>.menu.ts  main menu
groups, when there are many`; the suffix table gets `.canvas.ts` (canvas hooks, no React) and
      `.menu.ts` (main menu groups, imports UI); `.sections.ts` becomes "editor entries (sections,
      panels, overlays, session hooks, toolbar buttons, context menu)". Add one line under the
      table: "Each split file exports `register<Module><Part>(host)`; `<name>.module.ts` calls them."
- [ ] **Step 3: Verify**

  Run: `pnpm lint`
  Expected: passes (no file uses the new globs yet).

### Task 2: Split design `core.module.ts`

**Files:**

- Create, under `src/products/design/modules/core/`: `core.canvas.ts`, `core.commands.ts`,
  `core.sections.ts`, `core.menu.ts`, `ui/styles/core-style-types.ts`
- Modify: `core.module.ts`, `ui/styles/index.ts`, the design README's core part
  (`src/products/design/README.md`, core has no README until phase 5)

**Interfaces:**

- Produces: `registerCoreCanvas(host: ModuleHost): void`, `registerCoreCommands(host)`,
  `registerCoreSections(host)`, `registerCoreMenu(host)`; `CORE_STYLE_TYPES: readonly
StyleTypeEntry[]` exported from `ui/styles/index.ts`.

| File                            | Takes from `core.module.ts` (current lines)                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `core.canvas.ts`                | `designCanvas.view` … `designCanvas.frames` (102–123) and `designCanvas.prepareCopies` (139)                                                |
| `core.commands.ts`              | `designCanvas.hostCommands` (124–138), `designCanvas.keybindings` (140)                                                                     |
| `core.sections.ts`              | `designEditor.tools` (153–176), `propertySections` (178–211), `toolSidebars`, `overlays`, `sessionHooks` (246–258), `contextMenu` (268–273) |
| `core.menu.ts`                  | `TRANSFORM_ITEMS` (85–91) and `designEditor.mainMenu` (274–378); exports `TRANSFORM_ITEMS` for `core.sections.ts`                           |
| `ui/styles/core-style-types.ts` | the two `designStyleTypes` entries (214–244) as `CORE_STYLE_TYPES`                                                                          |
| stays in `core.module.ts`       | `designMcpTools` (142–151), `designStyleTypes, ...CORE_STYLE_TYPES`, the default `designEditor.modes` entry (259–267, phase 5b moves it)    |

- [ ] **Step 1:** Write the five files, moving code and imports verbatim. `core.canvas.ts` keeps
      the comment "Read when a click happens: every module has contributed by then." on
      `selectTarget`.
- [ ] **Step 2:** `core.module.ts`'s `register(host)` becomes, in this order:
      `registerCoreCanvas(host)`, `registerCoreCommands(host)`, the `designMcpTools` call,
      `registerCoreSections(host)`, `host.contribute(designStyleTypes, ...CORE_STYLE_TYPES)`, the
      modes entry, `registerCoreMenu(host)`. Order check: within each point the calls keep their
      old relative order (`prepareCopies` was after `hostCommands` but is the only call on its
      point, so moving it into the canvas file is safe). Remove the now-unused imports.
- [ ] **Step 3:** README: the design README's core paragraph lists the split files in one sentence.
- [ ] **Step 4: Verify**

  Run: `wc -l src/products/design/modules/core/core.module.ts`
  Expected: 100 or less.

  Run: `pnpm typecheck && pnpm lint`
  Expected: both pass (lint proves `core.canvas.ts`/`core.commands.ts` import no React or UI).

### Task 3: Split board `er.module.ts`

**Files:**

- Create, under `src/products/board/modules/er/`: `er.canvas.ts`, `er.commands.ts`, `er.mode.ts`,
  `er.sections.ts`
- Modify: `er.module.ts`, `ui/er-to-tables/use-create-tables-command.ts`,
  `ui/er-to-tables/index.ts`, `ui/er-convert/use-convert-command.ts`, `ui/er-convert/index.ts`,
  `er/README.md`

**Interfaces:**

- Produces: `registerErCanvas(host: ModuleHost): void`, `registerErCommands(host)`,
  `registerErMode(host)`, `registerErSections(host)`; `CREATE_TABLES_COMMAND = "er.createTables"`
  and `CONVERT_TO_ENTITY_COMMAND = "er.convertToEntity"` exported from `er.commands.ts`.

| File                    | Takes from `er.module.ts` (current lines)                                                                                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `er.canvas.ts`          | `boardCanvas.kinds` (57–66), `tools` (67–71), `links`, `resolveElements`, `withMembers`, `onRemove`, `prepareCopies` (117–131), with their comments                                                                              |
| `er.commands.ts`        | the two command constants, `hostCommands` for create tables / convert (84–88)                                                                                                                                                    |
| `er.mode.ts`            | `boardCanvas.modes` (74), the mode's `hostCommands` (76–79), `editElement` (116), session hook `er.modeCommands` (80), overlays `er.checkBadges` (82) and `er.palette` (144), `boardEditor.modes` (145–152), with their comments |
| `er.sections.ts`        | session hooks `er.convert`, `er.createTables`, overlays `er.toTables`, `er.quickAdd`, `er.relationPrompt`, `contextMenu` (95–115), `boardEditor.tools` (135–141), `sidePanels` (142)                                             |
| stays in `er.module.ts` | standards and constructs (52–56), `boardMigrations` (132), `boardMcpTools` (133)                                                                                                                                                 |

- [ ] **Step 1:** Move the two constants into `er.commands.ts`; the two `use-…-command.ts` files
      import them from `../../er.commands`; the two `ui/…/index.ts` stop exporting them.
- [ ] **Step 2:** Write the four files, moving code, comments and imports verbatim.
- [ ] **Step 3:** `er.module.ts`'s `register(host)`, in this order: standards and constructs,
      `registerErCanvas(host)`, `registerErMode(host)`, `registerErCommands(host)`,
      `registerErSections(host)`, migrations, MCP tools. Order check: `boardCanvas.hostCommands`
      gets the mode's commands before create tables / convert, as now; `boardEditor.overlays`
      gets `er.checkBadges`, `er.palette` (mode) before `er.toTables`, `er.quickAdd`,
      `er.relationPrompt` (sections): today `er.palette` came after `er.toTables`; overlays draw in
      contribution order, so check `er.palette` and `er.toTables` don't overlap (the dialog is
      modal; the palette is a floating strip) and record the ruling.
- [ ] **Step 4:** er README: one sentence naming the split files.
- [ ] **Step 5: Verify**

  Run: `wc -l src/products/board/modules/er/er.module.ts`
  Expected: 100 or less.

  Run: `grep -rn "CREATE_TABLES_COMMAND\|CONVERT_TO_ENTITY_COMMAND" src | grep -v er.commands.ts`
  Expected: only `er.sections.ts` and the two `use-…-command.ts` files.

  Run: `pnpm typecheck && pnpm lint`
  Expected: both pass.

### Task 4: Split `styleguide.module.ts`, rename its points file

**Files:**

- Move: `src/products/design/modules/styleguide/styleguide-points.ts` → `styleguide.points.ts`
- Create, under `styleguide/`: `styleguide.canvas.ts`, `styleguide.commands.ts`,
  `styleguide.mode.ts`, `styleguide.sections.ts`
- Modify: `styleguide.module.ts`, `styleguide/index.ts`, every importer of `styleguide-points`,
  `styleguide/README.md`

**Interfaces:**

- Produces: `registerStyleguideCanvas(host: ModuleHost): void`, `registerStyleguideCommands(host)`,
  `registerStyleguideMode(host)`, `registerStyleguideSections(host)`.

| File                            | Takes from `styleguide.module.ts` (current lines)                                                                                                                                                               |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `styleguide.canvas.ts`          | `designSelectRedirects`, `prepareCopies` (43–46), the `options`/`sources` closure and `afterEdit` (48–59), the token sheet `designCanvas.tools` (112–126)                                                       |
| `styleguide.commands.ts`        | `designCanvas.hostCommands` (94–100)                                                                                                                                                                            |
| `styleguide.mode.ts`            | `designCanvas.modes`, the styleguide `designCanvas.tools` (70–75), `designEditor.modes` (76–82), scope and selection session hooks, `styleguide.empty` overlay (83–91), `leftTabs` and `modeSidebars` (134–145) |
| `styleguide.sections.ts`        | the commands session hook (101–104), `mainMenu` (105–109), `contextMenu` (110), the token sheet `designEditor.tools` (127–133), `propertySections` (146–153)                                                    |
| stays in `styleguide.module.ts` | categories and templates (41–42), `designMcpTools` (61–68)                                                                                                                                                      |

- [ ] **Step 1:** `mv` the points file; repoint its importers (`grep -rln "styleguide-points" src`).
- [ ] **Step 2:** Write the four files, moving code, comments and imports verbatim.
- [ ] **Step 3:** `register(host)`, in this order: categories and templates,
      `registerStyleguideCanvas(host)`, the MCP tools, `registerStyleguideMode(host)`,
      `registerStyleguideCommands(host)`, `registerStyleguideSections(host)`. Order check:
      `designCanvas.tools` gets the token sheet tool before the styleguide tool (it was after);
      tools are looked up by id, so the order doesn't matter there; record the ruling.
      `designEditor.sessionHooks` keeps scope, selection, then commands.
- [ ] **Step 4:** styleguide README: the points file's new name, and the split files in one
      sentence.
- [ ] **Step 5: Verify**

  Run: `wc -l src/products/design/modules/styleguide/styleguide.module.ts; grep -rn "styleguide-points" src`
  Expected: 100 or less; no grep output.

  Run: `pnpm typecheck && pnpm lint`
  Expected: both pass.

### Task 5: Spec, Transition table, final check

**Files:**

- Modify: `docs/superpowers/specs/2026-10-25-module-conventions-design.md`, `CLAUDE.md`, memory
  `module-conventions.md` and `MEMORY.md`

- [ ] **Step 1: Spec.** §4 suffix table: add `.canvas.ts`, `.menu.ts`, widen `.sections.ts` (as in
      Task 1). §7.4: the ER split as built (`er.canvas.ts`, `er.commands.ts`, `er.mode.ts`,
      `er.sections.ts`; no `er.migration.ts`, Decision 3). §7.5: as built (`core.canvas.ts`,
      `core.commands.ts`, `core.sections.ts`, `core.menu.ts`, `CORE_STYLE_TYPES`). §12 phase 4:
      done, and styleguide was split too.
- [ ] **Step 2: `CLAUDE.md`.** Remove the Transition row "`<name>.module.ts` ≤ ~100 lines, wiring
      only".
- [ ] **Step 3: Verify**

  Run: `pnpm lint && pnpm typecheck && pnpm format:check`
  Expected: all pass (run `pnpm format` on the changed files first if format:check fails).

- [ ] **Step 4:** Self-review the diff against Review Focus; update memory (phases 1–4 done); give
      the user the commit message:

  ```
  refactor: module files are wiring only

  - design core, er and styleguide split into .canvas.ts, .commands.ts,
    .sections.ts, .menu.ts and .mode.ts files with register…(host) functions
  - ER command ids move out of ui/ into er.commands.ts; core's style types
    become CORE_STYLE_TYPES; styleguide-points.ts → styleguide.points.ts
  - ESLint lets .sections/.menu/.mode files import UI; docs and Transition updated

  Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>
  ```
