# Variables — Phase 3 Implementation Plan (Design System view + live element)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A "Design system" mode shows the file's variables and styles as a generated style guide on a hidden system page. The same generated content can be placed on any page as a live element, and turned into ordinary layers that keep their variable links. Categories and templates are extension points, and there are exports and agent tools.

**Architecture:** Everything about the Design system lives in **one module folder, `src/products/design/modules/styleguide/`** (user). Outside it, only four generic hooks change, none of which knows about the design system: background scopes and meta-aware `afterEdit` in the canvas engine, hidden pages in the pages module, and a select-redirect point in the core module. Plus the one line registering the module. A live element is a frame carrying a `sheet` field (`TokenSheet`, a styleguide type: source, template, options, mode view, content hash). Its children are real layers, marked `generated: { sheet, key }` and locked, which are fields the styleguide writes and reads with its own guards. Core and frame types don't change. The module's `afterEdit` hook builds each sheet's content as a tree of agent-style node specs through pure templates, hashes it, and reconciles it into the sheet's children by `key` only when the hash changes. Nodes are built through the kinds (`kind.buildNode`), bound fields carry `bindings` that the token sync resolves, and auto layout places everything. The system page is a page record with `hidden: true` (the pages module's generic flag) and the styleguide's settings, a background scope the canvas never goes to on its own; one sheet per category is stacked on it. Convert to design deletes the `sheet` field and the `generated`/`locked` marks.

**Tech Stack:** TypeScript (strict, `noUncheckedIndexedAccess`), Yjs, React 19, Zustand, Radix/shadcn + `@shared/ui/kit`, Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-10-24-variables-design-system-design.md`: phase 3, the sections "Design System view (a mode)", "The live design-system element" and "Templates (extension point)". The plans for phases 1 and 2 (`docs/superpowers/plans/2026-10-24-variables-phase-1.md`, `2026-10-25-variables-phase-2.md`) and the Variables part of `CLAUDE.md` record what exists.

## Global Constraints

- There is **no test framework**: each task is verified with `pnpm typecheck` and `pnpm lint`, plus `pnpm format:check` at the end. Do not run `tauri dev`, cargo, builds or browser checks. A "check" step means reading the code against the named case.
- Layering (ESLint): engine files (`modules/styleguide/` outside `ui/` and `*.module.ts`, `src/canvas/`) are plain TS. React only in `ui/` and the module file.
- Every `interface`/`type` goes in a sibling `.types.ts`. One component or helper per file; split past ~200 lines. **No giant `.tsx` files** (user). **Reuse `@shared/ui/kit`** (user): no raw `<button>`/`<input>` outside the kit.
- All edits go through `CanvasDocument` services, one undo step per user action. Canvas content never goes in React or Zustand state. Never branch on `el.type` outside an element's folder.
- Panels use semantic tokens only, with 4px/6px radii and no pills. Generated content is document content, so it uses fixed data colors (`SHEET_LOOK`) and may be rounded.
- Commit only when the user asks.
- Spec values:
  - Mode id `styleguide`, label "Design system", **always shown** in the mode switcher.
  - The system page is a hidden page (`hidden: true`, the pages module's generic flag) carrying the styleguide's settings, is not listed in Pages, and is created by the sync in the step of the file's first variable or style. Looking at the page never writes anything.
  - Category order: Cover, Colors, Typography, Spacing, Radius, Effects, Strokes, Paint styles, Opacity, Other.
  - Template choice: element override → group override → category default.
  - Generated children are locked, can't be selected on their own, and agents' edits skip them.
  - Convert to design keeps bindings. Labels that showed a variable's name become plain text.
  - The whole-system PDF has one page per category, sized to its content.

## Review Focus

1. **Undo while on Page 1** (say, undoing a variable's color) restores the system page's swatches in the same step but **stays on Page 1**. The file opens on Page 1, never on the system page, and deleting Page 1 shows Page 2. Owned by Task 1 (`CanvasScopes.background`, hidden pages).
2. **Changing a variable** updates its swatch and its hex label in the view and in every live element, without unlinking the swatch's binding. In an "all modes" element, the Dark column shows the Dark value. Owned by Task 5 (the reconciler never writes bound fields; templates resolve in the node's own modes).
3. **The afterEdit passes settle:** regeneration → auto layout resize → stacking → no more regeneration, because the hash didn't change. A file with no tokens has no system page. Deleting the last token removes the page in the same step. Owned by Task 5.
4. **Copy and paste of a live element**, in the same file or into another file, regenerates it for the target's tokens. The `generated.sheet` ids follow the copy (`remapIds`). Deleting it takes its children. Owned by Task 5.
5. **Convert to design** gives unlocked, selectable, editable layers that look exactly as before and still follow their variables. Clicks no longer redirect to the sheet. Owned by Task 12.

---

## File Structure

Everything new is in `modules/styleguide/`. The only edits elsewhere are the generic hooks of Task 1 and the module's registration.

```
src/canvas/                                         (Task 1, generic)
  document/canvas-document.ts, document.types.ts   EditedChange.meta
  canvas-product.types.ts, canvas-engine.ts        CanvasScopes.background
src/products/design/
  modules/pages/                                   (Task 1, generic) PageElement.hidden; pagesOf skips hidden
                                                   pages, PAGE_SCOPES lists them as background scopes
  design-points.ts, modules/core/core.module.ts,   (Task 1, generic) designSelectRedirects point, read by
  modules/core/tree/host-select-target.ts          hostSelectTarget
  ui/modules/design-modules.ts                     registers styleguideModule
  modules/styleguide/                              EVERYTHING ELSE
    styleguide.module.ts                           the one register file
    styleguide-points.ts, styleguide.types.ts      categories and templates points, their entry types
    sheet/      sheet.types.ts (TokenSheet, GeneratedMark, StyleguideSettings, TemplateChoice),
                is-sheet.ts, create-sheet.ts, sheet-look.ts, spec-builders.ts, build-sheet.ts,
                mode-columns.ts, reconcile-sheet.ts, stack-system-sheets.ts, template-choice.ts,
                sheet-groups.ts, select-redirect.ts
    tokens/     contrast.ts, number-purpose.ts, hash-text.ts   (small helpers the templates need)
    system/     system-page.ts, ensure-system-page.ts, sync-styleguide.ts
    categories/ <id>.category.ts ×10, index.ts
    templates/  colors/, typography/, spacing/, radius/, strokes/, effects/, paint/, opacity/,
                other/, cover/ (one <id>.template.ts each), table-rows.ts, index.ts
    model/      design-styleguide.ts (DESIGN_STYLEGUIDE service), convert-sheet.ts, export-system.ts
    mode/       styleguide-mode.ts, styleguide.tool.ts, styleguide-allowed-commands.ts, constants
    tool/       token-sheet.tool.ts
    agent/      styleguide-read.agent-tools.ts, styleguide-edit.agent-tools.ts, index.ts
    ui/         tab/, sidebar/, picker/, preview/, empty/, menus/, hooks/, stores/
```

Ruling: the template helpers `contrast.ts` and `number-purpose.ts` are written inside the styleguide, even though the Variables window has similar code in its `ui/`. Engine templates can't import UI files, and the user wants this feature kept in one folder. The cost if wrong is about 30 duplicated lines, which could later move into `canvas/tokens`.

---

### Task 1: The generic hooks outside the module

None of these mention the design system. Each is a capability any feature could use.

**Files:**

- Modify: `src/canvas/document/canvas-document.ts`, `src/canvas/document/document.types.ts`, `src/canvas/canvas-product.types.ts`, `src/canvas/canvas-engine.ts`
- Modify: `modules/pages/page/page.types.ts`, `pages-of.ts`, `page-scopes.ts`, `ensure-pages.ts`, `design-pages.ts`, `pages/index.ts`
- Modify: `src/products/design/design-points.ts`, `modules/core/core.module.ts`, `modules/core/tree/host-select-target.ts`

**Interfaces — Produces:**

```ts
// EditedChange
meta: boolean; // the title or description changed in this pass
// CanvasScopes
/** A scope the canvas never shows on its own (opening, undo/redo following, a deleted scope's neighbour); only setScope shows it. */
background?(doc: CanvasDocument, scope: string): boolean;
// PageElement
hidden?: true;                                     // a page made by a feature, not listed with the user's pages
export function pagesOf(doc): PageElement[];        // listed (non-hidden) pages: unchanged callers keep working
export function allPagesOf(doc): PageElement[];     // listed pages, then hidden ones
// PAGE_SCOPES.list = allPagesOf ids; PAGE_SCOPES.background = (doc, id) => doc.get(id) is a hidden page
// design-points.ts
/** What a click on `hitId` selects instead, or null to leave it to the tree's rules (the first answer wins). */
export const designSelectRedirects: ExtensionPoint<(hitId: string, elements: readonly CanvasElement[]) => string | null>;
```

- [ ] **Step 1:** Make `setMeta` mark a `metaSince` flag when a value really changed and `afterEdit` is set. `settle` passes it on as `change.meta`, counts it in the "anything to do" check, and resets it. Every other place that builds an `EditedChange` passes `meta: false`; let `tsc` find them.
- [ ] **Step 2:** `nextScope`: drop background scopes from `touched` before following history, and skip them in the "now in its place" fallback (the nearest non-background scope; `null` if none is left). The canvas opens on the first non-background scope.
- [ ] **Step 3:** Hidden pages. `ensurePages` treats `allPagesOf` ids as known, so nodes on a hidden page stay there, and it still adds "Page 1" when only hidden pages exist. `DesignPages.duplicate`/`remove`/`rename`/`reorder` ignore hidden pages. Check the other callers of `pagesOf` (Pages section, `previousPage`/`nextPage`, `list_pages`/`switch_page`, `move_nodes_to_page`, brochures): none of them may reach a hidden page.
- [ ] **Step 4:** `hostSelectTarget` gets a `redirect` argument. Unless `deep`, the first non-null redirect wins. `core.module.ts` passes `(hit, els) => host.get(designSelectRedirects)` answers, read lazily inside the callback, since the host is read-only after `register`.
- [ ] **Step 5:** Check against Review Focus 1: the list is `[p1, p2, hidden]` and the user is on `p1`. An undo touching only `hidden` stays on `p1`. Removing `p1` shows `p2`. `pnpm typecheck && pnpm lint` passes.

### Task 2: Sheet types, the system page and the redirect (in the module)

**Files:**

- Create: `styleguide/sheet/sheet.types.ts`, `sheet/is-sheet.ts`, `sheet/select-redirect.ts`, `system/system-page.ts`, `tokens/{contrast,number-purpose,hash-text}.ts` (+ `.types.ts`), `styleguide/index.ts`, `styleguide.module.ts` (skeleton)
- Modify: `ui/modules/design-modules.ts` (add `styleguideModule` right after `variablesModule`), `modules/index.ts` (export)

**Interfaces — Produces:**

```ts
export interface GeneratedMark {
  sheet: string;
  key: string;
} // stored as `generated` on generated nodes
export interface TokenSheet {
  // stored as `sheet` on a frame
  category: string;
  group?: string; // a SheetGroup id; unset = the whole category
  template: string | null; // null: the configured choice (template-choice.ts)
  options: Record<string, unknown> | null;
  modeView: "current" | "all";
  hash: string; // of the content last generated ("" = never)
}
export interface StyleguideSettings {
  // stored as `styleguide` on the system page
  order: string[]; // category ids, user order (missing ids follow in their default order)
  hidden: string[]; // "colors" or "colors:<groupId>"
  choices: Record<string, TemplateChoice>; // "colors" (category default) or "colors:<groupId>" (group override)
}
export interface TemplateChoice {
  template: string;
  options: Record<string, unknown>;
}
export type SheetFrame = FrameElement & { sheet: TokenSheet };
export function isSheet(el: CanvasElement | undefined): el is SheetFrame; // a frame (isFrame) with a valid `sheet`
export function generatedMark(el: CanvasElement | undefined): GeneratedMark | null;
export function systemPageOf(
  doc: CanvasDocument,
): (PageElement & { styleguide?: StyleguideSettings }) | undefined; // the hidden page with a `styleguide` field
export function sheetRedirect(hitId: string, elements: readonly CanvasElement[]): string | null; // a generated node → its sheet
export function luminance(hex: string): number;
export function contrastRatio(a: string, b: string): number;
export function contrastGrade(ratio: number): "AAA" | "AA" | "AA large" | "fail"; // 7, 4.5, 3
export type NumberPurpose = "spacing" | "radius" | "font" | "opacity" | "stroke" | "other";
export function numberPurposeOf(variable: VariableRecord): NumberPurpose; // by scopes: gap|padding, corner-radius, font-size, opacity, stroke-weight
export function hashText(text: string): string; // cyrb53, base36
```

- [ ] **Step 1:** Write the types and guards. The guards read the extra fields with a narrow cast and check their shape, the way `isTokenRecord` does, so a malformed `sheet` counts as a plain frame.
- [ ] **Step 2:** Write the module skeleton: `id: "styleguide"`, `requires: ["core", "pages", "frame", "text", "variables", "auto-layout"]`, `after: ["variables"]`. It contributes `sheetRedirect` to `designSelectRedirects`, so a click or right-click on generated content selects its sheet, and double-click never enters one.
- [ ] **Step 3:** Agents: generated layers aren't refused by core. Their changes are overwritten at the next regeneration. The styleguide's tool descriptions (Task 13) tell agents to convert first. Ruling: this keeps `requireNodes` untouched (user: keep the feature in its folder). The spec's "skipped by agents' edits" becomes "overwritten", which costs an agent a wasted call. Generated layers stay listed in the Layers panel, locked.
- [ ] **Step 4:** `pnpm typecheck && pnpm lint` passes.

### Task 3: The styleguide points and their types

**Files:**

- Create: `styleguide/styleguide-points.ts`, `styleguide/styleguide.types.ts`, `styleguide/sheet/template-choice.ts`, `styleguide/sheet/sheet-groups.ts`, `styleguide/index.ts`, export from `modules/index.ts`

**Interfaces — Produces:**

```ts
export interface SheetItem { kind: "variable"; record: VariableRecord } | { kind: "style"; record: StyleRecord };
export interface SheetGroup { id: string; title: string; items: SheetItem[] } // id: "<collectionId>/<group path>" or "styles/<path>"; "" path → title is the category label
export interface StyleguideCategory {
  id: string; label: string; order: number;   // built-ins 10…100 in the spec's order
  groups(store: TokenStore, doc: CanvasDocument): SheetGroup[]; // [] → the category is empty (no sheet); Cover always one group
  defaultTemplate: string;
}
export type TemplateOptionSpec =
  | { id: string; label: string; type: "boolean"; default: boolean }
  | { id: string; label: string; type: "number"; default: number; min: number; max: number; step?: number }
  | { id: string; label: string; type: "select"; default: string; choices: { value: string; label: string }[] }
  | { id: string; label: string; type: "font"; default: string };
export interface StyleguideTemplate {
  id: string; category: string; label: string; description: string;
  options: readonly TemplateOptionSpec[];
  /** The group's body: specs of generated nodes (see spec-builders). Pure. */
  build(group: SheetGroup, options: Readonly<Record<string, unknown>>, context: SheetBuildContext): GeneratedSpec[];
}
export interface SheetBuildContext {
  store: TokenStore; meta: DocumentMeta;
  today: string;                                    // local YYYY-MM-DD, set by the sync (templates stay pure; a cover rebuilds at most once a day)
  modes: ModeContext;                               // the node's own modes (sheet's, plus a mode column's)
  resolve(variableId: string): ResolvedValue | null; // resolveVariable(store, id, modes)
  pathOf(record: VariableRecord | StyleRecord): string; // "Collection/group/name" or the style's name
}
export interface GeneratedSpec {
  key: string;                         // unique within the sheet; prefixed by the builders with the group's id
  args: ToolArgs;                      // an agent create_nodes spec: type, name, w, h, fills, text, layout, sizing, …
  bindings?: Record<string, string>;   // path → variable or style id
  variableModes?: Record<string, string>;
  children?: GeneratedSpec[];
}
export const styleguideCategories: ExtensionPoint<StyleguideCategory>; // keyed by id ("design.styleguideCategories")
export const styleguideTemplates: ExtensionPoint<StyleguideTemplate>;  // keyed by id ("design.styleguideTemplates")
export function templateChoice(
  settings: StyleguideSettings | undefined, sheet: TokenSheet, groupId: string, category: StyleguideCategory,
  templates: (id: string) => StyleguideTemplate | undefined,
): { template: StyleguideTemplate; options: Record<string, unknown> }; // element → "cat:group" → "cat" → category.defaultTemplate; options = template defaults ⟵ stored
export function variableGroups(variables: readonly VariableRecord[], store: TokenStore): SheetGroup[]; // per collection, leaf groups by path (groupTree), in order
export function styleGroups(styles: readonly StyleRecord[]): SheetGroup[];
```

- [ ] **Step 1:** Write the types and points. The points live on the engine side (plain TS), so the hook and the agents can read them. They are registered through the design's module host, and React reads them with `useModuleHost`.
- [ ] **Step 2:** `templateChoice` ignores a stored template id that's missing, or whose `category` differs, and falls back down the chain. Stored options keep only the keys the template declares, with values of the declared type.
- [ ] **Step 3:** `pnpm typecheck && pnpm lint` passes.

### Task 4: Building a sheet's content

**Files:**

- Create: `styleguide/sheet/sheet-look.ts`, `spec-builders.ts`, `mode-columns.ts`, `build-sheet.ts`, `create-sheet.ts` (+ `.types.ts`)

**Interfaces — Produces:**

```ts
export const SHEET_LOOK: {
  font: "Inter";
  ink: "#1F2328FF";
  muted: "#6B7280FF";
  line: "#E5E7EBFF";
  surface: "#FFFFFFFF";
  heading: 40;
  title: 20;
  label: 12;
  gap: 24;
  groupGap: 48;
  padding: 64;
};
// spec-builders (all return GeneratedSpec; `key` is required)
export function stack(
  key: string,
  direction: "horizontal" | "vertical",
  children: GeneratedSpec[],
  extra?: ToolArgs,
): GeneratedSpec; // hug frame with auto layout, no fill
export function box(
  key: string,
  w: number,
  h: number,
  extra?: ToolArgs,
  bindings?: Record<string, string>,
): GeneratedSpec; // rectangle
export function dot(
  key: string,
  size: number,
  extra?: ToolArgs,
  bindings?: Record<string, string>,
): GeneratedSpec; // ellipse
export function label(
  key: string,
  text: string,
  extra?: { size?: number; color?: string; weight?: string; font?: string; width?: number },
): GeneratedSpec; // text, auto width unless width
/** A sheet's whole content: [heading, group sections…] for a category, or one group's section. */
export function buildSheet(input: BuildSheetInput): GeneratedSpec[];
export interface BuildSheetInput {
  sheet: TokenSheet;
  category: StyleguideCategory;
  groups: SheetGroup[];
  settings?: StyleguideSettings;
  templates(id: string): StyleguideTemplate | undefined;
  context: Omit<SheetBuildContext, "modes" | "resolve">;
  modes: ModeContext;
}
/** With modeView "all": one column per mode of the axis the group's variables vary by, each a stack with `variableModes`. */
export function modeColumns(
  group: SheetGroup,
  store: TokenStore,
  base: ModeContext,
  build: (modes: ModeContext, prefix: string) => GeneratedSpec[],
): GeneratedSpec[];
export function createSheet(
  source: { category: string; group?: string },
  at: Point,
  index: string,
  parentId: string | null,
): FrameElement; // a frame named after the source, white, padding 64, vertical hug layout, sheet.hash ""
```

- [ ] **Step 1:** In a category sheet, the heading is the category label at `heading` size, except Cover, which has none. Each non-hidden group is a section: its title at `title` size (left out when the category has one group with an empty path), then the template body. A group sheet holds only that section. Keys are `group:<groupId>/<template key>`, so bodies never collide.
- [ ] **Step 2:** `modeColumns` picks the first axis any of the group's variables vary by (`axisId`). Without one, it returns the plain body. Each column is a stack whose `variableModes` sets `{ [axis]: mode }`, and whose title is the mode name, with keys prefixed `mode:<modeId>/`. `context.resolve` inside a column uses the merged modes, so texts showing values agree with the swatches.
- [ ] **Step 3:** Values shown as text (hex, numbers, font names) come from `context.resolve`. A swatch's paint is `fills: [solid of the resolved color]` with `bindings: { "fills.0.color": id }`. A style sample is bound at `textStyle`/`fills`/`effects`/`strokeStyle`. Names are plain text (spec).
- [ ] **Step 4:** `pnpm typecheck && pnpm lint` passes.

### Task 5: Reconciling and the sync

**Files:**

- Create: `styleguide/sheet/reconcile-sheet.ts`, `stack-system-sheets.ts`, `styleguide/system/ensure-system-page.ts`, `system/sync-styleguide.ts`; modify `styleguide.module.ts` (contribute `afterEdit`)

**Interfaces — Produces:**

```ts
/** Writes `specs` as the sheet's children: matched by `generated.key`, built new with `kind.buildNode`, patched, re-indexed, the rest removed. */
export function reconcileSheet(
  doc: CanvasDocument,
  kinds: ElementKinds,
  sheet: FrameElement,
  specs: GeneratedSpec[],
  options: DesignToolOptions,
): void;
/** The system page and its category sheets as the tokens call for (created/removed); returns the page or undefined. */
export function ensureSystemPage(
  doc: CanvasDocument,
  store: TokenStore,
  categories: readonly StyleguideCategory[],
): PageElement | undefined;
export function stackSystemSheets(
  doc: CanvasDocument,
  page: PageElement,
  order: readonly string[],
): void; // x 0, y running, gap 200, only patches what moved
export function syncStyleguide(
  doc: CanvasDocument,
  change: EditedChange,
  kinds: ElementKinds,
  host: StyleguideSources,
): void;
export interface StyleguideSources {
  categories(): readonly StyleguideCategory[];
  template(id: string): StyleguideTemplate | undefined;
  options(): DesignToolOptions;
}
```

- [ ] **Step 1:** Write `reconcileSheet`. For each spec, depth first: `kind.buildNode(elementSpec(args), index, context)` (a `NodeBuildContext` whose `nameFor` returns its base), then set `parentId`, the sheet's `pageId`, `generated: { sheet: sheet.id, key }`, `locked: true`, `bindings` and `variableModes`. An existing node of the same key and type is patched with the fields that differ, leaving out `id`, `x`, `y`, `index`, and **every field that is the root of one of its bindings** (the token sync writes those: Review Focus 2). A key whose type changed is removed and added again. Siblings get fresh indexes (`generateNKeysBetween`) only when their order changed. Generated nodes of this sheet that aren't in the specs are removed, with their descendants. The sheet's own `layout` and `sizing` are re-set to the `createSheet` ones; its paints and name stay the user's.
- [ ] **Step 2:** Write `ensureSystemPage`. When the store has no variables or styles: remove the system page, its nodes and nothing else. Otherwise, add the page (named "Design system", `hidden: true`, `styleguide: { order: [], hidden: [], choices: {} }`, index after the last page) if it's missing. Add a sheet per category whose `groups` aren't empty and that isn't hidden, and remove the sheets of empty or hidden categories. Use `doc.add`, never untracked: Review Focus 3.
- [ ] **Step 3:** Write `syncStyleguide`. Return early when nothing is relevant: no `change.tokens`, `!change.meta`, no updated or removed sheet, generated node or system page, and no `variableModes` in `change.before`. Then `ensureSystemPage`. Then build each sheet of the document whose gate applies (all sheets on a token, meta or modes change; else the updated ones). Hash `JSON.stringify(specs)` with `hashText`, and reconcile and write `sheet.hash` only when it differs. Then `stackSystemSheets`. Sheets on other pages are built with `DESIGN_TOKEN_CONTEXT.modesOf(doc, sheet)`.
- [ ] **Step 4:** Check Review Focus 3. Pass 1 regenerates. Auto layout resizes. Pass 2's gate passes (the sheet was updated), but its hash is unchanged, so only stacking moves sheets. Pass 3 does nothing. Check Review Focus 4: a pasted sheet is `updated` and its `hash` is from another file's content, so it rebuilds. Children keep `generated.sheet`, remapped by `remapIds`. `pnpm typecheck && pnpm lint` passes.

### Task 6: Built-in categories

**Files:**

- Create: `styleguide/categories/{cover,colors,typography,spacing,radius,effects,strokes,paint-styles,opacity,other}.category.ts`, `categories/index.ts` (`BUILT_IN_CATEGORIES`)
- Modify: `styleguide.module.ts` (contribute them)

What each one takes (`groups`):

| id           | order | items                                                                       | default template     |
| ------------ | ----- | --------------------------------------------------------------------------- | -------------------- |
| cover        | 10    | one group, no items (uses `meta`)                                           | `cover.title`        |
| colors       | 20    | color variables, not hidden                                                 | `colors.swatch-grid` |
| typography   | 30    | text styles, then string variables scoped `font-family`/`font-style`        | `typography.scale`   |
| spacing      | 40    | numbers with purpose `spacing`                                              | `spacing.bars`       |
| radius       | 50    | purpose `radius`                                                            | `radius.corners`     |
| effects      | 60    | effect styles                                                               | `effects.cards`      |
| strokes      | 70    | stroke styles, then purpose `stroke` numbers                                | `strokes.lines`      |
| paint-styles | 80    | paint styles                                                                | `paint.swatches`     |
| opacity      | 90    | purpose `opacity`                                                           | `opacity.checker`    |
| other        | 100   | strings not in typography, booleans, numbers with purpose `font` or `other` | `other.table`        |

- [ ] **Step 1:** Write each with `variableGroups` or `styleGroups`. Hidden variables (`hidden`) are left out everywhere.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint` passes.

### Task 7: Color templates

**Files:** Create `styleguide/templates/colors/{ramp-strip,swatch-grid,cards,list,stripes,circles,contrast-pairs,mode-columns}.template.ts`, a shared `colors/color-text.ts` (`hexOf`, `rgbOf`, `hslOf` from a resolved color), `templates/colors/index.ts`

Options shared by the color templates: `showHex` (true), `showRgb` (false), `showHsl` (false), `showCode` (false; the variable's first `codeSyntax` value), `showDescription` (false), `swatch` (number 96, 32–240), `columns` (number 6, 1–12; grid and cards only), `font` (font "Inter"). The `modeView` "all" is the sheet's own setting, not an option.

- [ ] **Step 1:** Build each with the spec builders. Names: leaf name at `label` size in ink, values in muted.
  - Ramp strip: one horizontal stack, gap 0, of joined swatches, with the name and hex under each.
  - Swatch grid: rows of `columns` cards, each a square, name and hex.
  - Cards: a square, then name, hex, rgb, code name and description, as enabled.
  - List: rows, each a 32 swatch then name, hex and description.
  - Stripes: tall bands (`swatch` × 3 high) side by side, with the label at the bottom inside the band, in black or white by `luminance`.
  - Circles: `dot`s with a name under.
  - Contrast pairs: each color as a box with "Aa" in white and in black, each with its ratio and `contrastGrade` badge text. Option `pairWith`: "white-black" (default) or a select of the group's colors.
  - Mode columns: the swatch grid per mode, forced through `modeColumns` whatever the sheet's `modeView`.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint` passes.

### Task 8: The other templates

**Files:** Create one file each under `styleguide/templates/`:

- `typography/{specimen,scale,paragraph,table}`
- `spacing/{bars,squares,table}`
- `radius/{corners,table}`
- `strokes/{lines,boxes}`
- `effects/{cards,elevation}`
- `paint/{swatches,cards}`
- `opacity/{checker,table}`
- `other/table`
- `cover/{title,minimal}`

Also create a shared `templates/table-rows.ts` (`tableRows(columns, rows)`: a vertical stack of horizontal stacks with fixed column widths and a line between rows), and `templates/index.ts` (`BUILT_IN_TEMPLATES`). Modify `styleguide.module.ts` to contribute them.

- [ ] **Step 1:** Typography:
  - Specimen: "Aa" at 96 in the style's family, then the family and the weights the text styles of that family use.
  - Scale: each style as a text bound at `textStyle` (sample text option, default "The quick brown fox"), with the name and "16/120%" (`textStyleSummary`).
  - Paragraph: a 480-wide paragraph per style.
  - Table: name, family, size, line height, letter spacing.

  Font-family string variables show their value set in that family.

- [ ] **Step 2:** Spacing:
  - Bars: a bar of width bound at `w` to the variable (number), with the name and value.
  - Squares: nested squares, largest outside.
  - Table.

  Radius:
  - Corners: a 96 box whose `cornerRadius` is bound to the variable.
  - Table.

  Strokes:
  - Lines: a 240×0 line, or a box with a top stroke, bound at `strokeStyle` for styles and at `strokeWeight` for numbers.
  - Boxes: 96 boxes with the stroke.

- [ ] **Step 3:** Effects:
  - Cards: a 160×120 white card bound at `effects`, with the name.
  - Elevation: the same cards in one row, in name order.

  Paint:
  - Swatches: a 96 box bound at `fills` (gradients and images show as they are).
  - Cards: the swatch with its name and `paintStyleSummary`.

  Opacity:
  - Checker: a gray square behind an ink square whose `opacity` is bound.
  - Table.

  Other:
  - Table: name, type, value per the current mode ("True"/"False" for booleans).

  Cover:
  - Title: the file's title (or "Design system") at 64, its description, and `context.today`.
  - Minimal: the title only.

- [ ] **Step 4:** `pnpm typecheck && pnpm lint` passes.

### Task 9: The mode, its tool and the scope switch

**Files:**

- Create: `styleguide/mode/{styleguide-mode.constants,styleguide-mode,styleguide.tool,styleguide-allowed-commands}.ts`, `ui/hooks/use-styleguide-scope.ts`, `ui/empty/styleguide-empty.tsx`
- Modify: `styleguide.module.ts`

**Interfaces — Produces:**

```ts
export const STYLEGUIDE_MODE_ID = "styleguide";
export const STYLEGUIDE_TOOL = "styleguide-select";
export const STYLEGUIDE_MODE: CanvasMode; // tool STYLEGUIDE_TOOL, tools ["hand"], isolate: (el) => isSheet(el) && el.parentId === null, commands STYLEGUIDE_ALLOWED_COMMANDS
export class StyleguideTool extends SelectTool {} // resizeMode "none", movesSelection false, Delete does nothing
```

- [ ] **Step 1:** The allowed commands are the Catalog list without `deleteSelection`, `previousPage`, `nextPage` and the Catalog commands, plus `export`, `copyAsPng` and the styleguide host commands (Task 12).
- [ ] **Step 2:** `useStyleguideScope`, a session hook:
  - Entering the mode remembers `engine.scope` and calls `setScope(systemPage.id)` when the page exists.
  - Leaving goes back to the remembered page (or the first page).
  - The system page shown outside the mode (a collaborator followed there) enters the mode.
  - A system page that appears while the mode is on is shown.

  It never writes the document.

- [ ] **Step 3:** Contribute the `designEditor.modes` entry: `"Design system"`, "Your variables and styles as a living style guide.", the `Palette` icon, order 20. Also contribute the mode, the tool, the session hook, and an overlay `StyleguideEmpty`. While the mode is on and there's no system page, the overlay shows a kit `EmptyState` with "Add a color" (`DOCUMENT_TOKENS` creates a color variable in the first collection, or in a new "Colors" collection), "Generate a palette" (opens the Variables window on the generator: `openWindowAt` / the window store) and "Import tokens" (disabled, "Coming soon").
- [ ] **Step 4:** `pnpm typecheck && pnpm lint` passes.

### Task 10: The styleguide service and the left tab

**Files:**

- Create: `styleguide/model/design-styleguide.ts` (+ `.types.ts`), `ui/tab/{styleguide-tab,category-row,group-row}.tsx`, `ui/stores/styleguide-view-store.ts` (+ `.types.ts`), `ui/hooks/use-styleguide.ts`
- Modify: `styleguide.module.ts`

**Interfaces — Produces:**

```ts
export const DESIGN_STYLEGUIDE: ServiceDef<DesignStyleguide>;
export class DesignStyleguide {
  // DocumentFeed on tokens + sheets + the system page; subscribe/getVersion
  page(): PageElement | undefined;
  settings(): StyleguideSettings; // defaults when there's no page
  outline(): {
    category: StyleguideCategory;
    groups: SheetGroup[];
    sheetId?: string;
    hidden: boolean;
  }[]; // in user order
  setOrder(order: string[]): void;
  setHidden(key: string, hidden: boolean): void;
  setChoice(key: string, choice: TemplateChoice | null): void; // null clears an override
  setSheet(
    id: string,
    patch: Partial<Pick<TokenSheet, "category" | "group" | "template" | "options" | "modeView">>,
  ): void;
  addSheet(pageId: string, source: { category: string; group?: string }, at?: Point): string; // returns the id; `at` default: right of the page's top-level content
  convert(ids: readonly string[]): string[]; // Task 12
} // each edit one undo step; settings edits need a system page (no-op without)
// view store: selected: { category: string; group?: string } | null; select(…)
```

- [ ] **Step 1:** Write the service. Every write goes through the document, so the sync regenerates in the same step.
- [ ] **Step 2:** The Styleguide tab (`leftTabs`: id `styleguide`, label "Design system", icon `Palette`, order 10, `modes: ["styleguide"]`): kit `ListRow`s, categories with a chevron to their groups.
  - Clicking a category selects its sheet and zooms to it (`engine.zoomToSelection`).
  - Clicking a group sets the view store and shows the generated section frame (`generated.key === "group:<id>"`) with `engine.showViewport`.
  - A kit `Checkbox` per row calls `setHidden`.
  - Category rows drag to reorder (pointer drag past `MOVE_THRESHOLD_PX`, like the pages list) and call `setOrder`.
  - Selecting a sheet on the canvas updates the view store.
- [ ] **Step 3:** `pnpm typecheck && pnpm lint` passes.

### Task 11: Template picker, options and the sidebars

**Files:**

- Create: `ui/preview/spec-preview.tsx` (+ types), `ui/picker/{template-picker,template-card,template-options,option-field}.tsx`, `ui/sidebar/{styleguide-sidebar,sheet-section,source-fields}.tsx`, `ui/hooks/use-sheet-preview.ts`
- Modify: `styleguide.module.ts`

**Interfaces — Produces:**

```ts
/** A DOM drawing of generated specs (frames as flex boxes with their gaps and padding, boxes, dots, texts), scaled to fit `width`. */
export function SpecPreview(props: {
  specs: GeneratedSpec[];
  width: number;
  height: number;
}): JSX.Element;
export function useSheetPreview(
  category: string,
  groupId: string | undefined,
  template: string,
  options: Record<string, unknown>,
): GeneratedSpec[]; // buildSheet with the live store, memoized on tokensVersion
```

- [ ] **Step 1:** `TemplatePicker` shows the category's templates as `SelectableCard`s, each with a `SpecPreview` of the real tokens, at most 4 groups so it stays cheap. `TemplateOptions` renders the chosen template's `options` with kit controls: `Checkbox`, `NumberInput`, `Select`, and the design's `FontPicker`. Option edits on a scrub are one undo step (`useScrubUndo`).
- [ ] **Step 2:** `StyleguideSidebar` (`modeSidebars`, mode `styleguide`) works on the view store's selection:
  - A category: picker → `setChoice("<cat>")`.
  - A group: picker → `setChoice("<cat>:<group>")`, with "Use the category's" clearing it.

  Each has "Show modes side by side", a `Switch` that sets the system sheet's `modeView`. Nothing selected: the outline's counts and the "Export whole system as PDF" button (Task 12).

- [ ] **Step 3:** `SheetSection` is a `propertySections` entry: tab design, order 5, `when` = every selected node `isSheet`. It shows `SourceFields` (category `Select`, group `Select` with "Whole category"), the picker writing `setSheet(template, options)` with "Use the default" for `null`, the modes switch, and "Convert to design". The Frame section stays for its size and fill.
- [ ] **Step 4:** `pnpm typecheck && pnpm lint` passes.

### Task 12: Placing, converting, menus and exports

**Files:**

- Create: `styleguide/tool/token-sheet.tool.ts`, `styleguide/model/convert-sheet.ts`, `styleguide/model/export-system.ts`, `ui/hooks/{use-styleguide-commands,use-export-system}.ts`, `ui/add-to-page-menu.tsx`
- Modify: `styleguide.module.ts`

**Interfaces — Produces:**

```ts
export const TOKEN_SHEET_TOOL = "token-sheet"; // key Shift+D, in the toolbar's `frames` menu with Frame and Section
export class TokenSheetTool implements Tool {} // click: addSheet at the point (inside `parentFor`'s container, source: the first non-empty category), select it, back to select
export function convertSheets(doc: CanvasDocument, ids: readonly string[]): string[]; // removes `sheet`; for each generated descendant removes `generated` and `locked`; returns the converted ids
export async function exportSystem(
  workspace: DesignWorkspace,
  onProgress?: (done: number, total: number) => void,
): Promise<Blob>;
// each visible category sheet in order → workspace.exportElements({ format: "jpg", background: "solid", area: "board", ids: [id], rect: bounds, scale: 2 }) → encodePdfPages(pages with size = sheet w×h, { pointsPerUnit: 0.75 })
export const STYLEGUIDE_COMMANDS = {
  convert: "styleguide.convert",
  exportSystem: "styleguide.exportSystem",
  exportSection: "styleguide.exportSection",
  addToPage: "styleguide.addToPage",
} as const;
```

- [ ] **Step 1:** `convertSheets` is one undo step (`DesignStyleguide.convert` checkpoints). Binding fields stay untouched. Converting a system sheet isn't allowed: those are kept by the sync. The command is disabled in the mode, and the service throws.
- [ ] **Step 2:** Context menu group, via the `contextMenu` point with label "Design system":
  - Export this section…: selects the sheet, then runs `export`, which opens the existing `ExportDialog`.
  - Export whole system as PDF: `useExportSystem`, through `runWithLoading` and `exportFile`, in a workspace `styleguide:export`, like `useExportBrochure`.
  - Add to page ▸: a submenu of the user's pages → `addSheet(page, source)`, then a toast "Added to <page>".
  - Convert to design (outside the mode).

  Show the group for sheets only. Add a "Design system…" main menu item that enters the mode.

- [ ] **Step 3:** Check Review Focus 5. After converting, `hostSelectTarget` no longer redirects, `visibleRows` lists the layers, `requireNodes` accepts them, and the sync's gate leaves them alone (no `sheet`, no `generated`). `pnpm typecheck && pnpm lint` passes.

### Task 13: Agent tools

**Files:** Create `styleguide/agent/{styleguide-read,styleguide-edit}.agent-tools.ts`, `agent/index.ts`; modify `styleguide.module.ts` (`designAgentTools`, id `styleguide`), `products/design/agent/design-agent-instructions.ts` (or wherever `DESIGN_AGENT_INSTRUCTIONS` lives)

- `get_design_system`: the outline (categories in order with hidden flags, groups with item counts, the template and options in effect), the system page id, the templates per category with their options, and the live elements on every page (`id`, `page`, source, template).
- `set_system_template`: `{ category, group?, template?, options?, clear? }` → `setChoice`; or `{ element, template?, options?, modeView? }` → `setSheet`. Unknown templates and options are errors listing the valid ones.
- `add_system_element`: `{ category, group?, page?, x?, y?, template?, options?, modeView? }` → the new id.
- `convert_system_element`: `{ ids }`.
- `summarizeElement`: a sheet reports `sheet: { category, group, template }`, and generated nodes report `generated: true`.

- [ ] **Step 1:** Write the tools, each wrapping its writes in `asUndoStep`. Add an instructions paragraph saying that live elements are generated, how to read and change them, and that `convert_system_element` makes their layers editable.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint` passes.

### Task 14: Documentation and final checks

- [ ] **Step 1:** In `CLAUDE.md`'s design section:
  - Change the Variables paragraph to "phases 1–3" and drop "the Design System view and its live element" from its "Not yet".
  - Add a **Design system** bullet, in the doc's style, covering the system page, the background scopes, sheets, generated marks, the points, the templates, the sync, the mode, the tab, the sidebar, the tool, convert, the exports and the agents.

  In the canvas engine section, mention `CanvasScopes.background` and `EditedChange.meta`.

- [ ] **Step 2:** `pnpm lint && pnpm typecheck && pnpm format:check` passes (`pnpm format` first if needed).
