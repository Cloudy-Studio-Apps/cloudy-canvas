# Variables — Phase 4 Implementation Plan (Extras)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Phase 4 adds the tools for keeping a design system healthy:

- a **type scale** generator that makes text styles;
- **contrast** checks, for pairs declared on a variable and for automatic text-on-surface pairs, shown as warnings in the panel;
- **usage tools**: where a token is used and selecting those layers, Replace with…, Find unused, and Detach (per token everywhere, per layer).

**Architecture:**

- **Usage, replacing, unused and detaching** are generic token operations. They go in `canvas/tokens/` as `DocumentTokens` methods and pure helpers, because the board (phase 6) will need them too.
- **The type scale is not a new record kind.** It's an existing number scale (`ScaleRecord`, scopes `font-size`) plus one text style per step, whose `fontSize` is bound to that step's variable (style bindings, phase 2). Changing the base, or the scale's settings, regenerates the numbers, and the styles follow on their own.
- **Contrast** reads `VariableRecord.contrastWith` (declared partners, a new optional field) and pairs found automatically by scope (text fills on frame and shape fills). Each pair is checked in every mode, with translucent colors composited over their surface first.
- **Feature folders:** everything design-specific lives in the variables module, in one subfolder per feature: `variables/type-scale/`, `variables/contrast/`, `variables/usage/` (engine) and `variables/ui/<feature>/` (UI).

**Tech Stack:** TypeScript strict, Yjs, React 19, Zustand, `@shared/ui/kit`, Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-10-24-variables-design-system-design.md`, section "Extras" (phase 4: "generators, contrast, usage tools, detach-all"). The ramp and spacing-scale generators already exist (`generate_shades`, `generate_scale`); this phase adds the type scale. The `CLAUDE.md` Variables and Design system sections record what exists.

## Global Constraints

- There is no test framework. Each task is verified with `pnpm typecheck && pnpm lint`, plus `pnpm format:check` at the end. Don't run the app, builds or browsers, except for the live MCP check in Task 9 if the app is running.
- Layering: `canvas/tokens/` is plain TS. In the module, engine folders are plain TS and React lives only in `ui/` and the module file.
- Types go in sibling `.types.ts` files. Use small files and kit components. No giant `.tsx` files (user). Keep each feature in its own folder (user).
- Every user action is one undo step, and every agent call is one `asUndoStep`.
- Spec values:
  - WCAG 2 thresholds are AA 4.5, AAA 7, and "AA large" 3.
  - Type scale names are `xs…6xl` (t-shirt, like the number scale's), from a base size × ratio, with line heights.
  - Usage means "used by N layers" per token, Select all users (on the page, or on every page with a page switch), Replace with… (rebind every use), Find unused, and Detach (bound → raw value) per field, per layer, or per token everywhere.
- Commit only when the user asks.

## Review Focus

1. **Replace with** rebinds element bindings, style bindings, aliases pointing at the old token, and generator or scale bases, all in one undo step, for the same type only. Replacing a token with itself, or with a token whose alias chain reaches the old one, is refused, so it can never make a loop. Owned by Task 1.
2. **Find unused** never lists a token that's used only through an alias, only by a style, or only as a generator or scale base. "Delete all unused" is one undo step. Owned by Task 1.
3. **Type scale:** changing the scale's base variable, or its ratio, resizes every generated style and every layer using one. Deleting a step variable bakes its last value into its style. Owned by Task 3.
4. **Contrast** is checked per mode with aliases resolved. A pair that passes in Light but fails in Dark is reported once, for Dark. A translucent text color is composited over its surface before the ratio. Owned by Task 2.
5. **Detach** (per layer or per token everywhere) keeps what every layer shows, including layers that use a style and runs carrying a text style. Owned by Task 1.

---

## File Structure

```
src/canvas/tokens/
  token-usage.ts (+ .types.ts)     tokenUsage, unusedTokens               (Task 1)
  replace-token.ts                 replacePlan (pure)                     (Task 1)
  document-tokens.ts               usageOf, unused, replaceUses, detachTokens, detachLayers (Task 1)
  token.types.ts, is-token-record.ts, variable-edits.ts   VariableRecord.contrastWith (Task 2)
