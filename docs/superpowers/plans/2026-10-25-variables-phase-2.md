# Variables — Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** String and boolean variables bind text content, fonts, visibility, clip content, ignore auto layout and mask invert. Paint, effect and stroke styles join text styles, and text styles also work on ranges of a text. Styles can use variables, which resolve in each layer's modes. All of it is managed in the panel, the Variables window and the Styles section, and through agent tools.

**Architecture:** This builds on phase 1's engine (`src/canvas/tokens/`). A style is still a `StyleRecord` bound at one path of an element. The record gains its own `bindings` (path inside its `value` → variable id), so `resolveVariable` returns the style's value with those variables resolved in the layer's modes, and the `BindingIndex` follows variable → style → layer. Style bindings sit at virtual paths: `textStyle`, `strokeStyle`, `runs.textStyle.<styleId>`, plus the real `fills`/`strokes`/`effects`. The sync keeps a binding while the kind lists its path in `bindable(el)`, no longer while `readPath` finds the field; that same change fixes a phase-1 bug where text styles were dropped. The design's style types live in `modules/core/styles/` on the engine side, and each section's module contributes the style's UI to `designStyleTypes`.

**Tech Stack:** TypeScript (strict, `noUncheckedIndexedAccess`), Yjs, React 19, Zustand, Radix/shadcn, Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-10-24-variables-design-system-design.md` (phase 2: "Strings, booleans and styles"; sections "Styles" and "Variables per product"). Phase 1's plan, `docs/superpowers/plans/2026-10-24-variables-phase-1.md`, is the record of what exists.

## Global Constraints

- There is **no test framework**: every task's verification is `pnpm typecheck` and `pnpm lint` (and `pnpm format:check` at the end). Do not run `tauri dev`, cargo, builds or browser checks.
- Layering (ESLint-enforced): `src/canvas/tokens/` and the design's engine files are plain TS. React only in `ui/` folders and `*.module.ts`; shared React token pieces in `src/canvas-ui/tokens/`.
- Every `interface`/`type` in a sibling `.types.ts`, imported with `import type`; barrels re-export with `export type`. One component/helper per file; split past ~200 lines. **No giant `.tsx` files** (user): split into smaller components.
- All edits through `CanvasDocument`/`DocumentTokens`, one undo step per user action (`checkpoint()` first). Never canvas content in React or Zustand state.
- Semantic tokens only; radii 4px controls / 6px menus; no pills; light theme only.
- Never branch on `el.type` outside an element's folder: ask its kind.
- Commit only when the user asks; each task ends at a green `pnpm typecheck && pnpm lint`.
- Spec values: variable types are `color`, `number`, `string`, `boolean`. String fields are text content, font family and font style. Boolean fields are visible, clip content, `layoutAbsolute` and mask inverted. Styles: paint (a `Paint[]` whose colors and stop colors may be variables; applies to fills or strokes), text (whole text or a run), effect (a `NodeEffect[]`; colors and numbers may be variables), stroke (weight and per-side weights, align, dashes, cap, join, miter; not the paints). Styles have no modes of their own; their variables resolve in the **layer's** mode context. Writing any field a style sets unlinks the style (the detach rule).

## Review Focus

1. **A style that uses a variable in a Dark frame:** changing the variable, or switching that frame's mode, restyles only the layers whose modes pick it. A light layer and a dark layer bound to the same "Shadow / elevated" style show different colors. Owned by Task 3, which pins it with the `resolveVariable` checks in its Step 4.
2. **Editing a styled stack by hand** (dragging a paint's color, adding an effect, changing a stroke's dash on a layer with a stroke style) unlinks the style and keeps what was typed, and the section then shows the plain list. A sync-written value never unlinks. Owned by Tasks 1 and 5.
3. **Typing into a text whose content is bound** to a string variable unlinks it and keeps the typed text. A string variable written into a text that has runs moves or clears them with `text.set`, never leaving runs past the end. Owned by Task 4.
4. **Run text styles survive typing** before, inside and after the styled range, and undo and redo. Changing a styled range's size by hand unlinks only that range. When no run carries a style any more, its binding goes. Owned by Task 6.
5. **Deleting a variable a style uses** keeps the style's last value, and the layers keep their look. Deleting a style in use keeps the layers' look. Pasting layers into another file brings their styles and the variables those styles use. Owned by Task 3.

---

## File Structure

```
src/canvas/tokens/
  token.types.ts            (modify) VariableType += string|boolean; TokenValue += {string}|{boolean};
                            ResolvedValue += string|boolean; TokenScope += text-content|font-family|font-style;
                            StyleRecord.bindings?
  token-value-fields.ts     (new) the fields a resolved value writes at a path (shared by kinds and styles)
  resolve-style.ts          (new) a style's value with its variables resolved in a mode context
  default-value.ts          (modify) defaultValueOf(type)
  is-token-record.ts        (modify) validates the new values and style bindings
  resolve-token.ts          (modify) strings, booleans, styles through resolveStyle
  token-store.ts            (modify) styleUsers(variableId)
  binding-index.ts          (modify) affectedBy follows variable → style → element
  sync-tokens.ts            (modify) keep bindings by bindable paths
  detach-bindings.ts        (modify) overlapping paths replaced; detachEverywhere also unlinks styles
  document-tokens.ts        (modify) bindStyleField, updateStyle drops overwritten style bindings
  clipboard-tokens.ts       (modify) styles' variables travel with them
