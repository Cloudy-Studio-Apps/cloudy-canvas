# Data merge, phase 3: Element iterator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** "Repeat" on a frame: its first child is a template repeated once per row (filtered, sorted, limited), as locked copies kept in step with the template and the data; Detach frees a copy; a preview row; data checks.

**Architecture:** A frame's `repeat` field. The pure `planDataCopies` diffs the copies that should exist (one per row key) against those there (tagged `dataCopy`), and `writeDataCopies` applies it; `syncData` (phase 2) runs it for affected iterators before planning bindings, with each copy's scope being its row. The frame's auto layout lays the copies out.

**Tech Stack:** as phase 1.

**Spec:** [docs/superpowers/specs/2026-11-04-catalog-data-merge-design.md](../specs/2026-11-04-catalog-data-merge-design.md) · [00-overview](2026-11-04-data-merge-00-overview.md) · needs [phase 2](2026-11-04-data-merge-02-bindings.md)

## Global Constraints

The [phase 1](2026-11-04-data-merge-01-sources.md#global-constraints) and [phase 2](2026-11-04-data-merge-02-bindings.md#global-constraints) constraints, plus:

- The template is a real, editable layer showing row 0 (or the preview row); copies are rows 1 onward.
- Copies are `locked` and tagged; editing the template changes every copy not detached; a detached copy is never updated or replaced.
- `limit` caps rows everywhere; `designLimit` caps only copies made in the document (phase 4's export makes all).
- Copies are matched by the row key (the iterator's `key` field, else the row's position).
- **From the phase 2 review:** `planDataCopies` patches copies at the leaf level and skips every data-resolved path of each node (its `dataBindings` keys, `text`, `runs`, `visible`), so copying the template never counts as a hand edit and never unlinks a copy's bindings. Scopes are per node: build the root scope once per sync and add `scopeFor(el, root)` walking ancestors (never rescan the document per node); pass each row name's source to `childScope` so pictures resolve per source (`images(value, sourceId)`). `renameReferences` skips expressions whose first name is a nearer `as` and renames `repeat.source`, `key`, filter and sort paths; renaming an `as` rewrites its subtree; `setRepeat` and source naming refuse names that would shadow each other.
- **Preview row** moves here from phase 2 (planning decision): a template only has rows once it's in an iterator.

## Review Focus

1. **Undo of an Update that changed row count** must remove/restore copies in the same step (copies are written in the edit's undo step by `syncData`). → Task 3.
2. **Deleting the template** must delete its copies, and deleting the frame removes everything; deleting one copy just makes it come back on the next sync unless detached (say so in the README and in Detach's tooltip). → Task 5 (`pruneData`).
3. **Copy-pasting a frame with a repeat** pastes the template and repeat; its copies are regenerated, not duplicated with stale tags. → Task 5 (`prepareDataCopies`).
4. **Duplicate keys** (two rows with the same `id`) must still give one copy per row (`key`, `key#2`). → Task 2.
5. **A 1,000-row iterator with no designLimit** must not freeze: the Repeat section defaults `designLimit` to 24 when the rows exceed it, and warns. → Task 6 and Task 7 (`too-many-copies`).

---

### Task 1: The repeat record and its rows

**Files:**

- Create: `data/repeat/{repeat.types.ts,repeat-fields.ts,repeat-rows.ts,index.ts}`
- Modify: `data/index.ts` (export `./repeat`, including `copyNode`, `repeatRows` and `rowScope`, which the catalog uses in phase 4)

**Interfaces:**

- Produces:
  ```ts
  interface SortRule {
    path: string;
    descending?: boolean;
  }
  interface RepeatSettings {
    source: string; // an expression for a list in scope: "products", "product.specs", "page.rows"
    as: string; // the row's name, default "item"
    key?: string; // a field path giving each row's identity
    filter: DataCondition[]; // all must hold
    sort: SortRule[];
    limit?: number;
    designLimit?: number;
    previewRow?: number;
    detached: string[];
  } // row keys of detached copies
  interface DataCopyTag {
    iterator: string;
    key: string;
    source: string;
  } // source: the template child's id
  ```
  `repeatOf(el): RepeatSettings | null` (frames only), `dataCopyTag(el): DataCopyTag | null`.
  `repeatRows(repeat: RepeatSettings, scope: DataScope, phase: "design" | "export"): { rows: { key: string; row: unknown; index: number }[]; total: number }` — the list via `lookup`, filtered (`evaluateCondition` in a child scope with `as` = row), sorted (stable, numbers numerically, then strings with `localeCompare`), capped by `limit`, then by `designLimit` when `phase === "design"`; `total` is the count before `designLimit`. Keys: the `key` field's value as a string, else `String(index)`; repeats get `#2`, `#3`.
  `rowScope(parent: DataScope, repeat: RepeatSettings, row: unknown, index: number, total: number): DataScope` — names `{ [as]: row, $index: index, $number: index + 1, $count: total }`.
- [ ] **Step 1:** Write the files.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): repeat settings and the rows they give`.

### Task 2: Planning the copies

**Files:**

- Create: `data/repeat/{plan-data-copies.ts,plan-data-copies.types.ts,copy-node.ts}`

**Interfaces:**

- Produces: `planDataCopies(frame: FrameElement, template: DesignNode, templateTree: DesignNode[] /* template + descendants */, existing: DesignNode[] /* tagged copies in the frame, with descendants */, rows: { key: string; index: number }[], detached: string[]): DataCopyPlan` with
  ```ts
  interface DataCopyPlan {
    add: { key: string; index: number; nodes: DesignNode[] }[]; // fresh ids, tagged, locked, after the template in order
    patch: { id: string; patch: Partial<DesignNode> }[]; // copies whose template part changed
    remove: string[]; // copies (roots) whose key is gone, or repeats
    order: { id: string; index: string }[];
  } // fractional indexes so copies follow row order
  ```
  Copies mirror the template's fields except `id`, `parentId`, `index`, `locked` (true), and the data-resolved fields (text, bound fields, `visible`), which `planBindings` writes afterwards; descendants are matched by `source` (the template node each copies). Detached keys are skipped (no add, no patch, no remove). Uses `keyBetween`/`nKeysBetween` for `order`.
- [ ] **Step 1:** Write it, with a `copyNode(source, parentId, pageId, tag)` helper in `data/repeat/copy-node.ts` (add it to the file tree). It follows the pattern of the catalog's `model/page-items/copy-node.ts` (skip `OWN` fields, compare with `JSON.stringify` so unchanged copies get no patch, and keep the copy's `x`/`y` because auto layout places it), but it isn't shared: the catalog's version is tied to page items' templates and masters, and data can't import catalog.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): plan an iterator's copies`.

### Task 3: Writing copies in the sync

**Files:**

- Create: `data/repeat/write-data-copies.ts`
- Modify: `data/sync/sync-data.ts`, `data/sync/affected-data.ts`, `data/bindings/scope.ts` (`scopeAt` walks ancestors' repeats and copies' tags)

**Interfaces:**

- Produces: `writeDataCopies(doc: CanvasDocument, plan: DataCopyPlan): void` (one `add` per node, `updateMany` for patches and order, `remove`; no checkpoint).
- `affectedData` adds iterators: a frame whose `repeat` changed, a frame with a template node (or its descendant) that changed, every iterator when a source changed.
- `syncData` order per affected iterator, outermost first: rows → `planDataCopies` → `writeDataCopies` → `planBindings` for the template (scope of row 0 or `previewRow`) and each copy (its row's scope). Nested iterators inside a template are copied with it (their `repeat` field too) and then planned in their own copy's scope.
- `scopeAt(doc, nodeId)`: from the node up, each ancestor frame with a `repeat` adds `rowScope` for the row the node belongs to (a copy's `dataCopyTag.key`; the template's preview row).
- [ ] **Step 1:** Write `writeDataCopies`; extend `affectedData` and `syncData`.
- [ ] **Step 2:** Make sure a sync that changes nothing writes nothing (so the re-run after its own writes ends).
- [ ] **Step 3:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): iterators keep their copies in step`.

### Task 4: Setting a repeat, detaching

**Files:**

- Create: `data/repeat/{set-repeat.ts,detach-data-copy.ts}`

**Interfaces:**

- Produces: `setRepeat(doc, frameId: string, repeat: Partial<RepeatSettings> | null, opts?: { addLayout?: boolean }): void` — validates (frame with at least one child; `source` resolves to a list in `scopeAt`; `as` an identifier, not reserved, not shadowing a source); writes `repeat` with defaults (`as: "item"`, empty filter/sort/detached); with `addLayout` and no `layout` on the frame, adds a wrapping row auto layout through the auto-layout module's exported helper (`add-auto-layout.ts`); `null` removes the repeat and its copies. One undo step.
  `detachDataCopy(doc, copyId: string): void` — the copy root and its descendants untagged and unlocked, the key appended to the iterator's `detached`; one undo step. `detachedRowsGone(doc, frame): string[]` for checks.
- [ ] **Step 1:** Write both.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): set a repeat on a frame and detach copies`.

### Task 5: Removing and copying

**Files:**

- Create: `data/repeat/{prune-data.ts,prepare-data-copies.ts}`
- Modify: `data/data.module.ts` (`designCanvas.onRemove`, `designCanvas.prepareCopies`)

**Interfaces:**

- Produces: `pruneData(doc, removed: CanvasElement[]): void` — a removed template child takes its copies (removing the repeat when the frame has no child left); `prepareDataCopies` (signature as catalog's `prepareItemCopies`): copies copied with their frame are left out (the pasted frame's sync remakes them), a copy copied alone is freed (untagged, unlocked).
- [ ] **Step 1:** Write and register both.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): copies follow deletes and copy-paste`.

### Task 6: The Repeat section and copies in the Design mode

**Files:**

- Create: `data/ui/repeat-section/{repeat-section.tsx,filter-rows.tsx,sort-rows.tsx}` + `.types.ts`
- Create: `data/ui/design-mode/{data-copy-badge.tsx,data-copy-section.tsx}` + `.types.ts`
- Create: `data/ui/data-section/preview-row-field.tsx` + `.types.ts`
- Modify: `data/data.module.ts`, `data/ui/data-section/data-section.tsx`, locales, README

**Interfaces / behavior:**

- `RepeatSection` (`propertySections` `{ id: "data.repeat", tab: "design", order: 39, when: one frame selected }`): off → "Repeat for each row" button (asks for the list with `FieldPicker` over lists in scope, then `setRepeat(…, { addLayout: true })`). On: list, row name (`useCommitField`), key field, `FilterRows` (condition rows like `ConditionField`, + / ×), `SortRows` (path + direction), Limit and "While designing, show" (`NumberInput`s, empty = none), "N of M rows" line, Remove repeat. If total > 24 and no designLimit when turned on, set `designLimit: 24` and show it.
- `PreviewRowField` in the Data section for a template (or anything inside one): `NumberInput` 1…total, writing the iterator's `previewRow`.
- `DataCopyBadge` (`layerBadges`, id `data.copy`): a small "data" mark on copies. `DataCopySection` (`propertySections`, order 1, when any selected node has `dataCopyTag`): "Row N of source", Edit template (selects the template node of the same `source`), Detach (`detachDataCopy`).
- [ ] **Step 1:** Components and registrations; i18n under `repeat.*`, `copy.*`.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): repeat a frame's card for each row`.

### Task 7: Data checks

**Files:**

- Create: `data/checks/{data-issues.ts,data-issues.types.ts,index.ts}`
- Modify: `data/index.ts`, `data/ui/data-tab/source-row.tsx` (issue count), README

**Interfaces:**

- Produces: `type DataIssueKind = "unresolved-token" | "image-failed" | "text-overflow" | "detached-row-gone" | "source-error" | "never-updated" | "too-many-copies"`; `interface DataIssue { kind: DataIssueKind; nodeId?: string; sourceId?: string; detail: string }`; `dataIssues(doc: CanvasDocument, nodes?: string[] /* limit to a subtree's ids */, errors?: (sourceId: string) => string | null): DataIssue[]`. `text-overflow`: a bound text with `autoResize: "none"` whose laid-out height exceeds its box (`textSize`); `too-many-copies`: an iterator whose rows exceed 500 without a designLimit; `image-failed` from the last Update's failures kept in `DesignDataSources` memory (add `imageFailures(id): string[]`).
- [ ] **Step 1:** Write `dataIssues`; show a count on each source row and the issues in the source's detail.
- [ ] **Step 2:** `pnpm typecheck && pnpm lint && pnpm format:check` → pass. Commit: `feat(data): checks for data that doesn't fit`.

### Task 8: Agent tools, changelog

**Files:**

- Create: `data/mcp/repeat.mcp.ts`; Modify: `data/mcp/index.ts`, `data/mcp/describe-source.ts` (iterators using it), README, changelogs

**Interfaces:**

- Produces: `set_repeat { frame, source, as?, key?, filter?, sort?, limit?, designLimit?, previewRow?, addLayout? (default true) }`, `remove_repeat { frame }`, `detach_data_copy { layer }`, `get_data_issues { source? }`; each edit one `asUndoStep`.
- Changelog `New`: "Frames can repeat a card for each row of a source: design the first card, choose Repeat, and every product gets its own copy, filtered and sorted as you like. Copies follow the first card's design and the data, and any of them can be detached to change it by hand." (+ Spanish).
- [ ] **Step 1:** Tools; changelog entries.
- [ ] **Step 2:** `pnpm lint && pnpm typecheck && pnpm format:check` → pass. Commit: `feat(data): repeat agent tools`.