src/products/design/modules/variables/
  contrast/   contrast-math.ts, contrast-pairs.ts (+ .types.ts), index.ts            (Task 2)
  type-scale/ type-scale.ts (+ .types.ts), create-type-scale.ts, index.ts            (Task 3)
  agent/      usage.agent-tools.ts, contrast.agent-tools.ts, type-scale.agent-tools.ts (Task 8)
  ui/usage/   usage-summary.tsx, replace-with.tsx, detach-everywhere.tsx, unused-view.tsx,
              use-detach-layers-command.ts                                          (Tasks 4–6)
  ui/contrast/ contrast-pairs-list.tsx, contrast-warnings.tsx, partner-picker.tsx   (Task 7)
  ui/type-scale/ type-scale-dialog.tsx, type-scale-form.tsx, type-scale-preview.tsx (Task 3)
  variables.module.ts              contributions
```

---

### Task 1: Usage, replace, unused and detach in the token engine

**Files:**

- Create: `canvas/tokens/token-usage.ts`, `token-usage.types.ts`, `replace-token.ts`
- Modify: `canvas/tokens/document-tokens.ts`, `canvas/tokens/index.ts`

**Interfaces — Produces:**

```ts
export interface TokenUsage {
  layers: string[];      // elements bound to it directly
  viaStyles: string[];   // elements bound to a style that binds it (variables only)
  aliases: string[];     // variables whose values alias it
  styles: string[];      // styles binding it (variables) — empty for styles
  generators: string[];  // shade generators / scales whose base it is
}
export function tokenUsage(store: TokenStore, index: BindingIndex, id: string): TokenUsage;
export function isUnused(usage: TokenUsage): boolean; // every list empty
export function unusedTokens(store: TokenStore, index: BindingIndex): string[]; // variables and styles, in store order
/** What replacing `from` by `to` writes; throws "Can't replace … with …" for another type, itself, or a loop. */
export function replacePlan(store: TokenStore, from: string, to: string): { records: TokenRecord[] };
// DocumentTokens
usageOf(id: string): TokenUsage;
unused(): string[];
replaceUses(from: string, to: string): number;                 // one undo step; returns the layers rebound
detachTokens(ids: readonly string[]): void;                    // everywhere, the tokens stay; styles keep values
detachLayers(layerIds: readonly string[], tokenIds?: readonly string[]): number; // one undo step; returns bindings removed
```

- [ ] **Step 1:** Write `tokenUsage`. Direct uses come from `index.boundTo(id)`. Uses through a style come from `store.styleUsers(id)`, then `index.boundTo(style)`. Aliases come from `store.aliasDependents(id)`, the direct ones only. Generators are `store.generators()`/`store.scales()` whose `baseVar === id`. A run text style (`runs.textStyle.<id>`) counts as a direct use.
- [ ] **Step 2:** Write `replacePlan`, which returns the variable records whose `{ alias: from }` values become `{ alias: to }`, the style records whose `bindings` map `from` to `to`, and the generators and scales whose base changes. It refuses another type, a style for a variable or the other way round, `to === from`, and any `to` whose alias chain reaches `from`. `replaceUses` writes the plan and the elements' `bindings` (every path bound to `from` → `to`) in one `write`. The sync then resolves the new values.
- [ ] **Step 3:**
  - `detachTokens` reuses `detachEverywhere`, plus `stylesWithout` for variables that styles use. The records stay; this is not `deleteTokens`.
  - `detachLayers` removes the given layers' bindings (all of them, or those pointing at `tokenIds`) with `setBindings(..., null)`. Only bindings go: a run's `textStyle` id is cleared by the text module's `syncRunStyleBindings` once its `runs.textStyle.<id>` binding is gone. Read that hook to confirm. If it doesn't clear them, ledger a ruling and leave the runs: they keep their look either way.
- [ ] **Step 4:** Check against Review Focus 1, 2 and 5:
  - A primitive aliased by a semantic variable isn't unused.
  - Replacing `teal/600` with `teal/700` moves the alias, the style bindings and the layers.
  - Replacing A with B, when B aliases A, throws.
  - A layer using a style keeps its fields after `detachLayers`.

  `pnpm typecheck && pnpm lint` passes.

### Task 2: Declared contrast pairs and the contrast engine

**Files:**

- Modify: `canvas/tokens/token.types.ts` (`VariableRecord.contrastWith?: string[]`), `is-token-record.ts` (an array of strings), `variable-edits.ts` (`VariablePatch.contrastWith`), `document-tokens.types.ts`
- Create: `modules/variables/contrast/{contrast-math.ts, contrast-pairs.ts, contrast-pairs.types.ts, index.ts}`
- Modify: `variables/ui/window/luminance.ts` (re-export from `contrast-math`), `variables/index.ts`

**Interfaces — Produces:**

```ts
export function luminance(hex: string): number;
export function contrastRatio(text: string, surface: string): number; // text composited over surface first when it has alpha
export function contrastGrade(ratio: number): "AAA" | "AA" | "AA large" | "fail";
export interface ContrastPair {
  text: string;
  surface: string;
  declared: boolean;
}
export interface ContrastCheck extends ContrastPair {
  modes: { mode: string; axis: string | null; ratio: number; grade: ContrastGrade }[];
  worst: ContrastGrade;
}
/** Declared pairs (contrastWith, either side) and automatic ones: text-fill colors × frame/shape-fill colors of the same collection. */
export function contrastPairs(store: TokenStore): ContrastPair[];
/** Each pair resolved in every mode of the axes its two colors vary by (the file's current mode for the others). */
export function contrastChecks(store: TokenStore, pairs?: ContrastPair[]): ContrastCheck[]; // failing first
```

- [ ] **Step 1:** Add the field and validation. Deleting a variable removes it from other variables' `contrastWith` in the same step (`deleteTokens`), and `replaceUses` (Task 1) moves it.
- [ ] **Step 2:** Write the math. The composite is `out = a·text + (1−a)·surface` per channel, with the surface treated as opaque. Then the pairs and the checks. A pair's modes are the cartesian product of the modes of the axes either color varies by, capped at 16 combinations. `worst` is the lowest grade across them.
- [ ] **Step 3:** Check against Review Focus 4: text `#00000080` on white is composited to `#7F7F7F`, which gives about 4.0, graded "AA large". A pair varying by Theme gets one result for Light and one for Dark. `pnpm typecheck && pnpm lint` passes.

