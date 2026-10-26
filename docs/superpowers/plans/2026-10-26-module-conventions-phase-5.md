# Module conventions, phase 5: public-API imports, enforcement, module READMEs — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan
> task-by-task (inline, as the user chose). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modules reach each other only through their public entries, the rules are checked by a
script that `pnpm lint` runs, every module declares its tier and has `index.ts` and a complete
`README.md`. Phases 5a (shared UI pieces) and 5b (modes) get their own plans.

**Architecture:** One Node script, `scripts/check-modules.mjs`, owns every module rule (it knows the
module folders, `requires` and tiers, which ESLint patterns can't). Each module states its tier in
`defineModule({ tier })`. Deep imports are replaced by exports added to the target's `index.ts` or
`ui/index.ts`.

**Tech Stack:** TypeScript (strict), Node ESM (no dependencies) for the script, the module API in
`src/shared/core/modules`.

**Spec:** `docs/superpowers/specs/2026-10-25-module-conventions-design.md` (§4 import rules, §5
tiers, §8 #2–#7, §9 README template, §11 enforcement, §12 phase 5).

## Global Constraints

- The user handles all git: no commits, no branches. Move files with `mv`, never `git mv`.
- No legacy code or aliases: old paths and names are removed, not re-exported.
- Verification is only `pnpm lint`, `pnpm typecheck`, `pnpm format:check` (run from the repo root).
  No builds, cargo or browser checks.
- Every `interface`/`type` goes in a sibling `<file>.types.ts`.
- Module load order must not change: `requires`/`after` edits must keep each module's position in
  the sorted order (`sort-modules.ts`), because chained hooks (`afterEdit`, `editElement`,
  `resolveElements`, …) run in that order.
- Out of scope (phase 6): modules importing their own product barrel (`@design`/`@board`, 256
  imports), shadcn imported directly, `DEFAULT_SHADER_CODE`'s home. The script doesn't check those yet.

## Decisions this plan makes against the spec

1. **Core modules may be imported without `requires`.** They're always loaded, so `requires` adds
   nothing but load order, and adding it would reorder modules: `variables` → `text` (text is
   listed after variables; text no longer imports variables since phase 3), `er` → `connector`
   (connector is `after: ["er"]`, a cycle). The rule becomes: import another module only through its
   public entries, and only if it's a **core module or in `requires`**. Core modules never import
   features. Rule 17 in `CLAUDE.md` and `docs/modules.md` change to match.
2. **The tier is a field, not two arrays.** `AppModule` gets `readonly tier?: "core" | "feature"`
   (unset = a plugin's module). Two arrays `[...CORE_MODULES, ...FEATURE_MODULES]` would reorder the
   list (catalog must stay before the modules whose `editElement` takes frames). The list in
   `design-modules.ts`/`board-modules.ts` stays one ordered list.
3. **The script, not ESLint, checks module imports.** ESLint patterns can't see relative depth,
   `requires` or tiers. `pnpm lint` becomes `eslint . && node scripts/check-modules.mjs`.
4. **Placeholder detection moves to core.** `catalog` (a feature) imports `isPlaceholderPaint` from
   `image` (a feature); `catalog` can't require `image` without moving after it. A placeholder is a
   property of an image paint (core's data): `PLACEHOLDER_ASSET_PREFIX`, `isPlaceholderAsset` and
   `isPlaceholderPaint` move to `core/node/` next to `imagePaint`, exported by `core/index.ts`.
5. **Board core stops importing geo** (§7.3): `GeoKind` gets a `specProperties` getter with
   `kind` (enum `geoVariants.keys()`), `fill` and `stroke`; `create_shapes` drops the three
   hard-coded properties (they already merge in from `kind.specProperties`).

## Review Focus

1. Load order: after every `requires` edit, the sorted order of design and board modules is the same
   as before (Task 1 records it; Task 6 compares).
2. `export *` collisions: new exports in a module's `index.ts` reach `@board`/`@design` through
   `modules/index.ts`; a name two modules export breaks the barrel (TS2308). Rename the new export, never
   the old one.
3. `create_shapes`' input schema must list the same properties for agents (`kind`, `fill`,
   `stroke` with the same descriptions), now from `GeoKind`.
4. The script must fail on real violations: Task 6 adds a deep import on purpose, runs it, sees it
   fail, removes it.
5. READMEs: generated facts (requires, contributes, MCP tools) must match the code; the prose below
   them is kept, not rewritten.

---

### Task 1: Record the load order; add the tier field

**Files:**

- Create: `scripts/module-order.mjs` (prints the sorted module ids of both products; reused by Task 6)
- Modify: `src/shared/core/modules/modules.types.ts` (`AppModule.tier`), `src/shared/core/modules/README.md`,
  every built-in `*.module.ts` (41), `docs/modules.md`

**Interfaces:**

- Produces: `AppModule.tier?: "core" | "feature"` (doc: "Its tier (docs/modules.md#tiers); unset for
  plugins' modules. Only checked by `scripts/check-modules.mjs`."); every built-in module sets it
  per §5 (design core: core, pages, layers, frame, group, text, vector, variables, effects,
  auto-layout, plugins-tab; board core: core, library, connector, text, image; the rest `"feature"`).

- [ ] **Step 1:** Write `scripts/module-order.mjs`: reads each product's list in
      `ui/modules/<product>-modules.ts` (the module variable names, in order) and each module's
      `id`, `requires`, `after` from its `.module.ts` (regex, no TS compile), runs the same
      stable topological sort as `sort-modules.ts`, prints `design: a, b, …` and `board: …`.
- [ ] **Step 2:** Run `node scripts/module-order.mjs > <scratchpad>/order.before.txt`.
      Expected: two lines; design starts `core, layers, pages, variables`; board starts
      `core, colors, draw`.
- [ ] **Step 3:** Add `tier` to `AppModule` and `tier: "core"`/`"feature"` after `id` in every
      built-in module; README of `shared/core/modules` and `docs/modules.md` (Tiers) say where the
      tier is written.
- [ ] **Step 4: Verify**

  Run: `pnpm typecheck && pnpm lint && node scripts/module-order.mjs | diff - <scratchpad>/order.before.txt`
  Expected: passes, no diff.

### Task 2: Public entries for the design's deep imports

**Files:**

- Create: `design/modules/text/ui/index.ts`, `design/modules/pages/ui/index.ts`
- Modify: `effects/ui/index.ts`, `variables/ui/index.ts`, the importers below, `app/plugins/create-plugin-api.ts`,
  `app/plugins/plugin-api.types.ts`; move placeholder detection (Decision 4): `core/node/` new file
  `placeholder-paint.ts`, `core/node/index.ts`, `core/index.ts`, `image/placeholder/image-placeholder.ts`,
  `image/index.ts`

| Importer                                                                                  | Deep import                                                           | Becomes                                      |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------- |
| `catalog/ui/brochure-tab/brochure-switcher.tsx`                                           | `@design/modules/layers/ui/layer-name`                                | `../../../layers/ui`                         |
| `shader-effect/ui/shader-param-field.tsx`, `sticker/ui/sticker-{edge,outline}-field*.tsx` | `@design/modules/effects/ui/fields`                                   | `../../effects/ui` (export the fields there) |
| `app/plugins/create-plugin-api.ts`, `plugin-api.types.ts`                                 | `@design/modules/effects/ui/fields`                                   | `@design/modules/effects/ui`                 |
| `styleguide/ui/empty/styleguide-empty.tsx`                                                | `variables/ui/use-create-variable`, `…/window/variables-window-store` | `../../../variables/ui`                      |
| `styleguide/ui/picker/option-field.tsx`, `variables/ui/type-scale/type-scale-form.tsx`    | `@design/modules/text/ui/font-picker`                                 | `…/text/ui`                                  |
| `variables/ui/use-page-modes.ts`                                                          | `../../pages/ui/use-pages`                                            | `../../pages/ui`                             |
| `catalog/mcp/brochure-read.mcp.ts`, `catalog/checks/brochure-checks.ts`                   | `../../image` (`isPlaceholderPaint`)                                  | `../../core`                                 |

- [ ] **Step 1:** Add the exports (`ui/index.ts` files re-export only what's listed; types with
      `export type`). Move the three placeholder helpers to `core/node/placeholder-paint.ts`;
      `image` imports them from `../../core` and stops exporting them (no alias).
- [ ] **Step 2:** Repoint the importers in the table.
- [ ] **Step 3: Verify**

  Run: `pnpm typecheck && pnpm lint`
  Expected: both pass.

### Task 3: Public entries for the board's deep imports

**Files:**

- Modify: `board/modules/db/index.ts`, `db/ui/index.ts` (create if missing), `connector/index.ts`,
  the er files below, `geo/geo.kind.ts`, `sticky/sticky.kind.ts`, `er/er.module.ts`

| Importer (under `board/modules/`)                                                          | Deep import                                                                                                                                                                                                                                   | Becomes           |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `er/model/**`, `er/model/lang/**`, `er/model/check/**`, `er/model/to-tables/**` (29 files) | `db/schema/dbml`, `db/schema/dbml/parser.types`, `db/schema/dbml/dbml-format`, `db/schema/schema-dbml`, `db/schema/schema-shapes`, `db/schema/db-schema.types`, `db/schema/pair-by-name`, `db/schema/reconcile-error`, `db/table/column-type` | `…/db`            |
| `er/ui/er-panel/forms/*.tsx` (4)                                                           | `db/ui/db-panel/flag-toggle`                                                                                                                                                                                                                  | `…/db/ui`         |
| `er/connect/er-connect.ts`                                                                 | `connector/connector.defaults`, `connector/sides`                                                                                                                                                                                             | `../../connector` |
| `geo/geo.kind.ts`, `sticky/sticky.kind.ts`                                                 | `connector/quick-connect.kind`                                                                                                                                                                                                                | `../connector`    |

- [ ] **Step 1:** Add to `db/index.ts` every name the er files take (collect them with
      `grep -rhoE 'import (type )?\{[^}]*\} from "(\.\./)+db/[^"]+"' src/products/board/modules/er`);
      to `db/ui/index.ts` `FlagToggle` (and its props type); to `connector/index.ts`
      `SIDES`, `SIDE_DIRECTIONS`.
- [ ] **Step 2:** Repoint the importers (one import per target module per file, merged).
- [ ] **Step 3:** `er.module.ts`: `requires: ["db", "geo"]` (both already sort before er; `connector`
      is core, Decision 1).
- [ ] **Step 4: Verify**

  Run: `pnpm typecheck && pnpm lint && node scripts/module-order.mjs | diff - <scratchpad>/order.before.txt`
  Expected: passes, no diff (a TS2308 means an `export *` collision: rename the new export).

### Task 4: Board core stops importing geo

**Files:**

- Modify: `board/modules/geo/geo.kind.ts`, `board/modules/core/mcp/create-shapes.mcp.ts`,
  `board/modules/geo/README.md`

- [ ] **Step 1:** `GeoKind`: `get specProperties()` returning `{ kind: { enum: geoVariants.keys(),
description: "Geo shape kind." }, fill: { type: "string", description: 'Geo fill, or
"transparent".' }, stroke: { type: "string", description: 'Geo outline, or "transparent".' } }`
      (merged with what its base returns, if any). Check how `ElementKind.specProperties` is typed
      and whether a base already defines it.
- [ ] **Step 2:** Remove `kind`, `fill`, `stroke` and the `geoVariants` import from
      `create_shapes`.
- [ ] **Step 3: Verify**

  Run: `grep -rn "\.\./\.\./geo\|modules/geo" src/products/board/modules/core`
  Expected: no output.

  Run: `pnpm typecheck && pnpm lint`
  Expected: both pass.

### Task 5: Every module has `index.ts`

**Files:**

- Create: `index.ts` in design `assets`, `layers`, `plugins-tab`, `shader-effect`; board `colors`,
  `core`, `library`

- [ ] **Step 1:** Each starts with a one-line comment saying what the module's engine side is, and
      exports its engine-side public names (what other code imports from inside it today, if
      anything: check with `grep -rn "modules/<name>/" src`); a module with none has the comment
      and `export {};`. Don't add them to `modules/index.ts` unless they export something.
- [ ] **Step 2: Verify**

  Run: `pnpm typecheck && pnpm lint`
  Expected: both pass.

### Task 6: `scripts/check-modules.mjs`

**Files:**

- Create: `scripts/check-modules.mjs`
- Modify: `package.json` (`"lint": "eslint . && node scripts/check-modules.mjs"`,
  `"check:modules": "node scripts/check-modules.mjs"`), `CLAUDE.md` (rule 17, Commands mention of
  lint), `docs/modules.md` (Import rules, a "Checked by" line)

**Interfaces:**

- Produces: a script that exits 1 and prints `path:line  rule: message` per violation, exits 0
  silently otherwise. Rules (each with a short id printed in the message):
  - `files`: `modules/<name>/` lacks `index.ts`, `<name>.module.ts` or `README.md`;
  - `tier`: a built-in module has no `tier`;
  - `deep`: an import into another module that isn't `<module>`, `<module>/index`, `<module>/ui`
    or `<module>/ui/index` (relative or `@<product>/modules/…`), from a module or from anywhere
    else in `src/` (product, app); `ui/modules/<product>-modules.ts` may import `<name>.module`;
  - `requires`: a module imports a module that's neither core nor in its `requires`;
  - `core-feature`: a core module imports a feature;
  - `mcp`: a file matching `*.agent-tool*.ts`, or a `*.mcp.ts` that isn't `<module>/<name>.mcp.ts`,
    `<module>/mcp/*.mcp.ts`, or in `canvas/mcp`, `products/*/mcp`;
  - `size`: a `*.module.ts` over 120 lines.
    It reads `import … from "…"`, `export … from "…"` and `import("…")` specifiers with a regex,
    resolves relative ones against the file, and reads `id`, `tier`, `requires` from each module
    file. Type-only imports count like any other.

- [ ] **Step 1:** Write the script.
- [ ] **Step 2: Watch it fail.** Add `import { LayerName } from "../layers/ui/layer-name";` to
      `design/modules/catalog/catalog.module.ts`; run `node scripts/check-modules.mjs`.
      Expected: exit 1 with a `deep` line for that file. Remove the line.
- [ ] **Step 3:** Run it on the clean tree.
      Expected: exit 0, no output. Any other violation found is fixed the way Tasks 2–4 did (public
      entry, or a ruling in the ledger if it can't be).
- [ ] **Step 4:** Wire `package.json`; update rule 17 ("…only through their `index.ts` /
      `ui/index.ts`, and only if they're core modules or in `requires`; core never imports features.
      Checked by `scripts/check-modules.mjs`, part of `pnpm lint`.") and `docs/modules.md`.
- [ ] **Step 5: Verify**

  Run: `pnpm lint && node scripts/module-order.mjs | diff - <scratchpad>/order.before.txt`
  Expected: passes, no diff.

### Task 7: Every module's README follows the template

**Files:**

- Create: `README.md` in design `assets`, `core`, `ellipse`, `layers`, `line`, `plugins-tab`,
  `polygon`, `rectangle`, `star`; board `core`, `library`
- Modify: the other 30 modules' `README.md`

**Interfaces:**

- Each README starts (replacing the generated title and the "How it works" note) with:

  ```md
  # <Name as the user calls it>

  <One paragraph: what it is, as the user sees it.>

  - **Tier:** core | feature
  - **Requires:** … (or "—")
  - **Contributes:** kinds …; tools … (key); sections …; host commands …; hooks …
  - **Points it owns:** `x` (who extends it), or "—"
  - **MCP tools:** `a_b`, … or "—"
  - **Files:** the important ones and what they hold
  ```

  then the existing text unchanged under `## How it works` (the old `## <Name>` heading folds
  into it). "Not yet:" only where the existing text names something missing.

- [ ] **Step 1:** Write `<scratchpad>/readme_facts.py`: per module, tier, requires, the points it
      contributes to (from `host.contribute(<point>` in its `.module.ts` and split files), points
      it defines (`definePoint` in its folder), MCP tool names (`name: "…"` in its `.mcp.ts`
      files). Print as the bullet lines.
- [ ] **Step 2:** For each module, write the paragraph and the Contributes/Files lines from the
      facts and the existing text; keep the rest verbatim. Board modules, then design modules.
- [ ] **Step 3:** The new READMEs (11) get the same header; `## How it works` holds what the
      module file's doc comment and the design/board README already say about it (moved, not
      duplicated: the product README keeps one line pointing at the module).
- [ ] **Step 4: Verify**

  Run: `for d in src/products/*/modules/*/; do head -1 $d/README.md | grep -q "(Board module)\|(Design module)" && echo $d; done`
  Expected: no output.

  Run: `pnpm format:check`
  Expected: passes.

### Task 8: Docs, Transition table, final check

**Files:**

- Modify: the spec, `docs/modules.md`, `CLAUDE.md`, memory

- [ ] **Step 1: Spec.** §4 import rules (Decision 1), §5 (the tier field, Decision 2), §7.7
      (`design-modules.ts` keeps one list), §11 (the script, Decision 3), §12 phase 5 done (5a and 5b
      open).
- [ ] **Step 2: `CLAUDE.md`.** Remove the Transition rows "board core's tools don't import features"
      and "import rules enforced; every module has a complete `README.md`"; rule 16 mentions
      `tier`.
- [ ] **Step 3: Verify**

  Run: `pnpm lint && pnpm typecheck && pnpm format:check && node scripts/module-order.mjs | diff - <scratchpad>/order.before.txt`
  Expected: all pass, no diff.

- [ ] **Step 4:** Self-review against Review Focus; memory (phase 5 done, 5a/5b open); commit message:

  ```
  refactor: modules use public entries, checked by check-modules

  - every module declares its tier and has index.ts and a README in the template
  - deep imports between modules replaced by index.ts / ui/index.ts exports;
    placeholder detection moves to core; create_shapes reads geo's fields from GeoKind
  - scripts/check-modules.mjs (part of pnpm lint): deep imports, requires,
    core → feature, module files, MCP file names, module size
  - rule: core modules may be imported without requires; docs and Transition updated

  Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>
  ```
