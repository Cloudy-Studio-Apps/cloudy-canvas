# Brochure: reordering, masters, page items, sections and contents — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pages of a brochure can be dragged anywhere in the Brochure tab (including onto blank pages and spread headings), several at once or with Alt+↑/↓. Brochures get InDesign-style masters: headers and footers designed once, with live page numbers, title, section and date. A library of drop-in page items fills them. Sections give running heads and number restarts, and an automatic table of contents follows the pages.

**Architecture:** Everything stays inside the `catalog` feature module (`src/products/design/modules/catalog/`). A master is a pair of ordinary frames (left page, right page) that the user designs in the Design mode. Catalog **stamps real, locked copies** of a master's layers into every page frame that uses it, and resolves text templates (`{page}`, `{pages}`, …) on those copies and on any page-item text. Stamping is one idempotent `designCanvas.afterEdit` hook, so it runs inside the edit's own undo step and transaction, and export, preview, thumbnails and agents get the result with no extra work. In the Design mode the copies are locked: clicks reach the page frame, the layer tree marks them "From master", and only "Detach" frees one.

**Tech Stack:** TypeScript (strict, `noUncheckedIndexedAccess`), React 19, Zustand, Yjs through `CanvasDocument`, the repo's module system (`defineModule`, points).

**Spec:** this conversation (2026-11-04). The user asked for: (1) dragging pages into place in the Brochure tab, which fails when dropping on blank-page rows and spread headings; (2) automatic headers and footers from a list of reusable items (page count and others), shown in the Design mode as non-editable layers because they come from the Catalog mode. They also chose four extras: sections with running heads, an automatic table of contents, odd/even masters, and better reordering. Storage decision: real locked layers, not a draw-only overlay.

## Global Constraints

- Verification is `pnpm lint`, `pnpm typecheck` and `pnpm format:check` only. There is no test framework. Don't run `tauri dev`, cargo, builds or browser checks.
- Commit directly on `master`, with no `Co-Authored-By` line (user rule overrides the harness attribution).
- Every edit goes through `CanvasDocument`, with `doc.checkpoint()` before a user action. Never mutate an element read from the document (CLAUDE.md rules 10–12).
- Ids come from `createId()`. Every `interface`/`type` goes in a sibling `*.types.ts` (rule 25).
- Files stay small and single-purpose, under ~200 lines (rule 21). Never branch on `el.type`: ask the kind or use `isText`/`isPageFrame` helpers (rule 11).
- UI text goes through `catalog.i18n.ts` `t(...)`, with both `locales/en.json` and `locales/es.json` (rule 30). MCP tool text stays English.
- Shortcuts are mode `keybindings` with labels from `engine.keymap.label` (rule 13). Kit components only (`SelectField`, `CheckboxField`, `NumberInput`, `useCommitField`); semantic tokens; radii ≤ `rounded-lg` (rules 23–27).
- Use pointer-event row drags (`useRowDrag`), never HTML5 `draggable` (memory: cross-platform fixes).
- Each user-facing task adds one entry under the unreleased section of `CHANGELOG.md` and `CHANGELOG.es.md` (rule 31): `Fixed`/`Correcciones` for Task 1, `New`/`Novedades` or `Improved`/`Mejoras` for the rest. No internal names.
- Update `src/products/design/modules/catalog/README.md` in the same task that changes behavior (rule 1). Remove the line "Not yet: … page numbers drawn on pages, master elements" in Task 6.
- New catalog fields are optional on old files: `fillDefaults` in `brochure.defaults.ts` fills them, so files from before open unchanged.

## Review Focus