### Task 3: The type scale

**Files:**

- Create: `modules/variables/type-scale/{type-scale.types.ts, type-scale.ts, create-type-scale.ts, index.ts}`; `ui/type-scale/{type-scale-dialog.tsx, type-scale-form.tsx, type-scale-preview.tsx, type-scale.types.ts}`
- Modify: `variables/ui/styles-section.tsx` (a "Type scale…" item in its "+" menu), `variables.module.ts` if needed

**Interfaces — Produces:**

```ts
export interface TypeScaleSettings extends ScaleSettings {
  // ratio, below, above, names, round
  base: number; // px, e.g. 16
  collection: string; // where the size variables go
  group: string; // e.g. "type" → type/xs … type/4xl, and styles "Type/xs" …
  family: { variable: string } | { name: string };
  headingWeight: FontWeight; // steps above md
  bodyWeight: FontWeight; // md and below
  lineHeight: { body: number; heading: number }; // multiples, e.g. 1.5 and 1.2
}
export const DEFAULT_TYPE_SCALE: Omit<TypeScaleSettings, "collection" | "family">; // base 16, ratio 1.25, below 2, above 5, tshirt, round, 700/400, 1.5/1.2
export interface TypeScaleStep {
  name: string;
  size: number;
  weight: FontWeight;
  lineHeight: number;
  heading: boolean;
}
export function typeScaleSteps(settings: TypeScaleSettings): TypeScaleStep[]; // numberScale + weights/line heights
/** One undo step: the number scale (scopes font-size) and a text style per step bound to its size (and the family variable). */
export function createTypeScale(
  tokens: DocumentTokens,
  settings: TypeScaleSettings,
): { scale: string; styles: string[] };
```