src/canvas/elements/element.kind.ts   (modify) bindValues via tokenValueFields
src/products/design/modules/core/styles/      (new, engine) paint-style.ts, effect-style.ts,
                            stroke-style.ts, style-paths.ts, index.ts (+ .types.ts)
src/products/design/modules/core/node/        (modify) design-node.kind.ts, node-bindable.ts
src/products/design/modules/frame/frame.kind.ts, text/text.kind.ts, text/text-face-name.ts (new),
  text/run-style-bindings.ts (new), text/apply-run-style.ts (new)
src/products/design/modules/variables/ui/style-control/   (new) StyleControl, StyleChip, StyleList,
                            useStyleBinding, style-preview
src/products/design/modules/core/ui/sections/paint-stack-editor.tsx (new; PaintListSection uses it)
src/products/design/modules/core/ui/styles/   (new) paint and stroke style rows and editors
src/products/design/modules/effects/ui/effect-stack-editor.tsx (new), ui/styles/ (new)
src/products/design/modules/variables/ui/…    (modify) string/boolean values, cards, rows
src/products/design/modules/variables/agent/  (modify) styles-create/-update tools, values, paths
```

---

### Task 1: Style bindings stay, and bindings don't overlap

Phase-1 bug: `resolvedPatch` (`sync-tokens.ts`) drops a binding when `readPath(el, path)` is `undefined`. That is always true for `textStyle`, so a text style is unlinked in the very edit that binds it.

**Files:** Modify `src/canvas/elements/element.kind.ts`, `src/canvas/tokens/sync-tokens.ts`, `src/canvas/tokens/detach-bindings.ts`

**Interfaces — Produces:**

```ts
// ElementKind
bindsPath(el: E, path: string): boolean; // default: this.bindable(el).some((f) => f.path === path)
// detach-bindings.ts
export function pathsOverlap(a: string, b: string): boolean; // equal, or one is the other's `prefix.` ancestor
```

- [ ] **Step 1:** In `resolvedPatch`, keep a binding when `kind.bindsPath(current, path)`, and drop it otherwise. The kind's list already leaves out a removed paint or stop, so stack removals still drop their bindings. Compute the bindable paths once per element (a `Set`), not per binding.
- [ ] **Step 2:** In `setBindings`, binding `path` first removes every binding with `pathsOverlap(path, other)`. A `fills` paint style replaces the `fills.0.color` variables, and binding `fills.0.color` replaces a `fills` style.
- [ ] **Step 3:** `pnpm typecheck && pnpm lint` — pass.

### Task 2: String and boolean variables in the engine

**Files:** Modify `token.types.ts`, `default-value.ts`, `is-token-record.ts`, `resolve-token.ts`, `variable-edits.ts`; create `token-value-fields.ts` (+ export in `index.ts`); modify `element.kind.ts`

**Interfaces — Produces:**

```ts
export type VariableType = "color" | "number" | "string" | "boolean";
export type TokenValue =
  | { color: string } | { number: number } | { string: string } | { boolean: boolean } | { alias: string };
