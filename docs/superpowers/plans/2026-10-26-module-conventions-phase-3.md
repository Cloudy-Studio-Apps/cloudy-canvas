# Module conventions, phase 3: ownership moves — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan
> task-by-task (inline, as the user chose). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Each point lives in the module that reads it: ER points in `er`, the effect types point in
`effects`, the style types point and the styles UI in `core`, and a `layersTabSections` point that
ends the `pages ↔ layers` cycle.

**Architecture:** Pure moves plus one new point. Engine points sit at a module's root
(`<name>.points.ts`); points whose entries hold React components sit in `ui/<name>.points.ts`, with
their types in a sibling `.points.types.ts`. Other modules reach them through `../<module>/ui`
(a new `ui/index.ts` where the module has none). Agents see the same MCP tools; users see the same
editor.

**Tech Stack:** TypeScript (strict), React 19, the module API in `src/shared/core/modules`.

**Spec:** `docs/superpowers/specs/2026-10-25-module-conventions-design.md` (§7.2, §7.4, §7.6, §8 #1,
#6, #8, #9, §12 phase 3).

## Global Constraints

- The user handles all git: no commits, no branches. Move files with `mv`, never `git mv`.
- No legacy code or aliases: old paths and names are removed, not re-exported.
- The plugin API stays v1 (`PLUGIN_API_VERSION` 1) and changes freely.
- Verification is only `pnpm lint`, `pnpm typecheck`, `pnpm format:check` (run from the repo root).
  No builds, cargo or browser checks.
- Every `interface`/`type` goes in a sibling `<file>.types.ts`, imported with `import type`.
- Rule 1: update the README of every folder whose behavior or layout changes, in the same task.
- Point ids may change (nothing outside the app references them); exported names change only where
  this plan says so.

## Decisions this plan makes against the spec

1. **The styles UI and the style types point go to `core`, not `variables` (§7.2 changes).** Core's
   Fills and Strokes sections (`core/ui/sections/paint-list-section.tsx`, `stroke/stroke-section.tsx`)
   use `StyleControl`, `StyleChip`, `useNodeStyleBinding` and `createNodeStyle`; `variables` requires
   `core`, so moving the UI into variables makes core import variables, a `requires` cycle. The
   point's readers (`useStyleType` in `StyleChip`/`StyleList`/`StyleRow`/`StylePreview`) are those
   controls, so by rule 19 the point is core's. Core keeps registering its paint and stroke style
   types: it owns that data, and the registration is already a `host.contribute`, as text's and
   effects' are. Variables' Styles section reads the point through `../core/ui`.
2. **Points holding React go in `ui/<name>.points.ts`.** ESLint forbids React and `@design/ui/*` in a
   module's engine files, and `StyleTypeEntry`/`EffectTypeEntry`/the layers section entry hold
   components. Engine-only points (ER) stay at the root.
3. **`layers` requires `core` only; `pages` requires `core` and `layers`.** After the point, layers
   no longer imports pages, and pages imports `LayerName` from layers. In `design-modules.ts`,
   `layersModule` moves to just before `pagesModule`, so no other module's load order changes.
4. **Names:** the ER points keep `boardErStandards`/`boardErConstructs` (the er module already has
   `erStandards`/`erConstructs` registries). The effect types point becomes `designEffectTypes`
   (core's `effectTypes()` function already uses the short name). New: `layersTabSections`.

## Review Focus

1. Plugins: `api.design.editor.effectTypes` is gone; `api.design.effects.effectTypes` must be the
   same point the Effects section reads, or plugin effects vanish from the "+" menu.
2. The Layers tab must still show the Pages list under the tree, in the same place.
3. Module load order: only `layers` moves (before `pages`); catalog, variables, styleguide must
   load in the same relative order as before.
4. Barrel cycles: `modules/core/ui/index.ts` is imported by text, effects and variables UI; core's own
   files must import its files directly, never `"."`/`"../index"`.
5. Board files: `boardErStandards`/`boardErConstructs` must still reach `@board` (the plugin API and
   `api.board.erStandards` use them) through `modules/er/index.ts`.

---

### Task 1: ER points move to the er module

**Files:**

- Create: `src/products/board/modules/er/er.points.ts`
- Modify: `src/products/board/board-points.ts`, `src/products/board/index.ts`,
  `src/products/board/modules/er/index.ts`, `src/products/board/modules/er/er.module.ts`,
  `src/products/board/README.md` (if it lists the board's points), `src/products/board/modules/er/README.md`

**Interfaces:**

- Produces: `boardErStandards: ExtensionPoint<ErStandardDefinition>` (id `"board.erStandards"`) and
  `boardErConstructs: ExtensionPoint<ErConstructDefinition>` (id `"board.erConstructs"`), exported
  from `modules/er/index.ts` and so from `@board`.

- [ ] **Step 1:** Create `er.points.ts` with the two `definePoint` calls and their doc comments cut
      from `board-points.ts`, importing the types from `./base/constructs` and `./base/standards`.
- [ ] **Step 2:** Remove them and their type imports from `board-points.ts`; remove the two names
      from `board-points`' export list in `products/board/index.ts`; add
      `export { boardErConstructs, boardErStandards } from "./er.points";` to `modules/er/index.ts`;
      `er.module.ts` imports them from `./er.points`.
- [ ] **Step 3:** Update the READMEs: the er README says it owns the two points (`er.points.ts`); the
      board README (if it lists `board-points.ts`) lists only canvas, mcpTools, migrations.
- [ ] **Step 4: Verify**

  Run: `grep -rn "boardEr" src --include=*.ts | grep -v modules/er/`
  Expected: only `src/app/plugins/create-plugin-api.ts` and `plugin-api.types.ts` (via `@board`).

  Run: `pnpm typecheck && pnpm lint`
  Expected: both pass.

### Task 2: The effect types point moves to the effects module

**Files:**

- Create: `src/products/design/modules/effects/ui/effects.points.ts`,
  `src/products/design/modules/effects/ui/effects.points.types.ts`
- Move: `src/products/design/ui/modules/define-effect-type.ts` →
  `src/products/design/modules/effects/ui/define-effect-type.ts`
- Modify: `src/products/design/ui/modules/design-editor-points.ts`,
  `design-editor-points.types.ts`, `ui/modules/index.ts`, `modules/effects/ui/index.ts`, every
  importer found in Step 4, `src/app/plugins/create-plugin-api.ts`,
  `src/app/plugins/plugin-api.types.ts`, `modules/effects/README.md`, `src/app/plugins/README.md`
  and `docs/plugins.md` (if either names `editor.effectTypes`)

**Interfaces:**

- Produces (from `modules/effects/ui/index.ts`): `designEffectTypes: ExtensionPoint<EffectTypeEntry>`
  (id `"design.effectTypes"`, `keyOf: (entry) => entry.type`); `defineEffectType<E>(entry:
TypedEffectTypeEntry<E>): EffectTypeEntry` (body unchanged); types `EffectTypeEntry`,
  `TypedEffectTypeEntry`, `EffectEditorProps`.
- Plugin API: `api.design.effects.effectTypes` (the point) and `api.design.effects.defineEffectType`;
  `api.design.editor` no longer has `effectTypes`.

- [ ] **Step 1:** Move `EffectEditorProps`, `EffectTypeEntry` and `TypedEffectTypeEntry` (with their
      doc comments) from `design-editor-points.types.ts` to `effects.points.types.ts`; remove
      `effectTypes` from `DesignEditorPoints` and from `designEditor`.
- [ ] **Step 2:** Write `effects.points.ts` (`designEffectTypes`); `mv` `define-effect-type.ts` and
      point its type import at `./effects.points.types`.
- [ ] **Step 3:** Remove `defineEffectType` from `ui/modules/index.ts`; add to
      `modules/effects/ui/index.ts`: `export type * from "./effects.points.types";`,
      `export { designEffectTypes } from "./effects.points";`,
      `export { defineEffectType } from "./define-effect-type";`.
- [ ] **Step 4:** Repoint every importer.

  Run: `grep -rln "effectTypes\|EffectTypeEntry\|EffectEditorProps\|defineEffectType" src`
  Inside `modules/effects`, import the files directly (`./effects.points`, `../effects.points.types`,
  …), never `"."`/`"../index"`; `designEditor.effectTypes` becomes `designEffectTypes`.
  `shader-effect.module.ts` imports from `../effects/ui`. Leave core's `effectTypes()` function alone.

- [ ] **Step 5:** Plugin API. `create-plugin-api.ts`: drop `defineEffectType` from the
      `@design/ui/modules` import, import `defineEffectType, designEffectTypes` from
      `@design/modules/effects/ui`, add `effectTypes: designEffectTypes` to `design.effects`.
      `plugin-api.types.ts`: `import type * as effectsUi from "@design/modules/effects/ui";` and
      `effects: { effectTypes: typeof effectsUi.designEffectTypes } & Pick<typeof effectsUi,
"defineEffectType"> & …`; its comment says "an entry on `effects.effectTypes`".
- [ ] **Step 6:** Update the effects README (it owns `designEffectTypes` in `ui/effects.points.ts`,
      plugins add types with `api.design.effects`), and any plugins doc naming `editor.effectTypes`.
- [ ] **Step 7: Verify**

  Run: `grep -rn "editor\.effectTypes\|ui/modules/define-effect-type\|design\.editor\.effectTypes" src docs examples`
  Expected: no output.

  Run: `pnpm typecheck && pnpm lint`
  Expected: both pass.

### Task 3: The style types point and the styles UI move to core

**Files:**

- Move: the 15 files of `src/products/design/ui/components/styles/` except `index.ts` →
  `src/products/design/modules/core/ui/styles/` (no name clashes; merge the two `index.ts`)
- Move: `ui/modules/style-types.types.ts` → `modules/core/ui/core.points.types.ts`
- Create: `modules/core/ui/core.points.ts` (from `ui/modules/style-types.ts`),
  `modules/core/ui/index.ts`
- Delete: `ui/modules/style-types.ts`, `ui/components/styles/` (now empty)
- Modify: `ui/modules/index.ts`, the importers in the table below,
  `modules/variables/README.md`, the core README (if `modules/core/README.md` exists, else
  `src/products/design/README.md`'s core part), any README listing `ui/components/styles`

**Interfaces:**

- Produces (from `modules/core/ui/index.ts`): `designStyleTypes: ExtensionPoint<StyleTypeEntry>`
  (id `"design.styleTypes"`, unchanged); types `StyleTypeEntry`, `StylePreviewProps`,
  `StyleEditorProps`; everything the old `ui/components/styles/index.ts` exported (`StyleChip`,
  `StyleControl`, `StyleList`, `StyleRow`, `StylePreview`, `StyleEditorPopover`, `StyleEditorFrame`,
  `StyleBindingScope`, `DeleteTokensDialog`, `useNodeStyleBinding`, `useStyleType`, `useStyleWriter`,
  `createNodeStyle`, `shownStyle`, and `styles.types`); plus core's style editors
  (`PaintStyleEditor`, …) already in `core/ui/styles/index.ts`.
- `modules/core/ui/index.ts` is exactly: `export * from "./styles";`,
  `export type * from "./core.points.types";`, `export { designStyleTypes } from "./core.points";`.

- [ ] **Step 1:** `mv` the files; merge the old styles `index.ts` exports (and its header comment)
      into `core/ui/styles/index.ts`. Fix the moved files' own imports: `../token-usage` →
      `@design/ui/components/token-usage`; `@design/ui/modules/style-types(.types)` →
      `../core.points` / `../core.points.types`.
- [ ] **Step 2:** Create `core.points.ts`, `core.points.types.ts` and `core/ui/index.ts`; remove the
      two style-types lines from `ui/modules/index.ts`; delete `ui/modules/style-types.ts`.
- [ ] **Step 3:** Repoint importers of `@design/ui/components/styles` and
      `@design/ui/modules/style-types(.types)`:

  | Importer (under `src/products/design/modules/`)                              | New specifier                                                      |
  | ---------------------------------------------------------------------------- | ------------------------------------------------------------------ |
  | `core/core.module.ts`                                                        | `./ui/styles` and `./ui/core.points`                               |
  | `core/ui/sections/paint-list-section.tsx`                                    | `../styles`                                                        |
  | `core/ui/sections/stroke/stroke-section.tsx`                                 | `../../styles`                                                     |
  | `core/ui/styles/{paint,stroke}-style-{editor,preview}.tsx`                   | the sibling files (`./style-editor-frame`, `../core.points.types`) |
  | `text/text.module.ts`                                                        | `../core/ui`                                                       |
  | `text/ui/text-styles/*`                                                      | `../../../core/ui`                                                 |
  | `effects/effects.module.ts`                                                  | `../core/ui`                                                       |
  | `effects/ui/effects-section.tsx`                                             | `../../core/ui`                                                    |
  | `effects/ui/styles/*`                                                        | `../../../core/ui`                                                 |
  | `variables/ui/{variables-section,styles-section}.tsx`                        | `../../core/ui`                                                    |
  | `variables/ui/usage/unused-view.tsx`, `ui/exchange/import-tokens-dialog.tsx` | `../../../core/ui`                                                 |
  | `variables/ui/window/inspector/variable-inspector.tsx`                       | `../../../../core/ui`                                              |

  Merge a file's two old imports into one when both now point at `core/ui`.

- [ ] **Step 4:** READMEs: variables README lines ~109–110 and ~247 name `designStyleTypes` in
      `modules/core/ui/core.points.ts`; the core README (or the design README's core part) says core
      owns the styles controls and the style types point, and registers color and stroke styles.
- [ ] **Step 5: Verify**

  Run: `grep -rn "components/styles\|ui/modules/style-types" src docs/modules.md`
  Expected: no output.

  Run: `grep -rn 'from "\.\./index"\|from "\."' src/products/design/modules/core`
  Expected: no output.

  Run: `pnpm typecheck && pnpm lint`
  Expected: both pass.

### Task 4: `layersTabSections` ends the pages ↔ layers cycle

**Files:**

- Create: `src/products/design/modules/layers/ui/layers.points.ts`,
  `layers.points.types.ts`, `src/products/design/modules/layers/ui/index.ts`
- Modify: `layers/ui/layers-tab.tsx`, `layers/layers.module.ts`, `pages/pages.module.ts`,
  `pages/ui/page-row.tsx`, `src/products/design/ui/modules/design-modules.ts`,
  `pages/README.md`

**Interfaces:**

- Produces (from `modules/layers/ui/index.ts`): `layersTabSections:
ExtensionPoint<LayersTabSection>` (id `"design.layersTabSections"`, `keyOf: (s) => s.id`);
  `interface LayersTabSection { id: string; /** Lowest first, under the layer tree. */ order:
number; component: ComponentType }`; `LayerName` (re-exported from `./layer-name`) and its props
  type.

- [ ] **Step 1:** Write the point, its types and `layers/ui/index.ts`.
- [ ] **Step 2:** `LayersTab` drops the `PagesSection` import and renders, where `<PagesSection />`
      was, the point's entries sorted by `order` (read the host the way `effects-section.tsx` does,
      with `useEditorModules()`), each as `<entry.component key={entry.id} />`. Its doc comment says
      "then the sections other modules add (the pages)".
- [ ] **Step 3:** `pages.module.ts` contributes
      `host.contribute(layersTabSections, { id: "pages", order: 10, component: PagesSection })`,
      importing from `../layers/ui`; `requires: ["core", "layers"]`. `layers.module.ts`:
      `requires: ["core"]`, doc comment drops "the pages module's list". `page-row.tsx` imports
      `LayerName` from `../../layers/ui`.
- [ ] **Step 4:** In `design-modules.ts`, move `layersModule` (import and list entry) to just before
      `pagesModule`.
- [ ] **Step 5:** pages README: the Pages list is a `layersTabSections` entry.
- [ ] **Step 6: Verify**

  Run: `grep -rn "modules/pages\|modules/layers" src/products/design/modules/pages src/products/design/modules/layers`
  Expected: no output.

  Run: `pnpm typecheck && pnpm lint`
  Expected: both pass.

### Task 5: Docs, Transition table, final check

**Files:**

- Modify: `docs/superpowers/specs/2026-10-25-module-conventions-design.md`, `docs/modules.md`,
  `CLAUDE.md`, memory `module-conventions.md`

- [ ] **Step 1: Spec.** §5.1: `layers` requires `core`; `pages` requires `core, layers`;
      `variables`' "owns the style types point" → core's row says it. §7.2: replace the diagram's
      styles part with Decision 1 (styles UI and point → `core/ui`, paint/stroke stay registered by
      core). §7.6: the point is `ui/effects.points.ts` (`designEffectTypes`), API
      `api.design.effects.effectTypes`. §8 #8: fix text matches. §12 phase 3: note done.
- [ ] **Step 2: `docs/modules.md`.** Anatomy and suffix table: `<name>.points.ts` at the root for
      engine points, `ui/<name>.points.ts` for points whose entries hold components. The tiers
      table: `effects` owns `designEffectTypes`; `core` owns the style types point; `layers` owns
      `layersTabSections`.
- [ ] **Step 3: `CLAUDE.md`.** Remove the Transition row "a feature's points in its
      `<name>.points.ts`; styles UI in variables".
- [ ] **Step 4: Verify**

  Run: `pnpm lint && pnpm typecheck && pnpm format:check`
  Expected: all pass (run `pnpm format` first on the changed files if format:check fails).

- [ ] **Step 5:** Self-review the diff; update memory (`phases 1–3 done`); give the user the commit
      message:

  ```
  refactor: points live in the modules that read them

  - ER points → er/er.points.ts; effect types point → effects/ui
    (designEffectTypes, api.design.effects.effectTypes)
  - styles UI and style types point → core/ui (core's Fills and Strokes use them)
  - layers owns layersTabSections; pages adds its list there (no more pages ↔ layers cycle)
  - spec, docs/modules.md and Transition table updated

  Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>
  ```