- [ ] **Step 1:** Write the engine. Style names are `${capitalised group}/${step}`. Each style's value is `{ fontFamily, fontSize, fontWeight, lineHeight, letterSpacing: 0 }` with bindings `{ fontSize: <step variable>, fontFamily?: <family variable> }`, created through `tokens.createStyle` with `bindings`. The whole call is one checkpoint plus a batch. A group that already has styles of those names throws "Type scale "Type" already exists: pick another group."
- [ ] **Step 2:** Write the UI. The Styles section's "+" menu gets a "Type scale…" item after the style types. It opens `TypeScaleDialog` (kit `AppDialog`), which has:
  - `TypeScaleForm`: base (`NumberInput`), ratio (`SCALE_RATIOS` select), steps below and above, group, collection, font (a font-family variable select, or `FontPicker`), weights and line heights.
  - `TypeScalePreview`: each step as "Aa The quick brown fox" at its size and weight, with its name and px.
  - Create.
- [ ] **Step 3:** Check against Review Focus 3. The scale's base is `baseValue`, so editing it in the window's `ScaleLink`/`NumberScalePanel` regenerates the numbers and the styles resolve through their bindings. `deleteTokens` on a step bakes it in (`stylesWithout`). `pnpm typecheck && pnpm lint` passes.

### Task 4: Usage in the UI: counts, selecting users, Replace with, Detach everywhere

**Files:**

- Create: `variables/ui/usage/{usage-summary.tsx, replace-with.tsx, detach-everywhere.tsx, usage.types.ts, use-token-usage.ts}`
- Modify: `variables/ui/window/inspector/variable-inspector.tsx` (`UsageRow` → `UsageSummary`), `usage-row.tsx` (delete), `ui/components/styles/style-editor-frame.tsx` (styles get the same summary, with Replace with and Detach everywhere)

**Interfaces — Produces:**

```ts
export function useTokenUsage(
  id: string,
): TokenUsage & { byPage: { pageId: string; name: string; ids: string[] }[] }; // layers + viaStyles grouped by page, re-read on version changes
```

- [ ] **Step 1:** `UsageSummary` shows "Used by N layers" (direct and through styles), "M aliases" and "K styles". It lists the pages: the page on screen first ("Select 3 here"), then each other page as "Page 2 · 5", where a click shows that page (`engine.setScope`) and selects its users. When nothing uses the token, it says "Not used" and offers Delete.
- [ ] **Step 2:** `ReplaceWith` is a kit button that opens `VariablePicker` (filtered by type), or a `StyleList` for styles. Picking runs `tokens.replaceUses(from, to)` and toasts "Replaced in N layers". `DetachEverywhere` is a button with a confirm (`AppDialog`: "Unlink N layers from this variable? They keep their look.") that runs `tokens.detachTokens([id])`.
- [ ] **Step 3:** `pnpm typecheck && pnpm lint` passes.

### Task 5: Find unused

**Files:**

- Create: `variables/ui/usage/{unused-view.tsx, unused-row.tsx}`
- Modify: `variables/ui/window/variables-window-store.ts` (view `"unused"`), `variables/ui/window/side/collections-side.tsx` (an "Unused · N" entry under the collections), `variables/ui/window/board/variables-board.tsx` (shows `UnusedView` for that view)

- [ ] **Step 1:** `UnusedView` lists `tokens.unused()` variables and styles, with a swatch or glyph, name and collection. Each row has a checkbox. "Delete selected" and "Delete all unused" each go through the `DeleteTokensDialog`, as one undo step, with 0 layers to unlink. With nothing unused, it shows the kit `EmptyState` "Everything is used".
- [ ] **Step 2:** `pnpm typecheck && pnpm lint` passes.