1. **Undo is one step.** Moving a page must update every page number in the same undo step, and so must editing a master. A single Ctrl+Z undoes both. (Stamping lives in `afterEdit`, so this holds only if the sync never calls `checkpoint()`. Task 6 states it.)
2. **The sync doesn't loop or churn.** `afterEdit` runs again with its own writes, so a second pass over unchanged input must write nothing. Task 6's `planPageItems` is a pure diff, and the sync writes only its non-empty patches.
3. **Copying a page frame that holds stamped copies** (Ctrl+D, Alt-drag, paste) must not leave orphan "From master" layers that nothing manages. Task 7's `prepareCopies` hook strips the tag and the lock from the copies, and the sync then stamps the new frame if it joins the brochure.
4. **Deleting a master frame, or a page that holds a brochure's masters,** must remove that master's copies and references in the same undo step. Task 3 extends `pruneBrochure`, and Task 6's diff removes copies whose source is gone.
5. **A frame in two brochures, or an unchosen option frame.** Every option of a slot gets the copies, so switching options shows a finished page. A frame used by several brochures is stamped only by the brochure open on its page (`currentBrochure`). Task 6's `stampTargets` decides both.

---

## File map

```
catalog/
  brochure/brochure.types.ts           MODIFY  masters, sections, numbering, slot.master/skip
  brochure/brochure.defaults.ts        MODIFY  fillDefaults for the new fields
  model/
    drop-position.ts (+ .types.ts)     CREATE  Task 1: list drop target → slot position
    slot-edits.ts                      MODIFY  Task 2: moveSlots (several)
    design-brochure.ts                 MODIFY  moveMany, masters/sections/numbering edits
    masters/                           CREATE  Task 3
      master-edits.ts                  pure edits of record.masters / slot.master
      create-master-frames.ts          the left/right master frames beside the line
      is-master-frame.ts               frames that are some brochure's master
    numbering/                         CREATE  Task 4
      page-numbers.ts (+ .types.ts)    PageInfo per book side
      roman.ts
    page-items/                        CREATE  Tasks 5, 6, 9, 10
      page-item.types.ts               PageItemTag, CatalogTextNode, PageItemDefinition
      resolve-template.ts              {page} {pages} {title} {section} {date} {toc}
      table-of-contents.ts             lines of {toc}
      stamp-targets.ts                 which frames get which master side
      plan-page-items.ts               pure diff: adds / updates / removes
      sync-page-items.ts               afterEdit hook writing the plan
      page-item-library.ts             built-in drop-in items
  catalog.points.ts                    CREATE  Task 9: catalogPageItems point
  mode/catalog-keybindings.ts          CREATE  Task 2: Alt+↑/↓
  ui/brochure-tab/                     MODIFY  Tasks 1, 2, 8
    masters-section.tsx                CREATE  Task 8
    section-heading-row.tsx            CREATE  Task 8
  ui/sidebar/
    page-master-field.tsx              CREATE  Task 8
    section-fields.tsx                 CREATE  Task 8
    numbering-fields.tsx               CREATE  Task 8
    page-items-section.tsx             CREATE  Task 9
  ui/design-mode/                      CREATE  Task 7
    from-master-badge.tsx
    from-master-section.tsx
    detach-command.ts
  mcp/brochure-masters.mcp.ts          CREATE  Task 11
design/ui/modules/design-editor-points.ts  MODIFY Task 7: layerBadges point
design/modules/layers/ui/…layer row     MODIFY Task 7: render layerBadges
```

---

### Task 1: Drop pages on blank pages, spread headings and the end of the list (bug fix)

The bug: `BlankPageRow` and the spread heading `<li>` in `brochure-tab.tsx` have no `rowDrag.dropProps`, so `rowDropTarget` finds nothing under the pointer and the drop is lost. The screenshot shows page 25 dropped on the "Blank page" row above BACK COVER.

**Files:**

- Create: `catalog/model/drop-position.ts`, `catalog/model/drop-position.types.ts`
- Modify: `catalog/ui/brochure-tab/brochure-tab.tsx`, `blank-page-row.tsx`, `brochure-page-row.types.ts`, `catalog/model/index.ts`
- Modify: `CHANGELOG.md`, `CHANGELOG.es.md`, `catalog/README.md`

**Interfaces:**

