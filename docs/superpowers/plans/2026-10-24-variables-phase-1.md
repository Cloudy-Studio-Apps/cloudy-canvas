# Variables — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A design file holds color and number variables (collections, modes, aliases, groups, scopes) in its document; layers bind fields to them; the bound values stay true through edits, undo, live sessions and paste; users manage them in the properties panel and a table editor, and agents through tools.

**Architecture:** Tokens are records in a new `"tokens"` Y.Map of `CanvasDocument` (plain TS in `src/canvas/tokens/`, shared by both products). Elements carry `bindings` (field path → variable id) while their ordinary fields keep the resolved value; a generic `syncTokens` runs as an `afterEdit` hook (the `afterEdit` point becomes chainable) and resolves, re-imposes or detaches bindings. The design contributes a `variables` module: its mode context (page and container `variableModes`), its bindable fields (through its kinds), the panel UI and agent tools.

**Tech Stack:** TypeScript (strict, `noUncheckedIndexedAccess`), Yjs, React 19, Zustand, Radix/shadcn, Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-10-24-variables-design-system-design.md`

## Global Constraints

- There is **no test framework**: every task's verification is `pnpm typecheck` and `pnpm lint` (and `pnpm format:check` at the end). Do not run `tauri dev`, cargo, builds or browser checks.
- Layering (ESLint-enforced): `src/canvas/tokens/` is plain TS (no React, no `@shared/ui`, no `@platform`, no products). Shared React pieces go in `src/canvas-ui/tokens/`; design UI in `src/products/design/modules/variables/ui/`.
- Every `interface`/`type` in a sibling `.types.ts`, imported with `import type`; barrels re-export with `export type`. One component/helper per file; split past ~200 lines.
- Ids from `createId()`. All content edits through `CanvasDocument` (undoable, `checkpoint()` before a user action). Never canvas content in React or Zustand state.
- Components use semantic tokens only; radii 4px controls / 6px menus; no pills.
- Never branch on `el.type` outside an element's folder: ask its kind.
- Commit only when the user asks; each task ends at a green `pnpm typecheck && pnpm lint` checkpoint instead.
- Update `CLAUDE.md` (a "Variables" section under Canvas engine and under Design) in the last task.

## Review Focus

1. **Undo of a variable edit** must restore bound layers in the same step (the sync writes happen inside the token edit's transaction; a color picker drag's steps join one undo step) — owned by Task 5 and Task 9.
2. **Broken references:** an alias whose target was deleted, an alias cycle written by an agent, a binding to a missing variable, a frame pointing at a removed mode — layers keep their last value, never crash, never get `undefined` written; a removed mode falls back to the collection's default — owned by Tasks 2, 5, 7.
3. **Paint stack edits** (remove, reorder, add) must move binding paths with the paints; removing the bound paint drops the binding — owned by Task 8.
4. **Paste between files** brings the variables (and their alias targets and collections) the copied layers use; pasting into a file that has a token with the same id keeps the target's values — owned by Task 12.
5. **Detach rule:** resizing a bound width by drag, scaling a bound radius, or an agent's `update_nodes` on a bound field removes the binding and keeps the written value, and a sync-written value never detaches — owned by Task 5 (and reported by Task 13's tools).

---

## File Structure

```
src/canvas/tokens/                       plain TS, both products
  token.types.ts                         records, values, scopes, mode context
  token-color.ts                         #rrggbbaa parse/format, rgb+alpha split
  token-path.ts                          normalize "a / b/c" → "a/b/c", group prefix helpers
  token-group-tree.ts (+ .types.ts)      paths → nested groups (accordions)
  token-store.ts                         read model over records: by id, by collection, aliases
  resolve-token.ts                       value for a mode context, alias chain, cycle check
  document-tokens.ts                     DOCUMENT_TOKENS service: reads + edits (undo steps)
  token-feed.ts                          observes the tokens map while subscribed
  binding-path.ts                        read/write nested field paths, remap stack indexes
  binding.types.ts                       BindableField, TokenContext
  binding-index.ts                       token id → bound element ids (incl. alias dependents)
  sync-tokens.ts                         the afterEdit hook body
  clipboard-tokens.ts                    tokens for copied elements, restore on paste
  index.ts
