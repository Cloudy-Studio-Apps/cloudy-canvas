# Precision editing plan: smart guides, snapping, align & distribute, rotation, rulers

## Context

The Design editor (`/design/:id`) has the core node types, pages, vectors and agent tools, but it is
missing the tools for placing things precisely. Every professional design tool has them, and without
them laying out a UI by hand is slow and inexact. What the code has today:

- **No snapping.** The select tool's move (`canvas/tools/select-tool.ts`) applies the raw pointer delta.
  `ResizeGesture` and `NodeDrawTool` round to whole units only.
- **Resize works on one element only** (`render/overlay-state.ts`: resize handles are drawn only when
  `selected.length === 1`). A multi-selection shows a union outline that can't be resized.
- **No arrow-key nudge** (`input/base-keybindings.ts`).
- **Align covers six directions, with no distribute.** `modules/core/ui/sections/align.ts` lives in the
  Design UI, with no command, shortcut or agent tool.
- **No rotation anywhere.** The Figma import (`figma/convert/fig-matrix.ts`) has to flatten rotated
  nodes because of this.
- **No rulers or ruler guides.**

Goal: precise layout in the Design editor (and the board where it fits), built as engine features
products opt into, following the module and kind architecture in CLAUDE.md.

The first implementation step copies this plan to `docs/plans/precision-editing.md` in the repo.

Scope decisions (assumed; easy to change):

- Snapping, multi-resize, nudge, align & distribute: **engine level**. The Design turns them all on and
  the board turns on nudge, multi-resize and align/distribute (snapping off by default, toggleable).
- Rotation and rulers: **Design only** (engine hooks are generic, but only design kinds use them).

---

## Phase 0: Transform foundations (do first, everything builds on it) — done

1. **Arrow-key nudge.** New commands `nudgeLeft/Right/Up/Down` (Arrow keys; Shift = 10 units) in
   `canvas/commands.ts` + `BASE_KEYBINDINGS`. Moves the selection with `withMembers(…, "move")` and skips
   locked elements. It doesn't call `onMoved`, so a nudge never changes a node's parent (Figma's behavior). Repeated presses within ~1 s join one undo step (checkpoint only
   when the last nudge is older). Tools that own arrows (vector edit) take them via `onCommand`:
   `VectorMoveTool` nudges the selected points.
2. **Multi-selection resize.** A `SelectionTransform` (`canvas/tools/selection-transform.ts`): the
   union box of the selected boxed elements gets the 8 resize handles. Dragging scales every element's
   rect relative to that box (`scaleRectInBox(rect, from, to)` in `geometry.ts`) through
   `kind.resize`, which keeps per-kind rules (text relayout, table grid, `keepsRatio`). `ResizeGesture`
   becomes the single-element case of the same gesture. Alt resizes from the center (single and multi),
   Shift keeps the proportions, as it does now.
3. **Size badge.** While an element or selection is moved or resized, a small `W × H` label shows under
   the selection box (overlay, screen space; the Design shows it always while selected, like Figma).
   Opt in with a product view option `sizeBadge`.

Files: `canvas/tools/select-tool.ts`, `canvas/tools/resize-gesture.ts`, `canvas/render/overlay-state.ts`,
`canvas/render/layers/overlay-layer.ts`, `canvas/commands.ts`, `canvas/input/base-keybindings.ts`,
`canvas/geometry.ts`.

## Phase 1: Snapping and smart guides — done