### Task 6: Detach a layer's variables

**Files:**

- Create: `variables/ui/usage/use-detach-layers-command.ts`
- Modify: `variables.module.ts` (host command `detachLayerVariables`, label "Detach variables and styles", no key; context menu `selection` group, enabled while a selected layer has bindings; main menu Edit group)

- [ ] **Step 1:** The command runs `tokens.detachLayers(selected)` and toasts "Unlinked N fields". `pnpm typecheck && pnpm lint` passes.

### Task 7: Contrast in the UI

**Files:**

- Create: `variables/ui/contrast/{contrast-pairs-list.tsx, contrast-row.tsx, partner-picker.tsx, contrast-warnings.tsx, use-contrast-checks.ts, contrast.types.ts}`
- Modify: `variables/ui/window/inspector/variable-inspector.tsx` (`ContrastList` → `ContrastPairsList`), delete `contrast-list.tsx`, `variables/ui/variables-section.tsx` (`ContrastWarnings` at its end)

- [ ] **Step 1:** `ContrastPairsList`, in the inspector of a color variable:
  - each pair it's in, with `ContrastRow`: the partner's swatch and name, then a grade per mode (`AAA`/`AA`/`AA large`/`fail`, with semantic success/warning/destructive tones);
  - declared pairs with a × that removes them from `contrastWith`;
  - "+ Pair with…" (`PartnerPicker`: a `VariablePicker` of colors), which adds one.

  Automatic pairs are marked "auto".

- [ ] **Step 2:** `ContrastWarnings`, in the Variables section with nothing selected, is a collapsible kit `Section` titled "Contrast · N issues". It lists the checks whose `worst` is `fail` (and `AA large`, muted). A click opens the Variables window at the text variable (`openWindowAt`/`select`). It's hidden when there are no pairs.
- [ ] **Step 3:** `pnpm typecheck && pnpm lint` passes.

### Task 8: Agent tools

**Files:**

- Create: `variables/agent/{usage.agent-tools.ts, contrast.agent-tools.ts, type-scale.agent-tools.ts}`
- Modify: `variables/agent/index.ts`, `variables-edit.agent-tools.ts` (`contrastWith` in create/update, by name or id), `variables-read.agent-tools.ts` (`usedBy` becomes `{ layers, aliases, styles }`)

Tools:

- `get_token_usage { token }` returns the usage with layers grouped by page.
- `find_unused_tokens {}`.
- `replace_token { from, to }` returns the number rebound.
- `detach_tokens { tokens?: [...], layers?: [...] }`: tokens everywhere, or layers (all their bindings, or only those of `tokens`).
- `check_contrast { variable?, failingOnly? }`.
- `generate_type_scale { collection, group?, base?, ratio?, below?, above?, font? (a family name or a font-family variable), headingWeight?, bodyWeight?, lineHeight? }` returns the scale id and style ids.

- [ ] **Step 1:** Write them, each edit in `asUndoStep`, with errors listing what's valid. `pnpm typecheck && pnpm lint` passes.

### Task 9: Documentation, final checks, live check

- [ ] **Step 1:** In `CLAUDE.md`:
  - The Variables bullet gets "phases 1–4" and a short paragraph on usage (`tokenUsage`, `replaceUses`, `unused`, `detachTokens`, `detachLayers`), contrast (`contrastWith`, `contrastPairs`/`contrastChecks`) and the type scale (a number scale plus bound text styles).
  - Its "Not yet" list drops the type scale, Replace with… and Find unused.
- [ ] **Step 2:** `pnpm lint && pnpm typecheck && pnpm format:check` passes.
- [ ] **Step 3:** If the app is running with the agent server, run each new tool once on a new scratch design (or the PawCare file, then undo). Check visually with `view_design_system` and Typography.