src/canvas/document/canvas-document.ts   + tokens map, token reads/writes, EditedChange.tokens
src/canvas/elements/element.types.ts     + bindings?, variableModes?
src/canvas/elements/element.kind.ts      + bindable(), bindPatch()
src/canvas/modules/*                     afterEdit chainable; + tokenContext point
src/canvas/clipboard/*                   payload.tokens

src/canvas-ui/tokens/                    shared React
  use-document-tokens.ts                 useSyncExternalStore over DOCUMENT_TOKENS
  variable-picker.tsx (+ .types.ts)      searchable, filtered by type/scope, grouped
  variable-chip.tsx (+ .types.ts)        bound field look; change / detach menu
  token-group-accordion.tsx (+ .types.ts)
  token-swatch.tsx
  index.ts

src/products/design/modules/variables/
  variables.module.ts
  design-token-context.ts                modesOf (parents → page), mode dependents
  bind-nodes.ts                          set/clear bindings on nodes (one undo step)
  variables.agent-tools.ts               + variable-args.ts, describe-variables.ts
  ui/
    variables-section.tsx                properties panel, nothing selected
    collection-block.tsx, variable-row.tsx, variable-editor.tsx (+ value-field.tsx)
    variables-table/                     the wide editor (floating panel)
    delete-variables-dialog.tsx
    mode-row.tsx                         "Variable modes" for page/containers
    bindable-number-field.tsx            NodeNumberField + bind button + chip
    use-bind-variable.ts
src/products/design/modules/core/node/design-node.kind.ts   bindable/bindPatch for node fields
(text, frame, rectangle, polygon, star, effects kinds)        their own bindable fields
src/products/design/ui/components/panel/paint-field.tsx      color bind button + chip
src/products/design/ui/components/paint-picker/              "Variables" swatches in Solid tab
```

---

### Task 1: Token records in the document

**Files:**

- Create: `src/canvas/tokens/token.types.ts`, `token-color.ts`, `token-path.ts`, `index.ts`
- Modify: `src/canvas/document/canvas-document.ts`, `canvas-document.types.ts`, `src/canvas/index.ts`

**Interfaces — Produces:**

```ts
// token.types.ts
export type VariableType = "color" | "number"; // string/boolean come in phase 2
export type TokenScope =
  | "all-fills"
  | "frame-fill"
  | "shape-fill"
  | "text-fill"
  | "stroke-color"
  | "effect-color"
  | "corner-radius"
  | "width-height"
  | "gap"
  | "padding"
  | "stroke-weight"
  | "opacity"
  | "font-size"
  | "line-height"
  | "letter-spacing"
  | "font-weight"
  | "effect-value"
  | "other-number";
export interface ModeDef {
  id: string;
  name: string;
}
export interface CollectionRecord {
  kind: "collection";
  id: string;
  name: string;
  modes: ModeDef[];
  order: string;
}
export type TokenValue = { color: string } | { number: number } | { alias: string };
export interface VariableRecord {
  kind: "variable";
  id: string;
  collectionId: string;
  name: string; // slash path "brand/primary/500", unique per collection
  type: VariableType;
  values: Record<string, TokenValue>; // by mode id
  scopes: TokenScope[]; // [] = every scope of its type
  description: string;
  codeSyntax: { web?: string; ios?: string; android?: string };
  hidden: boolean; // hiddenFromSystem
  order: string; // fractional index within its collection
}
export type TokenRecord = CollectionRecord | VariableRecord;
export type ModeContext = Readonly<Record<string, string>>; // collection id → mode id
export type ResolvedValue =
  { type: "color"; color: string /* #rrggbbaa */ } | { type: "number"; number: number };
