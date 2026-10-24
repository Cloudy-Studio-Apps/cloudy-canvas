# Catalog: Arrange Pages and Options Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A brochure setting that lays its frames out on the canvas — printed pages on one main line grouped by spread, each page's other options in a lane below or beside it — kept up automatically while on (choosing an option swaps it onto the line, with a glide animation), with other layers pushed out of the way.

**Architecture:** A pure layout (`model/arrange/`) turns the brochure's `BookLayout` into target positions for every brochure frame, plus a pure push-aside for the other top-level layers of the page. `DesignBrochure` runs it inside the same undo step as every slot or settings edit when `settings.arrange !== "off"` (and on demand with `arrange()`), writing plain `x`/`y` offsets to the frames and their descendants. It reports what moved through `DesignBrochures.onArranged`; a catalog session hook hands that to a new engine animation, `engine.animateMoves(offsets)`, which draws the moved views gliding from their old place (render-only, like `animateIn`).

**Tech Stack:** TypeScript (strict, `noUncheckedIndexedAccess`), PixiJS views, React 19, Zustand-free (brochure state lives in the document).

**Spec:** this conversation (2026-10-24): user's request + answers — (1) when arrange is on, every page/option added, removed or reordered re-flows the layout; (2) other layers overlapping the needed space are moved down or up to free it; the swap animates.

## Global Constraints

- Verification is `pnpm lint`, `pnpm typecheck` and `pnpm format:check` only (CLAUDE.md: there is no test framework; do not run `tauri dev`, cargo or builds). Each task ends with them passing.
- Commit only when the user asks (harness rule); no commit steps below.
- Engine code is plain TS: `model/arrange/` and `canvas/render/` may not import React, `@shared/ui`, `@platform`.
- Every `interface`/`type` goes in a sibling `.types.ts` file, imported with `import type`; barrels re-export with `export type`. Files stay small (~200 lines max), one concern each.
- Never branch on `el.type` outside an element's folder.
- Positions are rounded to whole units.
- Existing brochures load with `arrange: "off"` (nothing on the canvas moves until the user opts in).
- Every arrange (auto or button) is part of exactly one undo step: the edit that caused it, or its own step for `arrange()`.
- Animations are skipped with reduced motion (`prefersReducedMotion()`).
- Update CLAUDE.md's Catalog mode paragraph (and the canvas engine paragraph for `animateMoves`).

## Review Focus

- **Options of different sizes in one page** (a spread frame among single-page options, or a wider option): lanes must size to their widest frame so nothing overlaps after a swap. Task 2's layout reserves each side's lane by the widest frame it holds.
- **Layers inside the target area, including groups and rotated layers**: push-aside must use each top-level layer's full extent (its own turned bounds ∪ its descendants'), or a group whose stored box is stale stays under a page. Task 3 computes extents that way.
- **Push-aside cascading**: a layer pushed down can land on another layer below; that one must move too, by the same amount, until nothing pushed overlaps anything unpushed. Task 3's fixpoint.
- **Repeated arranges must be idempotent**: running arrange twice with no change moves nothing and emits nothing (no empty undo step, no animation). Task 4 filters zero offsets and skips the write.
- **Agents editing a brochure on another page or through an actor workspace**: the arrange must run on the brochure's own design page (its frames and layers), never the page on screen; glides for views not drawn are ignored. Task 4 reads everything by `brochure.page`.

---

### Task 1: The `arrange` setting

**Files:**

- Modify: `src/products/design/modules/catalog/brochure/brochure.types.ts`
- Modify: `src/products/design/modules/catalog/brochure/brochure.defaults.ts`
- Modify: `src/products/design/modules/catalog/brochure/brochure.constants.ts` (add `BROCHURE_ARRANGES`, next to `BROCHURE_LAYOUTS`/`BROCHURE_COVERS`)
- Modify: `src/products/design/modules/catalog/brochure/index.ts`

**Interfaces:**

- Produces: `type BrochureArrange = "off" | "below" | "beside"`; `BrochureSettings.arrange: BrochureArrange`; `BROCHURE_ARRANGES: readonly BrochureArrange[]`; default `arrange: "off"`.

- [ ] **Step 1:** Add `BrochureArrange` with a doc comment: `off` leaves the canvas alone; `below`: printed pages on one row left to right (grouped by spread), each page's other options stacked under it; `beside`: printed pages in one column top to bottom (a spread per row), options out to the side (left page's to the left, the others' to the right). Add `arrange` to `BrochureSettings` (comment: kept up after every edit of the brochure while not `off`).
- [ ] **Step 2:** Add `arrange: "off"` to `BROCHURE_DEFAULTS.settings` and export `BROCHURE_ARRANGES`. `BrochureKind.fillDefaults` already spreads the defaults under stored settings, so older records get `"off"`; confirm, change nothing there.
- [ ] **Step 3:** Run `pnpm typecheck && pnpm lint`. Expected: pass (fix any exhaustive object literals of `BrochureSettings` the compiler flags).