export type ResolvedValue = …existing | { type: "string"; string: string } | { type: "boolean"; boolean: boolean };
// TokenScope adds "text-content" | "font-family" | "font-style" (booleans take no scope, as in Figma)
export function defaultValueOf(type: VariableType): TokenValue; // #000000FF, 0, "", false
/** The stored values `value` gives the field at `path` of `container` (a color sets a sibling `opacity` from its alpha). */
export function tokenValueFields(container: object, path: string, value: ResolvedValue): Record<string, unknown>;
```

- [ ] **Step 1:** Add the types. `isTokenRecord` accepts `{ string }` and `{ boolean }` values only on variables of that type. `resolveVariable` returns them like numbers. `createVariable` without a value uses `defaultValueOf(type)`.
- [ ] **Step 2:** Move the body of `ElementKind.bindValues` (except the style case) into `tokenValueFields`, with string → `{ [path]: string }` and boolean → `{ [path]: boolean }`. `bindValues` calls it.
- [ ] **Step 3:** Check the generators: shade and scale code must still only handle `color`/`number`, and the type checks in `setValue` and alias checks must already compare types generically. Fix any exhaustive `switch` that `tsc` flags.
- [ ] **Step 4:** `pnpm typecheck && pnpm lint` — pass.

### Task 3: Styles that use variables

**Files:** Create `src/canvas/tokens/resolve-style.ts`; modify `token.types.ts` (`StyleRecord.bindings?: Record<string, string>`), `is-token-record.ts`, `resolve-token.ts`, `token-store.ts`, `binding-index.ts`, `detach-bindings.ts`, `document-tokens.ts`, `document-tokens.types.ts`, `clipboard-tokens.ts`

**Interfaces — Produces:**

```ts
/** The style's value with each bound path set from its variable in `modes` (unresolvable ones keep the stored value). */
export function resolveStyle(store: TokenStore, style: StyleRecord, modes: ModeContext): Record<string, unknown>;
// TokenStore
styleUsers(variableId: string): Set<string>; // ids of styles binding it, or an alias of it
// DocumentTokens
bindStyleField(styleId: string, path: string, variableId: string | null): void; // one undo step; overlapping paths replaced (pathsOverlap); writes the resolved value into `value` at the file's modes
```

- [ ] **Step 1:** `resolveVariable` returns `{ type: "style", styleType, value: resolveStyle(store, style, modes) }`. `resolveStyle` applies `tokenValueFields(value, path, resolved)` with `setPathsPatch`, so a style's `paints.0.color` also sets `paints.0.opacity`. A style variable that is itself a style resolves to `null`.
- [ ] **Step 2:** `BindingIndex.affectedBy(tokenIds)`: after it adds the alias dependents, add `store.styleUsers(id)` for each variable, then the elements bound to those styles. A changed style id is already covered.
- [ ] **Step 3:** `updateStyle(id, { value })` drops style bindings whose path's value the patch changed. To check, compare `readPath(old.value, path)` with `readPath(new.value, path)`, after `tokenValueFields`, so writing the same resolved value keeps the binding. `deleteVariables`/`deleteTokens` also strip the deleted ids from styles' `bindings`, and the styles keep their stored values. `clipboardTokens` adds the variables (and their alias targets and collections) that copied styles bind.
- [ ] **Step 4:** Check by reading the code against Review Focus 1: the store has axis Theme (Light, Dark) and variable `shadow` with default `#00000033` and Dark `#000000AA`, and a style binds `effects.0.color` to it. `resolveVariable(store, styleId, {})` must give a style value whose `effects.0.opacity` is `0.2`, and `resolveVariable(store, styleId, { [theme]: dark })` must give `0.667`. `pnpm typecheck && pnpm lint` — pass.

### Task 4: Design string and boolean fields

**Files:** Modify `modules/core/node/node-bindable.ts` (`stringField`, `booleanField`), `design-node.kind.ts`, `frame/frame.kind.ts`, `text/text.kind.ts`; create `text/text-face-name.ts`

**Interfaces — Produces:**