```

```ts
// token-color.ts
export function parseTokenColor(text: string): string | null; // #rgb/#rrggbb/#rrggbbaa → "#RRGGBBAA"
export function splitTokenColor(color: string): {
  hex: string /* #RRGGBB */;
  alpha: number; /* 0–1 */
};
export function joinTokenColor(hex: string, alpha: number): string;
// token-path.ts
export function normalizeTokenPath(name: string): string; // trims segments, drops empty ones
export function tokenGroupOf(path: string): string; // "brand/primary/500" → "brand/primary"
export function tokenLeafOf(path: string): string; // → "500"
export function renamePrefix(path: string, from: string, to: string): string | null;
```

`CanvasDocument` (new members):

```ts
tokenRecords(): TokenRecord[];                  // every valid record (invalid JSON skipped)
tokenRecord(id: string): TokenRecord | undefined;
setTokenRecords(records: readonly TokenRecord[]): void; // tracked, actor origin, no-op read-only
removeTokenRecords(ids: Iterable<string>): void;
observeTokens(listener: (changed: ReadonlySet<string>) => void): () => void;
tokensVersion(): number;                        // bumps on any tokens map change (local/remote/undo)
```

`EditedChange` gains `tokens: ReadonlySet<string>` (token ids written by this edit).

- [ ] **Step 1:** Write the types and the three helper files. `token-color` stores upper-case `#RRGGBBAA`.
- [ ] **Step 2:** In `CanvasDocument`, add `private readonly tokensMap = doc.getMap<unknown>("tokens")`, store each record as a plain JSON value under its id; validate on read with `isTokenRecord(data: unknown): data is TokenRecord` (create `src/canvas/tokens/is-token-record.ts`; Task 12's clipboard reuses it). `createHistory` tracks `[this.elements, this.metaMap, this.tokensMap]`. Writes go through `transact` (so the actor origin and `afterEdit` apply); track written ids in a `tokensEdited` set that `settle()` hands over as `change.tokens` and counts in its "anything left" check. `tokensVersion` increments in a `tokensMap.observe` handler set in the constructor.
- [ ] **Step 3:** `pnpm typecheck && pnpm lint` — expected: pass.

### Task 2: Store, resolution and groups

**Files:** Create `src/canvas/tokens/token-store.ts`, `resolve-token.ts`, `token-group-tree.ts`, `token-group-tree.types.ts`

**Interfaces — Consumes:** Task 1 types. **Produces:**

```ts
export class TokenStore {
  static of(doc: CanvasDocument): TokenStore; // cached per doc by tokensVersion()
  collections(): CollectionRecord[]; // by order
  collection(id: string): CollectionRecord | undefined;
  variables(collectionId?: string): VariableRecord[]; // by order
  variable(id: string): VariableRecord | undefined;
  byPath(collectionId: string, path: string): VariableRecord | undefined;
  aliasDependents(id: string): Set<string>; // every variable whose chain reaches id
}
export function resolveVariable(
  store: TokenStore,
  id: string,
  modes: ModeContext,
): ResolvedValue | null;
export function aliasCreatesCycle(store: TokenStore, variableId: string, targetId: string): boolean;
export function modeFor(collection: CollectionRecord, modes: ModeContext): string; // falls back to modes[0]
export function groupTree(variables: readonly VariableRecord[]): TokenGroupNode[];
// TokenGroupNode { path: string; name: string; groups: TokenGroupNode[]; variables: VariableRecord[] }
```

- [ ] **Step 1:** Implement. `resolveVariable` follows `{ alias }` with the alias target's **own collection's** mode from `modes`, stops at 16 hops or a repeat (returns `null`), and returns `null` for a missing variable, missing mode value or a type mismatch.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint` — pass.

### Task 3: The `DOCUMENT_TOKENS` service (edits)

**Files:** Create `src/canvas/tokens/document-tokens.ts`, `document-tokens.types.ts`, `token-feed.ts`

**Interfaces — Produces:**

```ts
export const DOCUMENT_TOKENS: ServiceDef<DocumentTokens>;
export class DocumentTokens {
  subscribe(listener: () => void): () => void;
  getVersion(): number;
  store(): TokenStore;
  createCollection(name: string): CollectionRecord; // one mode "Mode 1"
  renameCollection(id: string, name: string): void;
  deleteCollection(id: string): void; // its variables too, detaching (Task 5's detachEverywhere)
  addMode(collectionId: string, name?: string): ModeDef; // values copied from the default mode
  renameMode(collectionId: string, modeId: string, name: string): void;
  removeMode(collectionId: string, modeId: string): void; // never the last
  createVariable(spec: NewVariable): VariableRecord; // NewVariable { collectionId, name, type, value, ... }
  updateVariable(id: string, patch: VariablePatch): void; // name/description/scopes/codeSyntax/hidden/collection order
  setValue(id: string, modeId: string, value: TokenValue): void; // throws on cycle or wrong type
  renameGroup(collectionId: string, from: string, to: string): void;
  moveVariables(ids: readonly string[], group: string): void;
  deleteVariables(ids: readonly string[]): void; // detaches every use (Task 5)
  usage(id: string): string[]; // bound element ids (Task 5's index)
}
```

Each edit is `doc.checkpoint()` + one transaction (`doc.batch`), except `setValue` with `{ checkpoint: false }` option for picker drags (signature `setValue(id, modeId, value, options?: { checkpoint?: boolean })`). Names are normalized and made unique in the collection (`name 2`).

`deleteCollection`, `deleteVariables` and `usage` depend on Task 5: write them here removing the records only and returning `[]`, and Task 5 Step 2 wires `detachEverywhere` and `BindingIndex` into them.

- [ ] **Step 1:** `TokenFeed` mirrors `DocumentFeed` but subscribes via `doc.observeTokens`.
- [ ] **Step 2:** Implement the facade (`defineService("canvas.tokens", …)`); `order` with `generateKeyBetween`.
- [ ] **Step 3:** `pnpm typecheck && pnpm lint` — pass.

### Task 4: Bindings on elements and kinds; chainable `afterEdit`; token context point

**Files:**

- Modify: `src/canvas/elements/element.types.ts`, `src/canvas/elements/element.kind.ts`, `src/canvas/modules/canvas-points.types.ts`, `create-canvas-points.ts`, `compose-product.ts`, `src/canvas/canvas-product.types.ts`
- Create: `src/canvas/tokens/binding.types.ts`, `binding-path.ts`

**Interfaces — Produces:**

```ts
// CanvasElement
bindings?: Record<string, string>;        // field path → variable id
variableModes?: Record<string, string>;   // collection id → mode id (containers, pages)
// binding.types.ts
export interface BindableField { path: string; type: VariableType; scopes: TokenScope[]; label: string }
export interface TokenContext {
  modesOf(doc: CanvasDocument, el: CanvasElement): ModeContext;
  /** Ids whose mode context follows from the elements whose variableModes changed. */
  modeDependents(doc: CanvasDocument, ids: ReadonlySet<string>): Set<string>;
}
// ElementKind (defaults)
bindable(el: E): BindableField[];                                         // []
bindPatch(el: E, path: string, value: ResolvedValue): ElementPatch<E> | null; // setPathPatch, colors as rgb+alpha below
// binding-path.ts
export function readPath(el: object, path: string): unknown;
export function setPathPatch(el: object, path: string, value: unknown): Record<string, unknown> | null; // copies the root field
export function pathRoot(path: string): string;                            // "fills.0.color" → "fills"
export function remapStackBindings(bindings: Record<string,string>, field: string, map: (index: number) => number | null): Record<string,string>;
```

Default color `bindPatch`: when the path ends in `.color` and the parent object has `opacity`, set `color` to the `#RRGGBB` part and `opacity` to the alpha (spec: color variable alpha drives paint opacity); otherwise the full `#RRGGBBAA` string only if the field already stores 8-digit hex, else `#RRGGBB`.

Canvas points: `afterEdit` becomes many (`AfterEditHook[]`, run in module order inside one call); new single point `tokenContext: ExtensionPoint<TokenContext>`; `CanvasProduct.tokenContext?: TokenContext`.

- [ ] **Step 1:** Implement; update the `afterEdit` doc comments ("several modules may give one; they run in module order").
- [ ] **Step 2:** `pnpm typecheck && pnpm lint` — pass.

### Task 5: `syncTokens` and the binding index

**Files:** Create `src/canvas/tokens/binding-index.ts`, `sync-tokens.ts`, `detach-bindings.ts`

**Interfaces — Consumes:** Tasks 1–4. **Produces:**

```ts
export class BindingIndex {
  // per doc, rebuilt lazily when tokensVersion or element bindings change
  static of(doc: CanvasDocument): BindingIndex;
  boundTo(variableId: string): Set<string>; // direct uses
  affectedBy(variableIds: Iterable<string>): Set<string>; // direct + via aliasDependents
}
export function syncTokens(
  doc: CanvasDocument,
  change: EditedChange,
  kinds: ElementKinds,
  context: TokenContext,
): void;
export function detachEverywhere(doc: CanvasDocument, variableIds: ReadonlySet<string>): void;
export function setBindings(
  doc: CanvasDocument,
  ids: readonly string[],
  path: string,
  variableId: string | null,
): void;
```

`syncTokens` algorithm (decided here; implement exactly):

1. `detachCandidates` = ids in `change.updated` with `bindings`, whose `change.before` has the root of a bound path. For each such path: if `deepEqual(readPath(el, path), expected)` where `expected` is the value `bindPatch` would write from the freshly resolved value, keep; else remove that path from `bindings` (collect into one patch per element). Elements just added (no `before`) never detach.
2. `toResolve` = (`change.updated` ∩ elements with `bindings`) ∪ `BindingIndex.affectedBy(change.tokens)` ∪ `context.modeDependents(doc, ids in change.updated whose before has "variableModes")`, filtered to elements with bindings.
3. For each, for each binding: `resolveVariable(store, id, context.modesOf(doc, el))`; `null` → leave the field as it is (Review Focus 2); else merge `kind.bindPatch(el, path, value)` into the element's patch; write with `doc.update` only the patches whose values differ (`deepEqual`), so the hook settles.
   `detachEverywhere` removes the variable paths from every bound element (one `updateMany`); `DocumentTokens.deleteVariables`/`deleteCollection` call it in their transaction.

- [ ] **Step 1:** Implement; `BindingIndex` scans `doc.ids()` + `doc.field(id, "bindings")` (no full reads) and caches by `tokensVersion()` plus an element-change counter it bumps from `doc.observe` when a `bindings` field or an element add/remove is seen.
- [ ] **Step 2:** Wire `detachEverywhere` into `DocumentTokens.deleteVariables`/`deleteCollection` (same transaction) and `usage(id)` to `BindingIndex.of(doc).boundTo(id)`.
- [ ] **Step 3:** `pnpm typecheck && pnpm lint` — pass.

### Task 6: The design `variables` module skeleton and mode context

**Files:**

- Create: `src/products/design/modules/variables/variables.module.ts`, `design-token-context.ts`, `index.ts`
- Modify: `src/products/design/ui/modules/design-modules.ts` (add `variablesModule` right after `pagesModule`), `src/products/design/modules/auto-layout/auto-layout.module.ts` (`after: ["variables"]`), `src/products/design/modules/pages/page/page.types.ts` (doc comment: pages may carry `variableModes`)

**Interfaces — Produces:** `DESIGN_TOKEN_CONTEXT: TokenContext` — `modesOf` merges, nearest last wins: the page record's `variableModes` (`el.pageId`), then each ancestor's from the root down (`parentId` chain read with `doc.get`), then the element's own. `modeDependents`: a page id → every node with that `pageId`; a node id → it and `withDescendants`.

The module contributes `designCanvas.tokenContext` and `designCanvas.afterEdit` → `(doc, change, kinds) => syncTokens(doc, change, kinds, DESIGN_TOKEN_CONTEXT)`.

- [ ] **Step 1:** Implement and register.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint` — pass.

### Task 7: Design bindable fields

**Files:** Modify `src/products/design/modules/core/node/design-node.kind.ts` and the kinds that add fields: `frame/frame.kind.ts`, `rectangle/rectangle.kind.ts` (corner radius — wherever `cornerRadius` lives), `text/text.kind.ts`, `polygon/polygon.kind.ts`, `star/star.kind.ts`; Create `src/products/design/modules/core/node/node-bindable.ts` (the shared list builder).

**Interfaces — Produces** (paths exactly; scopes in parentheses):

- `DesignNodeKind.bindable(el)`: for each solid paint `fills.N.color` (`all-fills` + `frame-fill`/`shape-fill`/`text-fill` by kind: frames `frame-fill`, texts `text-fill`, others `shape-fill`), each gradient stop `fills.N.stops.M.color` (fill scopes), `strokes.N.color` and their stops (`stroke-color`), each shadow-like effect with a `color` → `effects.N.color` (`effect-color`); numbers `opacity` (`opacity`), `w`, `h` (`width-height`), `sizeLimits.minW|maxW|minH|maxH` when set (`width-height`), `strokeWeight` and, with `strokeWeights`, `strokeWeights.top|right|bottom|left` (`stroke-weight`), `rotation` (`other-number`), effect numbers `effects.N.x|y|blur|spread` / blur `radius` (`effect-value`).
- Frames add `layout.gap`, `layout.counterGap`, `layout.padding.top|right|bottom|left` when `layout` is set (`gap`/`padding`), and `cornerRadius` (`corner-radius`); rectangles `cornerRadius`; texts `fontSize`, `lineHeight`, `letterSpacing`, `fontWeight` (their scopes); polygons/stars `pointCount` (`other-number`), stars `innerRadius` (`other-number`).
- `DesignNodeKind.bindPatch` overrides: `w`/`h` → `this.resize` with the other side kept; `strokeWeights.*` also sets `strokeWeight` to the widest side; `rotation` → `this.rotate(el, value - (el.rotation ?? 0), { x: el.x, y: el.y })`; `fontWeight` rounds to a valid weight; texts call `retypeset` after typography fields (as their `completePatch` does today); everything else the canvas default.
- Values are clamped as the panel clamps them (opacity 0–1, sizes ≥ the kind's minimum).

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint` — pass.

### Task 8: Keep paths right when stacks change; copy properties carries bindings

**Files:** Modify `src/products/design/modules/core/ui/sections/paint-list-section.tsx`, the effects section's reorder/remove (`src/products/design/modules/effects/ui/effects-section.tsx`), the gradient stop edits that add/remove stops (`addStop`, stop removal in `GradientStopBar` callers), `src/products/design/modules/core/node/node-style.ts` (`styleOf`/`applyStyle` include `bindings` entries whose `pathRoot` is a copied field).

- [ ] **Step 1:** Wherever a fills/strokes/effects/stops array loses or reorders entries, write `bindings: remapStackBindings(...)` in the same patch (removed index → `null`, drops the path). Adding at the end needs nothing.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint` — pass.

### Task 9: Shared token UI (`canvas-ui/tokens`)

**Files:** Create everything under `src/canvas-ui/tokens/` (see File Structure); export from `src/canvas-ui/index.ts`.

**Interfaces — Produces:**

```ts
export function useDocumentTokens(): TokenStore; // re-renders on the service's feed
export function VariablePicker(props: {
  type: VariableType;
  scopes: TokenScope[];
  value: string | null;
  modes: ModeContext;
  onPick(id: string): void;
  onDetach?(): void;
  children: ReactNode; /* trigger */
}): JSX.Element;
export function VariableChip(props: {
  variableId: string;
  onChange(): void;
  onDetach(): void;
}): JSX.Element;
export function TokenGroupAccordion(props: {
  nodes: TokenGroupNode[];
  renderVariable(v: VariableRecord): ReactNode;
  storageKey: string;
}): JSX.Element;
export function TokenSwatch(props: { color: string; size?: number }): JSX.Element;
```

Picker: Radix `Popover` + search input; lists collections → `TokenGroupAccordion`; filters by `type`, by `scopes` (a variable with `scopes: []` matches all of its type) and hides `hidden` ones unless searched; rows show `TokenSwatch` or the number resolved in `modes`. Accordion open state remembered per `storageKey` in `localStorage` (try/catch). Sharp style: `rounded-md`, semantic tokens.

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint` — pass.

### Task 10: Variables section and editors (nothing selected)

**Files:** Create `src/products/design/modules/variables/ui/variables-section.tsx`, `collection-block.tsx`, `variable-row.tsx`, `variable-editor.tsx`, `value-field.tsx`, `delete-variables-dialog.tsx`, `mode-row.tsx` (+ `.types.ts` siblings); Modify `variables.module.ts`.

- `designEditor.propertySections` entry `{ id: "variables", tab: "design", order: 15, when: noNodes, component: VariablesSection }`.
- Section: per collection a header (name: double-click renames with `useCommitField`; ⋯ menu: rename, add mode, delete collection; the **page's** mode select when it has 2+ modes, writing the page record's `variableModes` in one undo step), then Color and Number category accordions, each a `TokenGroupAccordion`. Row: swatch/value, leaf name, alias chip (`→ brand/500`). Click opens `VariableEditor` popover: name (path), type (read-only once created), a `ValueField` per mode (color: the `canvas-ui` `ColorPicker`/`HexInput`; number: `NumberField`; "Alias…" opens `VariablePicker` of the same type, refusing cycles with a toast), scopes checklist, description, code syntax (web/iOS/Android), "Hide from design system". Section actions "+" menu: New color variable, New number variable, New group (prompts a name, creates nothing until a variable goes in — implement as "New variable in group"), New collection; and a "Table" button that runs the `openVariables` host command (Task 11).
- Drag rows between groups: `moveVariables` (pointer-based like `useLayerDrag`, past `MOVE_THRESHOLD_PX`).
- Delete (row menu, Delete key in the section): if `usage(id)` is non-empty, `DeleteVariablesDialog` "Used by N layers": **Delete and detach** / Cancel.
- `ModeRow`: in the Appearance section for containers (`DesignNodeKind.container` or child hosts) — one select per collection that has 2+ modes: "Auto (inherit)" + its modes, writing `variableModes` (contribute it as its own `propertySections` entry `{ id: "variable-modes", order: 45, when: allKinds((k) => k.container || k.childHost) }` rather than editing the Appearance section).
- Empty state: "No variables yet" + "New color variable".

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint` — pass.

### Task 11: The table editor

**Files:** Create `src/products/design/modules/variables/ui/variables-table/` (`variables-table.tsx`, `table-row.tsx`, `mode-header.tsx`, `use-variables-table-store.ts` (Zustand: `open`, `collectionId`; UI state only), types); Modify `variables.module.ts` (host command `openVariables` labelled "Variables…", no keys; main menu "View" group item; an `overlays` entry rendering the panel; a session hook registering the handler).

- A `FloatingPanel` (`canvas-ui`) docked over the canvas, ~720×480, resizable not required. Left: collections list (+ new). Right: rows = variables of the collection grouped by path (group header rows, collapsible), columns = Name, one per mode (header: name editable inline, ⋯ rename/duplicate values from/remove), then Description. Cells edit inline with the same `ValueField`. Multi-select rows (Shift/Ctrl) → toolbar: Move to group…, Delete (same dialog), Set scopes…. "+ Variable" at the bottom (type menu).

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint` — pass.

### Task 12: Binding UI in fields, and paste between files

**Files:**

- Create: `src/products/design/modules/variables/bind-nodes.ts`, `ui/use-bind-variable.ts`, `ui/bindable-number-field.tsx` (+ types); `src/canvas/tokens/clipboard-tokens.ts`
- Modify: `paint-field.tsx` (+ types: `bindPath?: string`), the paint picker's Solid editor (a "Variables" swatch block above "On this page", showing color variables in the page's modes; clicking binds when a `bindPath` is given), the number fields of: Layout (W/H), Appearance (opacity, corner radius), Strokes (weight, sides), Auto layout (gap, line gap, padding), Typography (size, line height, letter spacing, weight), Effects editors (x, y, blur, spread, radius), Polygon/Star sections; `src/canvas/clipboard/clipboard-payload.ts`, `clipboard-payload.types.ts`, `element-clipboard.ts`, `paste-external.ts`/`insert-copies.ts` (wherever `restoreAssets` is called)