### Task 2: Pure layout of the brochure's frames

**Files:**

- Create: `src/products/design/modules/catalog/model/arrange/arrange.constants.ts`
- Create: `src/products/design/modules/catalog/model/arrange/arrange.types.ts`
- Create: `src/products/design/modules/catalog/model/arrange/arrange-blocks.ts`
- Create: `src/products/design/modules/catalog/model/arrange/arrange-frames.ts`
- Create: `src/products/design/modules/catalog/model/arrange/index.ts`

**Interfaces:**

- Consumes: `BookLayout`, `BookSide`, `BrochurePage` (`model/`), `BrochureArrange` (Task 1), `Point`, `Rect` from `@canvas`.
- Produces:
  - `ARRANGE_GAPS = { spine: 0, spread: 160, option: 80 } as const` (world units; pages of one spread touch at the spine, spreads 160 apart, options 80 from the page and from each other).
  - `interface ArrangeBlock { left?: BrochurePage; right?: BrochurePage; across?: BrochurePage }` — one spread: the page left of the spine, right of it, or one page across it (a spread frame).
  - `arrangeBlocks(layout: BookLayout, settings: BrochureSettings): ArrangeBlock[]`
  - `arrangeFrames(blocks: readonly ArrangeBlock[], mode: "below" | "beside", origin: Point): Map<string, Point>` — the new top-left of every frame of every page (printed and options).