- Produces: `type ListDropTarget = { kind: "page"; slotId: string } | { kind: "blank"; side: number } | { kind: "spread"; first: number } | { kind: "end" }`, and `dropPosition(layout: BookLayout, slots: readonly BrochureSlot[], dragged: string, target: ListDropTarget, side: RowDropSide): number`, the 0-based position to pass to `DesignBrochure.move`. Drop ids are encoded as strings for `useRowDrag`: `page:<slotId>`, `blank:<sideIndex>`, `spread:<firstSideIndex>`, `end`. Also `parseDropId(id: string): ListDropTarget | null`.

- [ ] **Step 1:** Implement `dropPosition` and `parseDropId`. Rules:
  - `page`: `rowDropIndex(from, indexOf(slotId), side)` (today's behavior).
  - `blank` at side `i`: the page goes where the blank is, at the position equal to the number of slots whose first side comes before `i`, adjusted with `rowDropIndex` semantics. `side` is ignored, because a blank only takes the page's place.
  - `spread` with first side `f`: the page becomes that spread's first page (the slot of the first non-blank side at or after `f`, `before`). On the back cover heading this makes the dragged page the back cover. A spread made only of blanks resolves like `blank`.
  - `end`: last position.
  - A `spread`/`blank` that resolves to the dragged page's own position returns its current index (no-op).
- [ ] **Step 2:** In `brochure-tab.tsx`, give every row a drop id: `BrochurePageRow` uses `dropProps("page:" + slotId)` and still grabs by slot id. `BlankPageRow` gets `dropProps("blank:" + index)` and a `dropLine` prop rendered with `rowDropLine`. Spread headings get `dropProps("spread:" + spread[0])` and a highlight (`bg-primary-soft`) while `drag.overId` is theirs. A trailing `<li>` (`h-6`, `flex-1` min) after the last spread gets `dropProps("end")`. `onDrop` becomes `brochure?.move(id, dropPosition(layout, slots, id, parseDropId(overId)!, side))`, and an unparsable id is ignored. `canDrop` rejects `page:<dragged>`.
- [ ] **Step 3:** Changelog `Fixed`: "Pages in the Brochure tab can now be dropped on blank pages, on a spread's heading (for example to make a page the back cover) and at the end of the list. Before, dropping them there did nothing." Spanish under `Correcciones`.
- [ ] **Step 4:** Run `pnpm lint && pnpm typecheck && pnpm format:check`. Expected: all pass.
- [ ] **Step 5:** Commit: `fix(catalog): drop brochure pages on blank pages and spread headings`.

### Task 2: Better reordering: several pages, Alt+↑/↓

**Files:**

- Modify: `catalog/model/slot-edits.ts`, `catalog/model/design-brochure.ts`, `catalog/ui/stores/catalog-view-store.ts` (+ `.types.ts`), `brochure-tab.tsx`, `brochure-page-row.tsx`, `catalog.mode.ts`, `mode/catalog-allowed-commands.ts`
- Create: `catalog/mode/catalog-keybindings.ts`, `catalog/mode/move-page-commands.ts`
- Modify: changelogs, README

**Interfaces:**

- Consumes: Task 1 `dropPosition`.
- Produces: `moveSlots(slots, slotIds: readonly string[], position: number): BrochureSlot[]` (the moved slots keep their relative order and land at `position`, counted in the list without them). `DesignBrochure.moveMany(slotIds: readonly string[], position: number): void`. Commands `catalog.movePageUp` and `catalog.movePageDown`, bound to `Alt+ArrowUp`/`Alt+ArrowDown` in `catalogMode.keybindings`. Store field `selectedSlots: ReadonlySet<string>`, with `selectSlots(ids)`.

- [ ] **Step 1:** Add `moveSlots`, and make `moveSlot` call it with one id.
- [ ] **Step 2:** Row selection: a plain click selects one row and shows the page (today's behavior). Ctrl/Cmd+click toggles a row. Shift+click selects the range in list order. Rows in `selectedSlots` render `bg-primary-soft`. Dragging a selected row drags all selected slots, so the `DragGhost` label reads `t("tab.dragCount", { count })` when there's more than one. Dragging an unselected row drags it alone. `onDrop` calls `moveMany`, with the position worked out by `dropPosition` against the list with the dragged slots removed.
- [ ] **Step 3:** `move-page-commands.ts`: host commands that move the selected slots (or the canvas-selected page) one position up or down. They do nothing at the ends. Register them through the mode, add the keybindings, and add both ids to `CATALOG_ALLOWED_COMMANDS`. The page row's tooltip shows `engine.keymap.label("catalog.movePageUp")`.
- [ ] **Step 4:** i18n keys `tab.dragCount`, `commands.movePageUp`, `commands.movePageDown` (en + es). Changelog `Improved`: "Several brochure pages can be selected (Ctrl or Shift + click) and dragged together, and Alt+↑/↓ moves the selected pages one place."
- [ ] **Step 5:** Run `pnpm lint && pnpm typecheck && pnpm format:check`. Expected: pass. Commit: `feat(catalog): move several brochure pages, Alt+arrows to reorder`.

### Task 3: Model: masters, sections, numbering

**Files:**

- Modify: `brochure/brochure.types.ts`, `brochure/brochure.defaults.ts`, `model/design-brochure.ts`, `model/brochure-pages.ts`, `model/prune-brochure.ts`, `model/index.ts`, `index.ts`
- Create: `model/masters/master-edits.ts`, `model/masters/create-master-frames.ts` (+ `.types.ts`), `model/masters/is-master-frame.ts`, `model/masters/index.ts`

**Interfaces:**

- Produces, in `brochure.types.ts`:
  ```ts
  interface BrochureMaster {
    id: string;
    name: string;
    left: string | null;
    right: string | null;
  } // frame ids
  interface BrochureSection {
    id: string;
    name: string;
    start: string /* slot id */;
    restart?: number;
    style?: PageNumberStyle;
  }
  type PageNumberStyle = "arabic" | "roman-lower" | "roman-upper";
  type CoverNumbering = "numbered" | "hidden" | "uncounted";
  interface BrochureNumbering {
    start: number;
    style: PageNumberStyle;
    covers: CoverNumbering;
  }
  // BrochureSlot gains: master?: string | null  (undefined: the default; null: none)
  //                     skip?: string[]          (master layer ids detached on this page)
  // BrochureElement gains: masters?: BrochureMaster[]; sections?: BrochureSection[]
  // BrochureSettings gains: numbering: BrochureNumbering; defaultMaster: string | null;
  //                         mastersOnCovers: boolean
  ```
  Defaults: `numbering { start: 1, style: "arabic", covers: "hidden" }`, `defaultMaster: null`, `mastersOnCovers: false`, `masters: []`, `sections: []`.
- `isMasterFrame(doc, frameId): boolean`, true for a frame some brochure on its page names as a master side.
- `createMasterFrames(doc, brochure, name): { left: string; right: string }`: two frames the brochure page size (`brochurePageSize`), named `"<name> · left"` and `"<name> · right"`, placed above the brochure's frames' bounds with `ARRANGE_GAPS`, with `clipsContent` true and no fill.
- `DesignBrochure` gains (one undo step each, through `write`): `addMaster(name?): string` (makes frames + record, and sets `defaultMaster` when it's the first), `renameMaster(id, name)`, `removeMaster(id)` (the frames stay, slots pointing at it go back to `undefined`), `setPageMaster(slotIds, master: string | null | undefined)`, `setSections(sections)`, `setNumbering(patch)`, `detachMasterLayer(slotId, sourceId)` (pushes onto `skip`).
- `brochurePages` and the pick tool skip master frames, so a master is never a page. `pruneBrochure`: a deleted master frame sets that side to `null`, and a master with both sides `null` is removed. A deleted slot drops sections that start on it (the next section takes over).

- [ ] **Step 1:** Types and `fillDefaults`.
- [ ] **Step 2:** Pure `master-edits.ts` (add, rename, remove, setPageMaster, setSections, detach) over the record, like `slot-edits.ts`.
- [ ] **Step 3:** `DesignBrochure` methods, `isMasterFrame`, `createMasterFrames`, and the prune and page-skip changes.
- [ ] **Step 4:** Run `pnpm lint && pnpm typecheck && pnpm format:check`. Expected: pass. No changelog yet (nothing visible). Commit: `feat(catalog): brochure masters, sections and numbering in the model`.

### Task 4: Page numbers

**Files:**

- Create: `model/numbering/page-numbers.ts`, `page-numbers.types.ts`, `roman.ts`, `index.ts`

**Interfaces:**

- Consumes: `BookLayout` (`model/book-layout.ts`), Task 3 types.
- Produces: `pageNumbers(layout: BookLayout, record: BrochureElement): PageInfo[]`, indexed like `layout.sides`, with `PageInfo = { counted: boolean; number: number | null; label: string; section: BrochureSection | null; parity: "left" | "right"; cover: boolean }`. Also `toRoman(n: number, lower: boolean): string`.

- [ ] **Step 1:** Implement `pageNumbers`:
  - Walk the sides in order. Covers follow `numbering.covers`: `numbered` counts and labels them, `hidden` counts them with an empty `label`, `uncounted` neither counts nor labels them.
  - A side whose slot starts a section with `restart` resets the counter to it and switches to the section's `style`. The current section carries to later sides.
  - Blanks are counted, and get `label` `""`.
  - `parity` comes from the layout: book layout `(i + offset) % 2 === 0` is left (as `bookLayout` does), and the single layout is always `right`.
- [ ] **Step 2:** Run `pnpm typecheck`. Expected: pass. Commit together with Task 5.

### Task 5: Templates and the table of contents

**Files:**

- Create: `model/page-items/page-item.types.ts`, `resolve-template.ts`, `table-of-contents.ts`, `index.ts`

**Interfaces:**

- Produces:
  ```ts
  // On any design text node (plain data; catalog owns the fields):
  interface CatalogTextFields {
    catalogText?: string;
  } // the template, e.g. "Page {page} of {pages}"
  interface PageItemTag {
    brochure: string;
    master: string;
    source: string;
  } // on stamped copies
  interface CatalogCopyFields {
    catalogCopy?: PageItemTag;
  }
  interface TemplateContext {
    info: PageInfo;
    pages: number;
    title: string;
    date: string;
    toc: string;
  }
  ```
  `resolveTemplate(template: string, context: TemplateContext): string`. Tokens are `{page}` (label), `{pages}` (count of counted sides), `{title}` (brochure name), `{section}` (section name or `""`), `{date}` (`Intl.DateTimeFormat` in the app's locale, `dateStyle: "long"`, date of the sync) and `{toc}`. `{{` escapes a brace. An unknown token stays as written.
  `tableOfContents(record, layout, numbers): string`: one line per section, `"<name>\t<label of its first side>"`. With no sections, one line per page: `"<frame name>\t<label>"`. If the text renderer has no tab stops, join with `"  ·  "` instead (check `canvas/text` layout).
- [ ] **Step 1:** Implement both.
- [ ] **Step 2:** Run `pnpm lint && pnpm typecheck`. Expected: pass. Commit: `feat(catalog): page numbers and page item templates`.

### Task 6: Stamping masters into pages (the sync)

**Files:**

- Create: `model/page-items/stamp-targets.ts` (+ `.types.ts`), `plan-page-items.ts` (+ `.types.ts`), `sync-page-items.ts`
- Modify: `catalog.module.ts` (contribute `designCanvas.afterEdit`), README, changelogs

**Interfaces:**

- Consumes: Tasks 3–5, `bookLayout`, `brochurePages`, `currentBrochure`, `brochurePageSize`/`partRect`, and the core duplicate operation (the one `duplicate_nodes` uses) for deep copies with new ids.
- Produces:
  - `stampTargets(doc, record, layout, numbers): StampTarget[]`, with `StampTarget = { frame: string; offsetX: number; master: BrochureMaster; side: "left" | "right"; info: PageInfo; skip: ReadonlySet<string> }`. Every option frame of a slot is a target (not only the chosen one). A spread frame gives two targets: left half at `offsetX = 0` and right half at `offsetX = pageWidth`. Covers are targets only when `mastersOnCovers` is set. `slot.master === null` gives none. Only the brochure that is `current` on its page stamps.
  - `planPageItems(doc, record, targets, now): PageItemPlan`, with `PageItemPlan = { add: CanvasElement[]; update: { id: string; patch: object }[]; remove: string[] }`. Pure: it compares wanted copies (keyed by `frame + source`) with the existing children tagged `catalogCopy.brochure === record.id`.
    - Copies are direct children of the page frame, on top in z-order (`keyBetween` after the last child), positioned at master child offset + `offsetX`, and `locked: true`.
    - A master child's descendants are copied with it; only the top copy carries the tag's `source`, and descendants carry `catalogCopy` with their own `source` ids.
    - Text with `catalogText`, both copies and untagged page-item text placed straight on a page, gets `text = resolveTemplate(...)`.
    - When the same `frame + source` appears twice (a live-session race), keep the first by id and remove the others.
  - `syncPageItems(doc, change, kinds): void`, the `afterEdit` hook. It returns at once unless `change` touches a brochure record, a master frame or its descendants, a page frame (added, removed, moved in z, resized), or a node with `catalogText`. It then runs `planPageItems` for each affected brochure and writes the plan with `doc.add`/`doc.updateMany`/`doc.remove`. Never `checkpoint()`, since afterEdit is already inside the user's undo step. An empty plan writes nothing, so the hook's own writes end the re-run.
- [ ] **Step 1:** `stampTargets`.
- [ ] **Step 2:** `planPageItems`. Copied fields come from the master child, overriding geometry and the tag. A changed master child updates its copies with only the changed fields.
- [ ] **Step 3:** `syncPageItems`, contributed in `catalog.module.ts` and documented in the README.
- [ ] **Step 4:** Also re-sync when the date changes. On mode enter (`useArrangeOnEnter` already runs then), call `brochure.refreshItems()`, which runs the plan once in its own undo step only when `{date}` output differs.
- [ ] **Step 5:** README: describe masters, stamping, tags and tokens, and remove "page numbers drawn on pages, master elements" from "Not yet". Changelog `New`: "Brochures have masters: design a header and footer once, for left and right pages, and every page shows it with its own page number, the brochure's title and the current section, kept up to date as pages move." Spanish under `Novedades`.
- [ ] **Step 6:** Run `pnpm lint && pnpm typecheck && pnpm format:check`. Expected: pass. Commit: `feat(catalog): stamp brochure masters onto their pages`.

### Task 7: Master layers in the Design mode: locked, marked, detachable

**Files:**

- Modify: `design/ui/modules/design-editor-points.ts` (new `layerBadges` point: `{ id: string; badge(el: CanvasElement): ReactNode | null }`, keyed by id) and its types; the layers module's layer row, to render the badges after the name (find the row component in `modules/layers/ui/`).
- Create: `catalog/ui/design-mode/from-master-badge.tsx`, `from-master-section.tsx` (a `propertySections` entry), `detach-command.ts`, and `catalog/model/page-items/strip-copy-tags.ts` (the `prepareCopies` hook)
- Modify: `catalog.module.ts`, i18n, README, changelogs

**Interfaces:**

- Consumes: `catalogCopy` (Task 5), `DesignBrochure.detachMasterLayer` (Task 3).
- Produces: the `layerBadges` point (core UI, owned by the design editor, so other features can use it); `stripCopyTags(copies, context): CanvasElement[]`.

- [ ] **Step 1:** Add the `layerBadges` point and render it in the layer row.
- [ ] **Step 2:** `FromMasterBadge`: a lock icon in `text-muted-foreground` with the tooltip `t("design.fromMaster", { master })`. Contribute it for elements with `catalogCopy`.
- [ ] **Step 3:** `FromMasterSection`: shown when the selection is a copy (reached through the layer tree or the context menu). It says "Comes from master A in brochure X" and offers "Edit master" (selects and zooms to the master frame's matching side) and "Detach" (one undo step: `detachMasterLayer` plus removing `catalogCopy` and `locked` from the copy; detaching an ancestor detaches its descendants). The sync skips detached sources through `slot.skip`.
- [ ] **Step 4:** `stripCopyTags` (`designCanvas.prepareCopies`): copies lose `catalogCopy` and `locked`, so a duplicated page is clean before the sync stamps it.
- [ ] **Step 5:** Unlocking a copy (context menu or `lock_nodes`) is undone by the next sync. State this in the section's text ("Detach to edit it here").
- [ ] **Step 6:** Changelog `New`: "In the Design mode, headers and footers from a brochure master are locked and marked with a lock. Edit them on the master, or detach one to change it on a single page." Run `pnpm lint && pnpm typecheck && pnpm format:check`. Expected: pass. Commit: `feat(catalog): lock and mark master layers in the Design mode`.

### Task 8: Catalog UI: masters, page master, sections, numbering

**Files:**

- Create: `ui/brochure-tab/masters-section.tsx`, `ui/brochure-tab/section-heading-row.tsx`, `ui/sidebar/page-master-field.tsx`, `ui/sidebar/section-fields.tsx`, `ui/sidebar/numbering-fields.tsx` (with `.types.ts` files where they take props)
- Modify: `brochure-tab.tsx`, `page-section.tsx`, `brochure-settings-section.tsx`, `ui/canvas/page-badge.tsx`, i18n, README, changelogs

**Interfaces:**

- Consumes: Task 3 `DesignBrochure` methods, Task 4 `pageNumbers`.

- [ ] **Step 1:** `MastersSection`: a collapsible section above the page list. Each master row shows a thumbnail of both sides (`ElementThumbnail`) and a name you can rename with `useCommitField` (double-click). A click shows its frames, double-click opens them in the Design mode (`editCatalogPage`), "+" calls `addMaster`, and × calls `removeMaster`. The default master is marked "Default".
- [ ] **Step 2:** `PageMasterField` in the page sidebar is a `SelectField`: "Default (A)", each master, or "None". It applies to every selected slot (Task 2 selection).
- [ ] **Step 3:** `SectionFields` in the page sidebar: "Start a section here" (`CheckboxField`), name (`useCommitField`), "Restart numbering at" (`NumberInput`, optional) and style (`SelectField`: 1 2 3 / i ii iii / I II III). `SectionHeadingRow` shows a section's name in the tab list above its first page.
- [ ] **Step 4:** `NumberingFields` in the brochure settings: start, style, covers (numbered / counted but hidden / not counted) and "Masters on covers".
- [ ] **Step 5:** Page rows and canvas badges show the printed label (`pageNumbers`), not the list index, when they differ (e.g. "iv").
- [ ] **Step 6:** i18n en + es. Changelog `New`: "Brochures can be split into sections. A section's name can appear in headers, and numbering can restart or switch to roman numerals, with covers counted, hidden or left out." Run `pnpm lint && pnpm typecheck && pnpm format:check`. Expected: pass. Commit: `feat(catalog): masters, sections and numbering in the Brochure tab`.

### Task 9: The page items library (drop-in components)

**Files:**

- Create: `catalog/catalog.points.ts` (`catalogPageItems: definePoint<PageItemDefinition>("catalog.pageItems", { keyOf: (item) => item.id })`), `model/page-items/page-item-library.ts`, `ui/sidebar/page-items-section.tsx`, `ui/hooks/use-drop-on-canvas.ts` (+ types)
- Modify: `catalog.module.ts` (contribute the built-ins), `catalog/index.ts` (export the point and type for plugins), i18n, README, changelogs

**Interfaces:**

- Produces: `PageItemDefinition = { id: string; label: string; icon: LucideIcon; template: string; anchor: "header" | "footer"; align: "outer" | "center" | "inner"; fontSize: number }`. Built-ins:

  | id            | template                                            | anchor / align                                                        |
  | ------------- | --------------------------------------------------- | --------------------------------------------------------------------- |
  | `page-number` | `{page}`                                            | footer / outer                                                        |
  | `page-of`     | `Page {page} of {pages}` (translated when inserted) | footer / center                                                       |
  | `title`       | `{title}`                                           | header / inner                                                        |
  | `section`     | `{section}`                                         | header / outer                                                        |
  | `folio`       | `{section} · {page}`                                | footer / outer                                                        |
  | `date`        | `{date}`                                            | footer / inner                                                        |
  | `toc`         | `{toc}`                                             | page body (top of the margin box, full width, `autoResize: "height"`) |

  `insertPageItem(engine, item, target: { frame: string; side: "left" | "right" }, at?: Point): string` creates a text node through the text module's factory, with `catalogText` set, inside the frame. With no `at`, it's placed by `anchor`/`align` inside `settings.margin` (outer means left on a left page and right on a right page). Returns its id. It's one undo step.

- [ ] **Step 1:** Point, library, `insertPageItem`.
- [ ] **Step 2:** `PageItemsSection` in the catalog sidebar, shown when a master or a page is selected: one row per item (icon, label, a preview of the resolved text for the selected page). A click inserts into the selected master side, or into the page when a page is selected. Dragging a row onto the canvas (`useDropOnCanvas`: pointer events like `useRowDrag`, `engine` screen→world, the frame under the pointer through `engine.hitTest` limited to page and master frames) inserts at the drop point. A drop outside a frame does nothing and shows the ghost greyed.
- [ ] **Step 3:** On a master, "outer" in the left master side mirrors the right side. Inserting into one side offers "Add to both sides" (default on), which inserts the mirrored item into the other side too.
- [ ] **Step 4:** Changelog `New`: "A list of ready-made page items (page number, \"Page 3 of 24\", title, section, date and table of contents) can be clicked or dragged onto a master or a page." Run `pnpm lint && pnpm typecheck && pnpm format:check`. Expected: pass. Commit: `feat(catalog): page items to drop on masters and pages`.

### Task 10: Automatic table of contents

**Files:**

- Modify: `model/page-items/plan-page-items.ts` (`{toc}` context), `table-of-contents.ts`, the checks (`checks/layout-issues.ts`: a TOC text overflowing its frame), README, changelogs

- [ ] **Step 1:** `planPageItems` computes `toc` once per brochure and resolves it into any `{toc}` text, wherever it sits: a master copy or a page.
- [ ] **Step 2:** A check, "Table of contents doesn't fit its page", when a TOC text's height exceeds its frame's margin box.
- [ ] **Step 3:** Changelog `New`: "The table of contents item lists the brochure's sections, or its pages, with their page numbers, and updates when pages move." Run `pnpm lint && pnpm typecheck && pnpm format:check`. Expected: pass. Commit: `feat(catalog): automatic table of contents`.

### Task 11: Agent tools

**Files:**

- Create: `catalog/mcp/brochure-masters.mcp.ts`
- Modify: `mcp/brochure-settings.mcp.ts` (numbering, `defaultMaster`, `mastersOnCovers`), `mcp/brochure-edit.mcp.ts` (`set_brochure_page_options` takes `master`; `move_brochure_page` takes `positions[]` for several), `mcp/describe-brochure.ts` (masters, sections, each page's label and master), `mcp/index.ts`, README

**Interfaces:**

- Produces MCP tools (English text; each validates every argument, then writes in one `asUndoStep`):
  - `create_brochure_master { brochure, name? }` → `{ master, left, right }` frame ids
  - `remove_brochure_master { brochure, master }`
  - `set_brochure_sections { brochure, sections: [{ name, startPosition, restart?, style? }] }`
  - `add_page_item { brochure, item: <library id>, master?, side?, position?, x?, y? }` (exactly one of `master`+`side` or `position`)
  - `detach_master_layer { brochure, node }`
- [ ] **Step 1:** Implement them, list them in the README's MCP tools line, and describe the tokens in `add_page_item`'s description.
- [ ] **Step 2:** Run `pnpm lint && pnpm typecheck && pnpm format:check`. Expected: pass. Commit: `feat(catalog): agent tools for masters, sections and page items`.

---

## Later (not in this plan)

- A per-page override of a single master item (change one page number's color without detaching).
- TOC with dot leaders and page links in the PDF (PDF outlines/bookmarks from sections).
- Master inheritance (B-Master based on A-Master).