```ts
export function stringField(path: string, scope: TokenScope, label: string): BindableField;
export function booleanField(path: string, label: string): BindableField; // scopes: []
/** A face name ("Bold Italic", "700 italic", "Light") as a weight and style; unknown words are ignored. */
export function faceFromName(name: string): {
  fontWeight?: FontWeight;
  fontStyle: "normal" | "italic";
};
```

- [ ] **Step 1:** `DesignNodeKind.bindable` adds `visible` ("Visible") and `layoutAbsolute` ("Ignore auto layout"). It adds `maskInverted` ("Invert mask") only while `el.isMask`. Frames add `clipsContent` ("Clip content").
- [ ] **Step 2:** The text adds `text` (`text-content`, "Text"), `fontFamily` (`font-family`, "Font") and `fontStyle` (`font-style`, "Font style"). Its `bindPatch` for `text` goes through `this.text.set(el, value.string)` (runs move) and then `retypeset`. `fontStyle` writes `faceFromName(value.string)` (weight and style) and is laid out again like the other typography paths (add `fontFamily` and `fontStyle` to `TYPOGRAPHY_PATHS`). Use the weight names in `@shared/core` fonts (`FONT_WEIGHTS` and their names) in `faceFromName`.
- [ ] **Step 3:** Check by reading the code against Review Focus 3. A sync-written `text` keeps the binding, because `bindValues(el, "text", v)` is `{ text: v }` and equals what `set` stored. A typed text unlinks it.
- [ ] **Step 4:** `pnpm typecheck && pnpm lint` — pass.

### Task 5: Paint, effect and stroke styles (engine side)

**Files:** Create `src/products/design/modules/core/styles/` with `style-paths.ts`, `paint-style.ts`, `effect-style.ts`, `stroke-style.ts`, `index.ts` and their `.types.ts`; modify `design-node.kind.ts`, `node-bindable.ts`, the `@design` barrel

**Interfaces — Produces:**

```ts
export const PAINT_STYLE = "paint", EFFECT_STYLE = "effect", STROKE_STYLE = "stroke";
export const STROKE_STYLE_PATH = "strokeStyle"; // fills/strokes/effects styles bind at their field
export interface PaintStyleValue { paints: Paint[] }
export interface EffectStyleValue { effects: NodeEffect[] }
export interface StrokeStyleValue { strokeWeight: number; strokeWeights?: BoxSides; strokeAlign; strokeCap; strokeJoin; strokeMiterAngle; strokeDashes }
export function readPaintStyle(value: Readonly<Record<string, unknown>>): PaintStyleValue | null; // array of objects with a known paint `type`
export function readEffectStyle(value: …): EffectStyleValue | null;
export function readStrokeStyle(value: …): Partial<StrokeStyleValue>;
export function paintStyleOfNode(node: DesignNode, field: "fills" | "strokes"): PaintStyleValue;
export function effectStyleOfNode(node: DesignNode): EffectStyleValue;
export function strokeStyleOfNode(node: DesignNode): StrokeStyleValue;
export function paintStyleSummary(style: StyleRecord): string;  // "#3B82F6", "Linear", "3 paints"
export function effectStyleSummary(style: StyleRecord): string; // "Drop shadow", "2 effects"
export function strokeStyleSummary(style: StyleRecord): string; // "2 · Inside · Dashed"
```

- [ ] **Step 1:** `DesignNodeKind.bindable` adds style fields of `type: "style"`. Fillable kinds add `fills` (`styleType: "paint"`) and strokable ones `strokes`. Every node gets `effects` (`"effect"`), and strokable kinds `strokeStyle` (`"stroke"`).
- [ ] **Step 2:** `bindValues` for a style value whose `styleType` matches the path, else `{}`:
  - Paint styles write the field, filtered like `nodeStylePatch`: image paints are left out of strokes and out of kinds without `imageFills`. An image paint's `assetId` comes along as-is.
  - Effect styles write `effects`.
  - Stroke styles write the fields they hold. `strokeWeights` is written only on `sidedStrokes` kinds, and otherwise `strokeWeight` alone.