- [ ] **Step 1: `arrangeBlocks`.** One block per entry of `layout.spreads`. For each side of kind `page`: `part !== "whole"` (half of a spread frame) → `across` (add the page once); otherwise, in the book layout, side `i` goes `left` when `(i + layout.offset) % 2 === 0`, else `right`; in the single layout every page is `right`. Blank sides add nothing. A page already placed in an earlier block is skipped (a spread frame's halves can fall in two spreads in the single layout).
- [ ] **Step 2: `arrangeFrames`, `below` mode.** Walk blocks left to right from `origin.x`. Per block: `leftW` = widest frame among `left`'s options (0 when none), `rightW` likewise, `acrossW` likewise; the block's width is `max(leftW + spine + rightW, acrossW)`, and its spine sits at `blockX + max(leftW, acrossW / 2)`. Printed frames on the main line at `y = origin.y`: left page's right edge at the spine, right page's left edge at the spine (+ `spine`), an across frame centered on the spine. Each page's other options (in `slot.frames` order, the printed one removed) stack downward from below the printed frame by `option` gap, aligned like their page (right edge at the spine for left pages, left edge for right pages, centered for across). Next block starts at `blockX + blockWidth + spread`. Round every point.
- [ ] **Step 3: `arrangeFrames`, `beside` mode.** Same blocks as rows, top to bottom from `origin.y`; one shared spine x for every row: `origin.x + max over blocks of (left lane width)` where a left lane width is `leftW` plus, for each left option, its width + `option` (lane extends left), and an across block counts half its widest frame. Row height = tallest frame in the block (printed and options). Printed frames top-aligned at the row's y on the spine as in Step 2; left page's options extend leftward from the left page, right/across pages' options extend rightward from the page (across: from its right edge), each `option` apart, top-aligned to the row. Next row at `rowY + rowH + spread`.
- [ ] **Step 4:** Run `pnpm typecheck && pnpm lint`. Expected: pass.

### Task 3: Pure push-aside of other layers

**Files:**

- Create: `src/products/design/modules/catalog/model/arrange/push-aside.ts`
- Modify: `src/products/design/modules/catalog/model/arrange/arrange.types.ts`, `index.ts`

**Interfaces:**

- Produces:
  - `interface ArrangeObstacle { id: string; rect: Rect }`
  - `pushAside(area: Rect, obstacles: readonly ArrangeObstacle[], gap: number): Map<string, Point>` — offsets (dx always 0) for the obstacles to move.

- [ ] **Step 1: Implement `pushAside`.** Obstacles intersecting `area` (grown by `gap`) split by their center: above `area`'s middle → the up group, else the down group. Down group: `dy = area.bottom + gap − min(top of the group)`; then fixpoint: any unmoved obstacle intersecting a moved one's shifted rect (grown by `gap`) and not in the up group joins the down group with the same `dy` (re-check until stable). Up group mirrored: `dy = area.top − gap − max(bottom of the group)` (negative), cascading upward. Returns offsets rounded, omitting zero ones.
- [ ] **Step 2:** Run `pnpm typecheck && pnpm lint`. Expected: pass.

### Task 4: Arranging in the document and in `DesignBrochure`

**Files:**

- Create: `src/products/design/modules/catalog/model/arrange/arrange-brochure.ts`
- Modify: `src/products/design/modules/catalog/model/design-brochure.ts`
- Modify: `src/products/design/modules/catalog/model/design-brochures.ts`
- Modify: `src/products/design/modules/catalog/model/index.ts`

**Interfaces:**

- Consumes: Tasks 1–3; `withDescendants`, `childrenByParent` (`core/tree/tree-members.ts`, via the design barrel), `isDesignNode`, `rotatedBounds` from `@canvas`, `Emitter` from `@canvas`.
- Produces:
  - `arrangeBrochure(doc: CanvasDocument, brochure: BrochureElement, layout: BookLayout, pages: readonly BrochurePage[]): Map<string, Point>` — writes the moves (`doc.updateMany`, no checkpoint) and returns every moved node's offset (frames, pushed layers and all their descendants; the offset applied, as a `Point` `{ x: dx, y: dy }`).
  - `DesignBrochure.arrange(): ReadonlyMap<string, Point>` — the moves made (empty when the layout already holds), in one undo step, arranging with the current `settings.arrange` (`"off"` arranges as `"below"`, the button's one-off tidy).
  - `DesignBrochures.onArranged(listener: (moved: ReadonlyMap<string, Point>) => void): () => void`.

- [ ] **Step 1: `arrangeBrochure`.** Frames = every option of every page. Origin = top-left of the union of those frames' current rects (so the layout stays where the brochure is). Targets from `arrangeFrames(arrangeBlocks(layout, settings), mode, origin)`; frame offsets = target − current, zero ones dropped. Area = union of the target rects. Obstacles = the brochure page's top-level design nodes (`pageId === brochure.page`, no `parentId`, not a brochure frame, not hidden-irrelevant: hidden ones still count), each `rect` = union of `rotatedBounds` of the node and of all its descendants (`childrenByParent`). `pushAside(area, obstacles, ARRANGE_GAPS.option)`. Expand both offset maps to descendants (`withDescendants`), write `{ x: x + dx, y: y + dy }` for every moved id in one `doc.updateMany` (design nodes keep all local geometry relative to `x`/`y`, and groups re-resolve from their children, so a translate is exact). Return the expanded map; return an empty map without writing when nothing moves.
- [ ] **Step 2: Hook it into `DesignBrochure`.** Constructor takes a third argument `onArranged: (moved: ReadonlyMap<string, Point>) => void`. `write(patch)`: checkpoint, then `doc.batch(() => { update; if (settings after the patch).arrange !== "off" run arrangeBrochure(...) })`, then call `onArranged` when the map isn't empty. `addNewPage` already batches: its inner `addPages` must not checkpoint again (pass through `writeSlots` as today; the outer batch keeps one step). `arrange()`: computes the map in its own checkpoint + batch; does nothing (no checkpoint) when the layout already holds — compute targets first and skip when every offset is zero.
- [ ] **Step 3: `DesignBrochures`.** Holds an `Emitter` of moves; `handle(id)` passes `(moved) => emitter.emit(moved)`; add `onArranged`. (An emitter needs no cleanup, so the service rule holds.)
- [ ] **Step 4:** Run `pnpm typecheck && pnpm lint`. Expected: pass.

### Task 5: The move glide in the canvas engine

**Files:**

- Create: `src/canvas/render/move-glide.ts`
- Modify: `src/canvas/render/element-view.ts` (a glide offset applied where `placeScaled` places the view)
- Modify: `src/canvas/render/layers/element-layer.ts` (glides map + `tick`)
- Modify: `src/canvas/render/renderer.ts` (`animateMoves`, frames + elements layers, reduced motion)
- Modify: `src/canvas/canvas-engine.ts` (public `animateMoves`, requesting frames like `animateIn`)

**Interfaces:**

- Produces:
  - `MOVE_GLIDE = { durationMs: 280 }`; `moveGlideAt(elapsed: number): number | null` — the share of the offset still to cover at `elapsed` ms: `(1 − t)³` for `t = elapsed / durationMs` (easeOutCubic), `null` once `t ≥ 1`.
  - `ElementView.setGlide(dx: number, dy: number): void`
  - `ElementLayer.animateMoves(offsets: ReadonlyMap<string, Point>, now: number): void` — a view moved by `offset` starts drawn at `−offset` from its new place; `tick` folds glides into its "still playing" result.
  - `CanvasEngine.animateMoves(offsets: ReadonlyMap<string, Point>): void` — `offsets` are what each element moved by; ids not drawn are ignored; nothing with reduced motion.

- [ ] **Step 1:** Implement `moveGlideAt` and `setGlide` (stored, then applied as a position offset in the same place the entrance's scale is applied; a view whose element syncs mid-glide keeps its glide offset on top of the new position).
- [ ] **Step 2:** Add the glides map to `ElementLayer` beside `entrances` (cleared on remove; a new glide for an id replaces the running one, starting from its current remaining offset added to the new one), advanced in `tick`. Wire `Renderer.animateMoves` and `CanvasEngine.animateMoves` exactly as `animateIn` is wired, so the frame loop keeps running while one plays.
- [ ] **Step 3:** Run `pnpm typecheck && pnpm lint`. Expected: pass.

### Task 6: Catalog UI — setting, Arrange button, glide hook

**Files:**

- Create: `src/products/design/modules/catalog/ui/sidebar/arrange-fields.tsx`
- Create: `src/products/design/modules/catalog/ui/hooks/use-arrange-glide.ts`
- Modify: `src/products/design/modules/catalog/ui/sidebar/brochure-settings-section.tsx` (render `<ArrangeFields />` after `<LayoutFields />`)
- Modify: `src/products/design/modules/catalog/ui/toolbar/catalog-mode-toolbar.tsx` (an "Arrange" button, Lucide `LayoutGrid`, tooltip "Arrange pages and options")
- Modify: `src/products/design/modules/catalog/catalog.module.ts` (session hook `catalog.arrange-glide`)

**Interfaces:**

- Consumes: `BROCHURE_ARRANGES`, `DesignBrochure.arrange()`, `setSettings({ arrange })`, `DesignBrochures.onArranged`, `engine.animateMoves`.

- [ ] **Step 1: `ArrangeFields`.** A `SettingSelect` labelled "Arrange on canvas" with choices `off` "Off", `below` "Options below each page", `beside` "Options beside each page" (`SettingChoice<BrochureArrange>[]`), writing `brochure?.setSettings({ arrange })`; under it a small secondary `Button` "Arrange now" (disabled without a brochure or pages) calling `brochure.arrange()`. Sharp styling per the design system (`rounded-md`, semantic tokens).
- [ ] **Step 2: `useArrangeGlide`.** Subscribes to `useService(DESIGN_BROCHURES).onArranged` in an effect and calls `engine.animateMoves(moved)`; unsubscribes on cleanup. Register it in `catalog.module.ts` as a `designEditor.sessionHooks` entry (runs in every mode, so an agent's arrange glides while the user is in Design mode too).
- [ ] **Step 3:** Toolbar button calls `brochure?.arrange()` (via `useBrochure()`), disabled without pages.
- [ ] **Step 4:** Run `pnpm typecheck && pnpm lint && pnpm format:check`. Expected: pass.

### Task 7: Agents and docs

**Files:**

- Modify: `src/products/design/modules/catalog/agent/brochure-settings.agent-tools.ts`
- Modify: `CLAUDE.md` (Catalog mode paragraph; canvas engine: `animateMoves` next to `ctx.animateIn`)

**Interfaces:**

- Consumes: `BROCHURE_ARRANGES`, `DesignBrochure.arrange()`.

- [ ] **Step 1:** `set_brochure_settings`: add `arrange: { enum: BROCHURE_ARRANGES }`, read with `optionalChoice`, and a sentence in the description: "`arrange` lays the brochure's frames out on the canvas and keeps them so after every brochure edit (`below`: printed pages in a row by spread, other options under each; `beside`: a spread per row, options to the side; `off`, the default, leaves them where they are); other layers in the way are moved up or down."
- [ ] **Step 2:** New tool `arrange_brochure` (`required: ["brochure"]`): "Lays the brochure's frames out once as its `arrange` setting says (`below` when it's off) and moves other layers out of the way, in one undo step. Returns how many layers moved." Runs `brochure.arrange()`; returns `{ moved }` (the top-level layers in the map `arrange()` returns: ids whose parent isn't in it).
- [ ] **Step 3:** CLAUDE.md: in the Catalog paragraph, document `settings.arrange`, `model/arrange/` (`arrangeBlocks`, `arrangeFrames`, `pushAside`, `arrangeBrochure`, `ARRANGE_GAPS`), the auto re-flow inside the edit's undo step, `DesignBrochures.onArranged` → `useArrangeGlide` → `engine.animateMoves`, the sidebar's `ArrangeFields`, the toolbar button and the agent tool. In the canvas engine paragraph, `engine.animateMoves(offsets)` (`render/move-glide.ts`).
- [ ] **Step 4:** Run `pnpm typecheck && pnpm lint && pnpm format:check`. Expected: pass.