As built (differences from the plan below): targets are chosen by `ElementKind.snapTarget(el)`
instead of a product hook (hidden design layers and groups aren't targets); the defaults come from
`CanvasViewOptions.snapping`; the toggles are in the shared `ZoomMenu` (both editors), not the main
menu; the pen tool doesn't snap yet; "Snap to guides" comes with the ruler guides (Phase 4).

### Engine (`canvas/snapping/`, new folder)

- `snap.types.ts`: `SnapLine { axis: "x" | "y"; value; from; to; source: id | "grid" | "guide" }`,
  `SnapResult { dx, dy, guides: SnapGuide[] }`, `SnapSettings { objects, pixelGrid, guides }`.
- `snap-targets.ts`: builds the candidate lines once per gesture from the **scene** (resolved
  geometry, current scope, visible and unclipped elements only): each element's left/center/right
  and top/middle/bottom, minus the moved elements and their `withMembers` (so a frame never snaps to its
  own children). Limited to elements whose bounds intersect the viewport, plus the parent container's
  edges and center. Product hook `snapTargets?(el, elements)` in `canvas-product.types.ts` /
  `canvas/modules` points to override (the Design adds the parent frame's padding later; text could add
  baselines).
- `snap-rect.ts`: `snapRect(rect, targets, threshold, handles?)` checks the moving rect's 3 x-lines
  and 3 y-lines against the targets (binary search over sorted values), picks the nearest per axis
  within `threshold = SNAP_PX / zoom` (`SNAP_PX = 6`), and returns the offset plus every line matched at
  that offset (several aligned edges light up at once). For a resize, only the dragged edges snap.
- `equal-spacing.ts`: smart distribution guides. When the moving rect sits between or beside siblings
  on a row/column, it snaps to the gap that repeats an existing gap and returns the spacing marks.
- `pixel-snap.ts`: with `pixelGrid`, round to whole units, as today (Figma's "Snap to pixel grid").
- The pointer's Ctrl/Cmd key **turns snapping off** for the gesture (Figma's behavior).

### Drawing the guides

- `render/layers/snap-layer.ts`: screen space, drawn above the overlay: lines in the accent snap color
  (`--canvas-snap` token, red-pink like Figma), small × marks at matched points, and distance labels
  (pooled text, like the link labels) for equal-spacing gaps.
- `ToolContext.snap(rect, options)` returns `{ rect, guides }` and `ctx.setSnapGuides(guides | null)`;
  cleared on pointer up and on cancel.

### Where it applies

- Select-tool move (on the moved selection's union box), `SelectionTransform` resize, `NodeDrawTool`
  (the drawn box and the first click), `LineTool`/`LineEndDrag` (line ends snap to points and edges),
  the pen tool's new points, the frame preset placement, and pastes are left as they are.
- **Alt hover measurement** (Figma's red distance lines): with a selection and Alt held, hovering
  another node shows the distances between them (or to the parent's edges), drawn by the same layer.
  Implemented in `SelectTool.onHover` via a `measure.ts` helper.

### Settings

- `SnapSettings` in `EngineState.snapping`, set with `engine.setSnapping(patch)`; the product's
  `defaultOptions` gives the initial values and `useSnapSettingsStore` (`shared/stores/`, persisted per
  product) remembers them.
- Design main menu → View: "Snap to objects", "Snap to pixel grid", "Snap to guides" (checkbox items;
  the `mainMenu` point needs a `checked(engine)` field). Board: "Snap to objects" in the zoom menu.

## Phase 2: Align, distribute and tidy up — done

As built: aligning doesn't run `onMoved` (nothing changes parent, like a nudge, as in Figma); tidy
up is Alt+Shift+T (Ctrl+Alt+T opens a terminal on many Linux desktops); the board gets the
context menu's Align submenu and the agent tools, not a panel; tidy up also has agent tools
(`tidy_up_nodes`, `tidy_up_shapes`); no "spacing" field.

- Move the math to the engine: `canvas/arrange/align.ts` (from `modules/core/ui/sections/align.ts`),
  plus `distribute.ts` (equal **spacing** horizontally/vertically, keeping the outermost two in place,
  ordered by position) and `tidy-up.ts` (Figma's Tidy up: snaps a rough grid of nodes into rows and
  columns with the median gap).
- Engine commands `alignLeft…alignBottom`, `distributeHorizontal`, `distributeVertical`, `tidyUp`, all
  moving with `withMembers` in one undo step and running `onMoved`. A single element aligns to its parent
  container (product hook `alignTarget?(el, elements)`; the Design returns the parent frame, the
  board the section it's in).
- Keys (Figma's): Alt+A/D/W/S (left/right/top/bottom), Alt+H/V (centers), Alt+Shift+H/V (distribute),
  Ctrl+Alt+T (tidy up).
- UI: the Position section gets a second row (distribute + tidy up buttons, a "spacing" field when the
  selection is distributed); the selection context menu gets an "Align" submenu; the board gets an
  align toolbar in its selection panel (`selectionPanels`).
- Agent tools: `align_nodes`/`distribute_nodes` (design) and `align_shapes`/`distribute_shapes` (board),
  taking ids and leaving the selection alone, like `reorder_shapes`.

## Phase 3: Rotation (Design) — done

As built: Figma's model, `rotation` round the layer's **top-left corner** (not its center, as first
planned below), counterclockwise. The engine turns any `rotatable` kind (`ElementKind.rotatable`,
`rotate`); kinds draw and hit-test unturned. Lines hold their angle in their ends; groups never
turn themselves. Flips mirror vectors and lines; other shapes land mirrored and turned the other
way (polygons and stars turn half round top to bottom); text and image fills aren't mirrored. A
turned frame inside another clipping frame clips by its own area only. Agents: `rotation` field,
`rotate_nodes`, `flip_nodes`. The Figma import keeps rotations; mirrored or skewed layers are
still straightened or vectorized.

### Data model

- `DesignNode.rotation` (degrees, clockwise, default 0, `fillDefaults`) around the box's **center**;
  `x, y, w, h` stay the unrotated box. Simple to patch and to read for agents and the panel.
- Engine support, generic and opt-in on `ElementKind`:
  - `rotationOf(el): number` (base returns 0).
  - `bounds(el)` stays the **axis-aligned** box (for hits, culling, marquee, exports and snapping);
    add `frameOf(el)` (`{ rect, rotation }`) that the overlay and gestures use.
  - `hitTest` in `DesignNodeKind` maps the point into the node's local frame first
    (`toLocal(p, frame)` in `geometry.ts`), so every kind keeps its unrotated hit test.
- Rendering: `ElementView` sets the container's `pivot`/`rotation` from `rotationOf` (drawers keep
  drawing unrotated). Clipping (`ElementClip`) gains an optional `rotation`, masked with a rotated
  rect.

### Interaction

- **Rotate zone**: just outside each corner handle (12 screen px) with a rotate cursor (custom SVG cursor);
  dragging rotates around the selection center, Shift snaps to 15°. Multiple nodes rotate together
  (their centers orbit the group center).
- **Rotated resize**: `resizeRect` runs in the node's local frame, then the fixed corner is pinned in world
  space (`resizeRotated` in `handles/`).
- Overlay draws the rotated outline and handles (`OverlayState.selectionFrames`).
- **Children**: rotating a frame or group rotates its descendants with it (positions orbit, their
  `rotation` adds), through `withMembers(…, "move")`. Group bounds (`resolveGroups`) use the
  children's rotated corners.
- Vector edit mode, the text editor (CSS `transform: rotate`) and the line ends map through the frame.
- Panel: an angle field in the Layout section, plus "Rotate 90° left/right" and "Flip horizontal/vertical"
  (Shift+H / Shift+V: flips vectors' networks, lines' points and image fills; symmetric shapes only
  mirror their rotation).
- Agents: `rotation` in `create_nodes`/`update_nodes` (patchable field, checked number).
- Figma import: `fig-matrix.ts` reads rotation from the transform matrix instead of flattening.

## Phase 4: Rulers and ruler guides (Design) — done

As built: with a selection in a frame (or a selected top-level frame), the rulers count from its
corner and number only its span, like Figma; the selection's extent is marked with its two
values, hiding numbers under them; the Position section's X/Y count from the layer's frame too
(agents keep world coordinates). Guides are the page's (across the whole page) or a frame's: one
dragged out of the rulers while they measure a frame belongs to it (its value from the frame's
corner, shown only inside it, moving with it, dropped with it; dragged past its edges it becomes
a page guide; a turned frame's guides turn with it and are dragged along its axes, but aren't
snapped to; the rulers measure the page while the frame is turned, but a guide dragged out of
them into it still becomes its guide, along its axis closest to the ruler's). Guides go through a product hook, `guides` (`CanvasGuides`; the design keeps them
on each page's record), so the engine stays product-agnostic. The guide toggle is Shift+;,
"Remove all guides" has no key; the snap toggle lives in the zoom menu, the main menu has Rulers,
Ruler guides and Remove all guides as checkbox items. Guides snap to elements and to other guides
while dragged (Ctrl turns it off). Agents: `list_guides`, `add_guides` (`frame` optional),
`remove_guides`. Figma pages' guides are kept on import. Not done: copying a frame doesn't copy
its guides, locking guides, rulers on the board.

- `CanvasViewOptions.rulers` (Design on); rulers are DOM (`canvas-ui/components/rulers/`): a top and a
  left strip 20 px wide drawn on a `<canvas>`, ticks and numbers chosen by zoom (1/2/5 × 10ⁿ steps),
  following `engine.onViewChange`. The selection's range is highlighted on both, and the origin is the
  page's (0, 0), or the selected top frame's corner like Figma.
- Toggle: Shift+R (`toggleRulers` host command, main menu → View).
- **Ruler guides**: dragging out of a ruler adds a guide; guides are stored on the page record
  (`PageElement.guides: { axis, value }[]`, so they're per page and saved with the file, undoable). A
  guide layer draws them (screen-space lines, the pink snap color); dragging one moves it, dragging it
  back onto the ruler deletes it; the position shows while dragging. They are snap targets (`SnapSettings.guides`).
- "Show/hide guides" and "Remove all guides" in the View menu.

## Phase 5: Other recommended precision features

Ordered by value for the effort:

1. **Zoom to selection** (Shift+2) and **zoom to previous/next frame** (N / Shift+N), engine commands.
2. **Copy/paste properties** (Ctrl+Alt+C / Ctrl+Alt+V: fills, strokes, opacity, radius, text style).
3. **Select matching layers** (same type and fills) and **select inverse**, in the context menu.
4. **Pixel preview** at high zoom: the pixel grid already exists; add "Snap to pixel grid" rounding to
   rotation-free nodes only.
5. **Layout grids on frames** (columns/rows/grid, drawn over the frame, snap targets): after rotation,
   because grids and snapping share the target code.
6. **Keyboard resize**: Ctrl+Arrow grows/shrinks the selection by 1 (Shift = 10), like Figma.

## Implementation order and size

| Phase                               | Size   | Depends on            |
| ----------------------------------- | ------ | --------------------- |
| 0 Nudge, multi-resize, size badge   | S–M    | —                     |
| 1 Snapping + smart guides + measure | L      | 0                     |
| 2 Align / distribute / tidy up      | M      | 0                     |
| 3 Rotation                          | XL     | 0, 1 (snap uses AABB) |
| 4 Rulers + guides                   | M      | 1                     |
| 5 Extras                            | S each | —                     |

Each phase ships on its own: a commit per phase, CLAUDE.md updated in the same commit (engine
sections + Design section), plus `docs/plugins.md` when a new hook or point is exposed to plugins.

## Reuse

- `canvas/geometry.ts` (`unionRects`, `rectFromPoints`, `roundRect`, `rectCenter`).
- `canvas/handles/resize-handles.ts` (`resizeRect`, `RESIZE_HANDLES`) for multi and rotated resize.
- `ctx.withMembers`, `ctx.moved` / `onMoved` (drops into frames after drags and aligns; nudges keep the parent).
- `ctx.setGuide` / `GuideLayer` pattern and the link layer's pooled labels for distance text.
- `modules/core/ui/sections/align.ts` (moved, not rewritten), `useMoveNodes`.
- `canvas/agent/` (`asUndoStep`, `requireNodes`) for the new agent tools.
- The `mainMenu`, `contextMenu` and `propertySections` points for all UI entry points.

## Verification

- After each step: `pnpm lint`, `pnpm typecheck`, `pnpm format:check` (the project's only automated
  checks).
- When the app is running, the MCP tools check behavior without clicking: `create_nodes` a few
  rectangles, then `align_nodes`/`distribute_nodes`, `update_nodes { rotation }` and `view_design` to look
  at the result; `get_nodes` to confirm the numbers (e.g. equal gaps after distribute).
- Manual checks in the app (by the user): drag near another node shows the pink guides and snaps,
  Ctrl disables it; resize a multi-selection; nudge with arrows and Ctrl+Z undoes a burst in one step;
  rotate with Shift snapping to 15° and resize a rotated node from a corner; drag a guide out of the
  ruler, snap to it, save, reopen and find it on the same page.
- Optional (recommended): add Vitest for `canvas/snapping/` and `canvas/arrange/`, which are pure
  functions and easy to test.