- [ ] **Step 3:** `remapStackBindings` already leaves the bare `fills` path alone. Check that a stack edit on a styled field unlinks the style through the detach rule (`fills` is in `before`, so the written stack differs from the style's). Check that `stackBindingsPatch` doesn't remap the style path away.
- [ ] **Step 4:** `pnpm typecheck && pnpm lint` — pass.

### Task 6: Text styles on ranges (runs)

**Files:** Modify `text/text.types.ts` (`TextRunStyle.textStyle?: string`), `text/text.kind.ts`, `text/text-range-style.ts`, `text/text.module.ts`; create `text/run-style-bindings.ts`, `text/apply-run-style.ts`

**Interfaces — Produces:**

```ts
export const RUN_STYLE_PREFIX = "runs.textStyle."; // binding path `runs.textStyle.<styleId>` → styleId
/** The text's runs restyled from a text style for the runs carrying it. */
export function applyRunStyle(
  runs: readonly TextNodeRun[],
  styleId: string,
  value: Partial<TextStyleValue>,
): TextNodeRun[];
/** afterEdit: each updated text's bindings get exactly one `runs.textStyle.<id>` per style its runs carry. */
export function syncRunStyleBindings(doc: CanvasDocument, change: EditedChange): void;
```

- [ ] **Step 1:** `TextKind.bindable` lists `RUN_STYLE_PREFIX + id` for each distinct `textStyle` its runs carry. `bindValues` for that path gives `{ runs: applyRunStyle(...) }`, and `bindPatch` lays the text out again.
- [ ] **Step 2:** In `text-range-style.ts` (and wherever a range's typography is patched: `styleTextRange`, the Typography range target, `style_text_range`), a patch that sets a typography field without `textStyle` clears `textStyle` on those runs. That unlinks only that range (Review Focus 4). A patch carrying `textStyle: id` together with the style's fields applies it.
- [ ] **Step 3:** The text module contributes `syncRunStyleBindings` to `designCanvas.afterEdit`. It reads `doc.field(id, "runs")` only for texts in `change.updated` and writes bindings only when they differ. The afterEdit passes settle it, and the next pass's `syncTokens` resolves the new binding.
- [ ] **Step 4:** `pnpm typecheck && pnpm lint` — pass.

### Task 7: The shared style control

**Files:** Create `src/products/design/modules/variables/ui/style-control/` with `style-control.tsx`, `style-chip.tsx`, `style-list.tsx`, `style-preview.tsx`, `use-style-binding.ts` and their `.types.ts`; rewrite `text/ui/text-styles/text-style-control.tsx` on it and delete `text-style-list.tsx`

**Interfaces — Produces:**

```ts
interface StyleControlProps {
  nodes: readonly DesignNode[];
  path: string; // "fills", "strokes", "effects", "strokeStyle", "textStyle"
  styleType: string;
  createLabel: string; // "Create style from these fills"
  create: () => string | null; // a new style from the selection, its id
}
interface StyleChipProps {
  style: StyleRecord | undefined /* Mixed */;
  onDetach: () => void;
  onEdit: () => void;
}
/** One row per style type: its look, as the Styles section's rows show it. */
function StylePreview(props: { style: StyleRecord }): JSX.Element;
```

- [ ] **Step 1:** `StyleControl` is the header button (the `Grip` icon). It opens the `StyleList` of that type (searchable, group accordions) and a "Create style from …" item. It binds through `useFieldBinding(nodes, path)`.
- [ ] **Step 2:** `StyleChip` is what a section's body shows while its field is bound: `StylePreview`, the leaf name, Edit (opens the style's editor popover from its `StyleTypeEntry`) and Detach (`Unlink`).
- [ ] **Step 3:** Rebuild the text control on these. While the Typography target is a range (`useTypographyTarget().range`), picking a style applies it to the range: `engine.styleTextRange({ textStyle: id, ...readTextStyle(style.value) })`, or the editing session's equivalent.
- [ ] **Step 4:** `pnpm typecheck && pnpm lint` — pass.

### Task 8: Stack editors and the sections

**Files:** Create `core/ui/sections/paint-stack-editor.tsx` (+ types) and `effects/ui/effect-stack-editor.tsx` (+ types); modify `paint-list-section.tsx`, `fill-section.tsx`, `stroke/stroke-section.tsx`, `stroke/stroke-settings.tsx`, `effects/ui/effects-section.tsx`

**Interfaces — Produces:**

```ts
interface PaintStackEditorProps {
  paints: readonly Paint[]; mixed: boolean; label: string; allowImage: boolean;
  onChange: (paints: (current: readonly Paint[]) => Paint[], info?: ColorChangeInfo, map?: ((i: number) => number | null) | null) => void;
  bindPath?: (index: number) => string | undefined; // where each row's color binds (nodes: `fills.i.color`; styles: `paints.i.color`)
}
interface EffectStackEditorProps { effects: readonly NodeEffect[]; onChange: (next: NodeEffect[], info?: ColorChangeInfo, map?: …) => void; bindingPrefix: string }
interface StrokeStyleFieldsProps { value: StrokeStyleValue; onChange: (patch: Partial<StrokeStyleValue>, info?: ColorChangeInfo) => void }
```

- [ ] **Step 1:** Extract the rows, "+" and reorder logic of `PaintListSection` into `PaintStackEditor`. The section keeps the node writes (`useEditNodes`, `stackBindingsPatch`, the drag checkpoint). Do the same for `EffectStackEditor` out of `EffectsSection`, and `StrokeStyleFields` out of `StrokeSettings` plus the weight row.
- [ ] **Step 2:** Fills, Strokes and Effects get a `StyleControl` in their header actions. While bound, the body is the `StyleChip` instead of the editor. The Strokes section's settings row gets a `StyleControl` for `strokeStyle`, and while it's bound the chip replaces the weight and settings.
- [ ] **Step 3:** `pnpm typecheck && pnpm lint` — pass.

### Task 9: Paint, effect and stroke style types (UI)

**Files:** Create `core/ui/styles/` (`paint-style-row.tsx`, `paint-style-editor.tsx`, `stroke-style-row.tsx`, `stroke-style-editor.tsx`, `create-node-style.ts`, `use-style-field-binding.ts`, `index.ts` + types) and `effects/ui/styles/` (`effect-style-row.tsx`, `effect-style-editor.tsx`); modify `core/core.module.ts` (`requires: ["variables"]` if the sort allows, else contribute from the variables module) and `effects/effects.module.ts`

**Interfaces — Produces:**

```ts
/** A new style of `styleType` from the first selected node (`null` without one): named "<Type> N", one undo step. */
export function createNodeStyle(
  engine: DesignEngine,
  styleType: string,
  value: (node: DesignNode) => Record<string, unknown>,
): string | null;
/** A style's field binding for its editors: `{ bound, bind(id | null) }` through `DocumentTokens.bindStyleField`. */
export function useStyleFieldBinding(style: StyleRecord, path: string): FieldBinding;
```

- [ ] **Step 1:** Contribute `designStyleTypes` entries: Color (`paint`, order 20, "Color styles"), Effect (`effect`, 30, "Effect styles") and Stroke (`stroke`, 40, "Stroke styles"). Each Row is `StylePreview` + name + summary, and click opens the editor popover, like `TextStyleRow`.
- [ ] **Step 2:** Each editor writes the style with `tokens.updateStyle` (a drag's steps join one undo step, as the panel does). Each one reuses its Task 8 editor with `bindPath` and `bindingPrefix` pointing at the style's own paths through `useStyleFieldBinding`, so a style's colors and numbers bind to variables. Each editor also has name, description and delete (`DeleteVariablesDialog`, which counts layers).
- [ ] **Step 3:** If `core` can't `require` `variables` (variables requires core), move the `designStyleTypes` point to `src/products/design/ui/modules/` beside the editor points and import it from there everywhere, text included. Ledger which one you did.
- [ ] **Step 4:** `pnpm typecheck && pnpm lint` — pass.

### Task 10: String and boolean variables in the UI

**Files:** Modify `canvas-ui/tokens/variable-value.tsx`, `token-swatch.tsx`, `variable-picker.tsx`; `variables/ui/new-variable-menu.tsx`, `use-create-variable.ts`, `value-field.tsx`, `variable-row.tsx`, `sidebar-group-row.tsx`, `scope-options.ts`; window `board/` (`new-group-menu.tsx`, `add-card-menu.tsx`, `group-section.tsx`), `side/group-outline.tsx`, `inspector/variable-inspector.tsx`; create `board/string-card.tsx`, `board/boolean-card.tsx`, `inspector/string-mode-row.tsx`, `inspector/boolean-mode-row.tsx`

- [ ] **Step 1:** Values: a string shows as quoted, truncated text with a `Type` glyph, and a boolean as a small switch (read-only in rows) with an on/off glyph. `ValueField` edits strings with a `CommitInput` and booleans with a `Switch`. The picker's type filter takes all four, and `scope-options.ts` lists the string scopes.
- [ ] **Step 2:** The "+" menu and `NewGroupMenu` add Text and Boolean. `AddCardMenu` adds one of the group's type. Cards show the value per mode (`ModeChips` "All" lists each mode), and the inspector has a row per mode with `SameAsFirst`.
- [ ] **Step 3:** `pnpm typecheck && pnpm lint` — pass.

### Task 11: Binding string and boolean fields in the panel

**Files:** Modify `text/ui/font-picker.tsx` (or its row in `typography-section.tsx`), `text/ui/face-select.tsx` row, `typography-section.tsx` (create `text/ui/text-content-bind.tsx`), `core/ui/sections/appearance-section.tsx` (visibility), `frame/ui/*` (clip content), `auto-layout/ui/*` resizing (ignore auto layout), `mask/ui/*` (invert)

- [ ] **Step 1:** Wrap each field in `BindSlot` with its path. While bound, the field is the `VariableChip`. Font, Font style and the booleans' checkboxes take the hover hexagon.
- [ ] **Step 2:** `TextContentBind` sits in the Typography header (a `BindButton` "Bind text content"). While bound, a row at the top of the section shows the chip.
- [ ] **Step 3:** The Appearance section gets a visibility row ("Visible", a checkbox with `BindSlot` path `visible`). The layer tree's eye still toggles and unlinks.
- [ ] **Step 4:** `pnpm typecheck && pnpm lint` — pass.

### Task 12: Agent tools

**Files:** Modify `variables/agent/variable-args.ts`, `variables-edit.agent-tools.ts`, `variables-bind.agent-tools.ts`, `styles.agent-tools.ts` (split into `styles-read.agent-tools.ts`, `styles-edit.agent-tools.ts`, `style-args.ts`), `describe-variables.ts`, `text/text.agent-tools.ts` (`style_text_range`), `products/design/agent/design-agent-instructions` text

- [ ] **Step 1:** `create_variables` and `update_variables` take `type: "string" | "boolean"` and their values (a JSON string or boolean, or `{ alias }`), checked against the type.
- [ ] **Step 2:** Replace `create_text_styles`/`update_text_styles` with `create_styles` and `update_styles`, so each tool name means one thing. Items are `{ type: "text" | "paint" | "effect" | "stroke", name, description?, fromNode?, value?, bindings?: { [path]: variable } }`. Values are read with the agent readers (`readPaints`, `readNodeEffects`, `readStrokeFields`, the text style reader), and bindings are checked for type and alias. `update_styles` takes `bindings` with `null` to unlink. `list_styles` gives each type's summary and its bindings by variable name.
- [ ] **Step 3:** `bind_variables` accepts the style paths (`fills`, `strokes`, `effects`, `strokeStyle`, `textStyle`) with a style id or path of the right type, and string and boolean variables. `style_text_range` takes `textStyle`. The instructions mention styles and the four variable types.
- [ ] **Step 4:** `pnpm typecheck && pnpm lint` — pass.

### Task 13: Docs and final checks

- [ ] **Step 1:** Update `CLAUDE.md`:
  - Canvas engine › Variables: the new types, style bindings, `resolveStyle`, `bindsPath`, overlapping paths.
  - Design › Variables: string/boolean fields, the four style types, run styles, `StyleControl`, the agent tools. Remove them from its "Not yet" list.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint && pnpm format:check` — pass (run `pnpm format` on the changed files if needed).

## Later phases

Unchanged from phase 1's outline: 3 Design System view + live element, 4 the rest of the extras (type scale making text styles, Replace with…, Find unused, detach everywhere), 5 import/export, 6 board colors, 7 math expressions.