**Interfaces:**

```ts
export function bindNodes(
  doc: CanvasDocument,
  ids: readonly string[],
  path: string,
  variableId: string | null,
): void; // checkpoint + one step; null detaches
export function useBindVariable(): (
  nodes: readonly DesignNode[],
  path: string,
  variableId: string | null,
) => void;
export function BindableNumberField<N extends DesignNode>(
  props: NodeNumberFieldProps<N> & { path: string; type?: "number"; scopes: TokenScope[] },
): JSX.Element;
export function clipboardTokens(
  doc: CanvasDocument,
  elements: readonly CanvasElement[],
): TokenRecord[]; // used variables + alias closure + their collections
export function restoreTokens(doc: CanvasDocument, records: readonly TokenRecord[]): void; // adds only ids the doc lacks
```

- A field is "bound" when every selected node binds `path` to the same variable: it renders `VariableChip` instead of the input (can't be typed into; chip menu → Change / Detach). Different bindings → chip "Mixed". Unbound: the input plus a hover-revealed bind button (Lucide `Hexagon`, `PanelIconButton`) opening `VariablePicker` filtered by the field's type and scopes (taken from the kind's `bindable` entry for that path on the first node; the button hides when any node lacks that path).
- `PaintField` with `bindPath` (solid paints only): the hex+opacity area becomes the chip when bound; picking from the picker's Variables block binds.
- Clipboard payload gains `tokens?: TokenRecord[]`; decode validates with `isTokenRecord`; paste restores before inserting copies, in the same undo step.

- [ ] **Step 1:** Implement `bindNodes`, the hook, the field and the paint field/picker parts.
- [ ] **Step 2:** Swap each listed `NodeNumberField` to `BindableNumberField` with its path and scope.
- [ ] **Step 3:** Clipboard tokens.
- [ ] **Step 4:** `pnpm typecheck && pnpm lint` — pass.

### Task 13: Agent tools and summaries

**Files:** Create `src/products/design/modules/variables/variables.agent-tools.ts`, `variable-args.ts`, `describe-variables.ts`; Modify `variables.module.ts` (contribute `designAgentTools` group `{ id: "variables", tools: () => variableTools }`), `DESIGN_AGENT_INSTRUCTIONS` (one paragraph on variables), `DesignNodeKind.describe` (adds `bindings` as `{ path: variableName }`), `update_nodes` result (lists bindings the sync detached: compare `bindings` before/after in the tool).

Tools (all through `engine.service(DOCUMENT_TOKENS)` of the agent's workspace, each edit one undo step via `asUndoStep`):

- `list_variables` (`collection?`): collections with modes, variables (id, name, type, values per mode name, aliases by name, scopes, usage count).
- `get_variables` (`ids` or `names`).
- `create_collection` (`name`, `modes?: string[]`), `update_collection` (`id`, `name?`, `addModes?`, `renameModes?: {id,name}[]`, `removeModes?`).
- `create_variables` (`collection`, `variables: [{ name, type, values: { [modeName]: "#hex" | number | { alias: "path or id" } }, scopes?, description?, codeSyntax? }]`) — validates everything before writing.
- `update_variables` (`variables: [{ id, name?, values?, scopes?, description?, codeSyntax?, hidden? }]`).
- `delete_variables` (`ids`) — detaches uses, reports how many layers.
- `bind_variables` (`bindings: [{ ids: string[], path: string, variable: string /* id or "collection/path" */ }]`) — checks the path is in the kind's `bindable` and the type/scope match.
- `unbind_variables` (`ids`, `paths?`) — detaches (all paths when omitted).
- `set_variable_mode` (`target`: page id or node id, `collection`, `mode`: id or name, or `null` for inherit).

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint` — pass.

### Task 14: Docs and final checks

**Files:** Modify `CLAUDE.md` (Canvas engine: "Variables" — tokens map, `DOCUMENT_TOKENS`, bindings, `syncTokens` and the detach rule, chainable `afterEdit`, `tokenContext`; Design: the variables module, panel, table, bind fields, agent tools; Agent server list of tools), `docs/plugins.md` (kinds' `bindable`/`bindPatch`).

- [ ] **Step 1:** Write the docs in the file's existing style.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint && pnpm format:check` — pass (run `pnpm format` first if needed).

---

## Later phases (outline; each gets its own detailed plan against the code phase 1 produced)

- **Phase 2 — Strings, booleans, styles:** `VariableType` += `string`, `boolean`; bindable `text`, `fontFamily`, `fontStyle`, `visible`, `clipsContent`, `layoutAbsolute`, `maskInverted`; style records (`kind: "style"`, `styleType: paint | text | effect | stroke`, groups, description) whose fields may be `{ alias }`; style bindings (`bindings["fills"] = styleId`, text runs `runs.N.style`), resolved by the same sync in the layer's modes; Styles section and style chips on Fills/Strokes/Typography/Effects headers; agents (`list_styles`, `create_styles`, `update_styles`, `apply_styles`).
- **Phase 3 — Design System view + live element:** `styleguide` module; `styleguideCategories` and `styleguideTemplates` points; system page (`system: true`, hidden from Pages, created with the first token by the sync); always-shown mode with empty state; `token-sheet` kind with generated, locked, bound children regenerated in `afterEdit`; template picker sidebar with category → group → element defaults; Add to page; Convert to design; export section (PNG/PDF) and whole system (one PDF page per category); the built-in templates of the spec's table; agent tools.
- **Phase 4 — Extras:** ramp / type scale / spacing scale generators (`generator` records, OKLab ramps); WCAG contrast; usage tools (select users, Replace with…, unused, detach all).
- **Phase 5 — Import/export:** from another `.cdesign` keeping ids (update on re-import, conflict choice); DTCG JSON in/out; Tokens Studio import; CSS / Tailwind v4 `@theme` / SCSS / Swift / Kotlin export; `.fig` variables, modes, aliases, `boundVariables` and styles.
- **Phase 6 — Board colors:** board `tokenContext` (board-wide mode per collection in the tokens map), bindable `color`/`fill`/`stroke`/cell `fills` on sticky, geo, text, pen strokes, connector, section, table; "Document colors" row in `ColorPalette`; colors manager; Import colors from a design file; board agent tools.
- **Phase 7 — Math expressions** in values (`{space/base} * 2`).
