# Prototype mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Prototype mode in Design: link layers to screens, group screens into flows per device, and play them in a phone, tablet, app window or browser.

**Architecture:** One new feature module, `src/products/design/modules/prototype/`. Interactions are an optional node field and flows are records (a non-canvas element kind, like brochures), both in the Yjs doc behind one service, `DESIGN_PROTOTYPE`. The mode is one `defineDesignMode` (`prototype.mode.ts`) with its tools, toolbar, Flows tab, sidebar and overlays (arrows, drag line, player). The Design mode's Prototype tab is removed.

**Tech Stack:** TypeScript (strict, `noUncheckedIndexedAccess`), React 19, Zustand (UI state only), Pixi canvas engine (`@canvas`), Web Animations API, Tailwind v4 semantic tokens, i18n en+es.

**Spec:** [docs/superpowers/specs/2026-11-05-prototype-mode-design.md](../specs/2026-11-05-prototype-mode-design.md). Mockup: [docs/prototype/prototype-mode.html](../../prototype/prototype-mode.html) (the look and the copy; open it next to each UI task).

## Status (2026-11-08, after Phase 2)

- **Where:** local branch `prototype-mode` in the sibling worktree
  `/home/mcris112/Storage/Projects/CloudyStudio/cloudy-canvas-prototype` (the user asked for a local
  branch; another session uses master's folder). Run subagent-driven; implementer models per task
  tag, task reviews Sonnet, small re-reviews Haiku (or checked directly), final review Opus. No
  co-author lines. Never pushed.
- **Ledger:** `.superpowers/sdd/2026-11-05-prototype-mode/progress.md` in that worktree
  (git-ignored): every task's commits, rulings and deferred minors.
- **Phase 1 (Tasks 1–4): done** (`fbccb553..c72f29e6`), merged with master in `e7eaeef9`
  (changelog conflicts resolved keeping every entry; master's new selection colors section lost
  its `tab` field), and master fast-forwarded to it on 2026-11-08. The user won't release until
  this plan and the projects plan are both done, so a half-built mode on master is fine.
- **Phase 2 (Tasks 5–7): done** (`04de2a55..d834f700`) on the branch, not merged to master yet:
  the interaction editor, the screen, flow and empty panels, and connect by dragging.
  - Task 7 ruling: V and L are bound in the mode's own `keybindings` layer, not as tool `keys`
    (tool keys go into the product-wide keymap, where L would take over the Line tool in Design).
  - `editInteraction` moved to `model/` so engine-side tools can use it.
- **Next:** Phase 3, starting at Task 8. Stop after each phase for the user's go-ahead.
- **Carry into later tasks:**
  - `readInteraction` rejects an interaction without a non-empty `id`. Task 10's
    `set_interactions` (which takes entries without ids) must give each one `createId()` before
    validating.
  - Task 9: the flow flag's title uses `canvas.flagTitle` ("Select {name}") until the player
    exists; switch it to the play wording and make the click play. The flow panel's Play button
    is disabled until then too.
  - A press on a screen's empty area selects the screen in this mode (spec, "The mode"; decided
    with the user).
- **Known gap, outside this plan:** deleting a design page through `DESIGN_PAGES.remove` (Pages
  panel, `delete_page`) never runs `onRemove`, so that page's flows and links into its screens
  stay (brochures have the same gap). It belongs in the core pages module.
- **Deferred minors for the final review:** listed in the ledger (`minor (deferred)` lines).

## Global Constraints

- Follow every rule in `CLAUDE.md`; read `docs/modules.md` and the READMEs of the folders you touch (and parents up to `src/`) before changing code, and update them in the same task.
- The module is `tier: "feature"`, `requires: ["core", "pages", "frame"]`, written only against the public API (`scripts/check-public-api.mjs`); it imports other modules only through `index.ts` / `ui/index.ts`.
- No test framework exists. Each task's verification is exactly: `pnpm lint && pnpm typecheck && pnpm format:check` (all pass). Never run `tauri dev`, cargo, builds or a browser.
- Types in sibling `.types.ts` files; one component/helper per file, ~200 lines max; module files under 120 lines.
- Every edit goes through `CanvasDocument`; a user action calls `doc.checkpoint()` first; never mutate an element read from the document. MCP writes go in one `asUndoStep` after validating everything.
- All user-facing text through `prototype.i18n.ts` (`locales/en.json` + `es.json`, keys grouped by area); generic words via `tCommon`. Copy as in the mockup.
- Shortcuts only in keybindings/tool `keys`; UI reads labels with `engine.keymap.label(command)`.
- UI: semantic tokens only, radii ≤ 8px (4px controls, 6px cards), kit pieces (`SelectField`, `SwitchField`, `SegmentedControl`, `NumberInput`, `Field`, `ToolButton`, `ModeToolbar`, …); no raw `<button>`/`<input>` without the `bespoke:` comment. The device bodies in the player are pictures of devices and may use literal colors and rounder corners, with a comment saying so.
- Report failures with `notifyError(title, error)` or `toast(…)`.
- Work on `master`; commit only this task's paths (others edit `data` and `catalog` in the same tree); commit messages `feat(prototype): …` with **no co-author or Claude attribution line**.
- Subagent models (user rule): each task names its tier. Reviews use Sonnet, tiny re-reviews Haiku, the final whole-plan review Opus.
- Stop after each phase and wait for the user's go-ahead.

## Review Focus

1. **Deleting a screen others link to, then undo:** the links into it and the flows starting at it disappear in the same undo step, and undo brings all of them back. Pinned in Task 1 (`prunePrototype` runs in `onRemove`).
2. **Copying screens:** duplicating a screen and the one it links to keeps the copies linked to each other. Copying one alone keeps its links to the originals, and flows are never copied. Pinned in Task 1 (no `prepareCopies` hook; README states the `remapIds` behavior).
3. **Bad or old data in a file:** a missing or malformed `interactions` field, unknown values, a `to` naming a gone screen or one on another page, a `javascript:` URL. The reader drops the bad entries, the player skips missing destinations, and links open only `http(s)`. Pinned in Task 1 (`readInteraction`) and Task 9 (the player checks `to` before every step).
4. **The design changes while playing** (your edit or a collaborator's): the next screen shown is drawn from the current document, never a stale picture. Pinned in Task 9 (pictures keyed by the element object, like the Catalog's `PreviewImages`).
5. **Clicking fast during a transition, delays after leaving a screen, key clashes:** clicks during a transition are ignored, delay timers are cleared on every step and on close, and a screen's key interaction wins over the player's own R/H/Esc. Pinned in Task 9.

---

## Phase 1: Data, the mode and the arrows

### Task 1: The prototype model and the module skeleton · model: Opus

**Files:**

- Create: `src/products/design/modules/prototype/prototype.module.ts`, `index.ts`, `README.md`, `prototype.i18n.ts`, `locales/en.json`, `locales/es.json`, `prototype.constants.ts`, `prototype.canvas.ts`
- Create: `src/products/design/modules/prototype/model/` with `index.ts`, `interaction.types.ts`, `interaction-defaults.ts`, `read-interaction.ts`, `node-interactions.ts`, `write-interactions.ts`, `flow.types.ts`, `flow.kind.ts`, `flow.defaults.ts`, `is-flow.ts`, `devices.ts`, `screens.ts`, `design-prototype.ts`, `prune-prototype.ts`
- Modify: `src/products/design/ui/modules/design-modules.ts` (add `prototypeModule` after `catalogModule`)
- Modify: `docs/modules.md` (Design tier table: add `prototype (a mode)` to the feature row)

**Interfaces:**

- Produces (from `modules/prototype/index.ts`):
  - All spec types (`PrototypeTrigger`, `PrototypeAction`, `PrototypeAnimation`, `PrototypeDirection`, `PrototypeEasing`, `OverlayPosition`, `PrototypePlatform`, `PrototypeTransition`, `PrototypeInteraction`, `PrototypeOverlay` = the `overlay` object, `PrototypeFlowElement`) exactly as in the spec.
  - `PROTOTYPE_FLOW_TYPE = "prototype-flow"`; `DEFAULT_TRANSITION: PrototypeTransition` (`dissolve`, `left`, `300`, `ease-out`); `DEFAULT_OVERLAY: PrototypeOverlay` (`center`, `true`, `true`); `newInteraction(to?: string): PrototypeInteraction` (`click → navigate`, `id: createId()`).
  - `readInteraction(value: unknown): PrototypeInteraction | null`: null for an unknown trigger, action or animation; for `navigate`/`overlay`/`swap` without a string `to`; for `link` unless `new URL(url).protocol` is `http:` or `https:`. Clamps `duration` to 0–5000 and `delay` to 0–60000, fills a missing `transition` with `DEFAULT_TRANSITION` and a missing `overlay` on overlay/swap with `DEFAULT_OVERLAY`, and keeps `key` only on `key` triggers.
  - `nodeInteractions(el: CanvasElement | undefined): PrototypeInteraction[]`: the node's valid interactions, `[]` when there are none.
  - `writeInteractions(doc: CanvasDocument, nodeId: string, list: readonly PrototypeInteraction[]): void`: one `doc.update`, no checkpoint. An empty list writes `interactions: null`.
  - `PROTOTYPE_DEVICES: Record<PrototypePlatform, readonly string[]>` (ids from the spec's table, first = default) and `defaultFlowDevice(screen: { w: number }): { platform: PrototypePlatform; device: string }` (`w > 600` → web/`browser-1280`, else mobile/`iphone-16`).
  - `isScreen(el: CanvasElement | undefined): el is FrameElement` (`isFrame` from `../frame` and `parentId === null`); `screensOf(doc: CanvasDocument, page: string): FrameElement[]` (by `index`); `screenOf(doc: CanvasDocument, id: string): FrameElement | null` (walks `parentId` up to a screen).
  - `isFlow(el): el is PrototypeFlowElement`; `PrototypeFlowKind` (like `BrochureKind`: `creatable = false`, `boxed = false`, draws and hits nothing, `fillDefaults` fills `orientation: "portrait"`, `hints: true`).
  - `class DesignPrototype` and `DESIGN_PROTOTYPE = defineService("design.prototype", (doc) => new DesignPrototype(doc))`. Methods: `flows(page: string): PrototypeFlowElement[]` (by `index`); `flow(id: string): PrototypeFlowElement | null`; `addFlow(page: string, start: string, name?: string): PrototypeFlowElement` (device from `defaultFlowDevice`, name `t("flow.defaultName", { screen })`); `updateFlow(id: string, patch: Partial<Omit<PrototypeFlowElement, "id" | "type">>): void` (a `platform` change without a `device` resets it to that platform's first device); `removeFlow(id: string): void`; `interactions(nodeId: string): PrototypeInteraction[]`; `setInteractions(nodeId: string, list: readonly PrototypeInteraction[]): void`; `addInteraction(nodeId: string, ix: PrototypeInteraction): void`; `removeInteractions(nodeIds: Iterable<string>): void` (one step for all); `linksTo(screenId: string): string[]` (ids of nodes with an interaction whose `to` is it). Every write calls `doc.checkpoint()` first, as `DesignBrochures` does.
  - `prunePrototype(doc: CanvasDocument, removed: ReadonlySet<string>): void`.
- Consumes: `isFrame`, `FrameElement` (`../frame`); `defineService`, `ElementKind`, `CanvasDocument` (`@canvas`); `createId`, `defineModule` (`@shared/core`).

- [ ] **Step 1: Write the types, defaults, reader and `devices.ts`/`screens.ts`** with the signatures above, mirroring `catalog/model/repeats/repeat-copy-tag.ts` for defensive reading.
- [ ] **Step 2: Write the flow kind and `DesignPrototype`**, mirroring `catalog/brochure/brochure.kind.ts` and `catalog/model/design-brochures.ts` (records created with the kind's defaults, `index` from `keyBetween` after the last flow).
- [ ] **Step 3: Write `prunePrototype`**, mirroring `catalog/model/prune-brochure.ts`. In one pass over `doc.ids()`: a flow whose `page` or `start` was removed is removed. A node not removed whose interactions name a removed `to` gets the rest written back with `writeInteractions`.
- [ ] **Step 4: Wire the module.** `prototype.canvas.ts` → `registerPrototypeCanvas(host)` contributes `designCanvas.kinds` (`new PrototypeFlowKind()`) and `designCanvas.onRemove` (`prunePrototype`). Contribute no `prepareCopies`: `remapIds` already gives copies the right `to` (say so in the README). `prototype.module.ts` has `id: "prototype"`, `tier: "feature"`, `requires: ["core", "pages", "frame"]`, `exports: { ...prototypeApi, ...prototypeUi }` (create an empty `ui/index.ts` now). The README follows the template in `docs/modules.md`, with **Not yet** copied from the spec.
- [ ] **Step 5: Verify:** `pnpm lint && pnpm typecheck && pnpm format:check`. Expected: all pass, with `check-modules` reporting nothing for `prototype`.
- [ ] **Step 6: Commit** the module folder, `design-modules.ts` and `docs/modules.md`: `feat(prototype): interactions and flows in the document`.

### Task 2: Remove the Design mode's Prototype tab · model: Sonnet

**Files:**

- Modify: `src/products/design/ui/modules/design-editor-points.types.ts:39` (drop `tab` from the property section entry), `src/products/design/ui/components/properties-panel/properties-panel.tsx`, `property-sections.tsx`, `property-sections.types.ts`, `src/products/design/ui/stores/design-panel-store.ts` + `.types.ts` (drop `propertiesTab`/`setPropertiesTab`), `src/products/design/ui/locales/en.json` + `es.json` (drop `properties.tabs.prototype`; drop `properties.tabs.design` too if nothing else reads it)
- Modify: every `propertySections` contribution with `tab: "design"` (find them with `grep -rln 'tab: "design"' src examples`, 20 files): delete the `tab` line
- Delete: `src/products/design/modules/core/ui/sections/prototype-section.tsx`, its export in `core/ui/sections/index.ts` and its entry in `core/core.sections.ts`
- Modify: `src/products/design/README.md` and `docs/plugins.md` wherever they mention the Design/Prototype tabs

**Interfaces:**

- Produces: `PropertySectionEntry` without `tab`. The properties panel shows its header row (undo, redo, Share, hide), then a row with only the zoom menu on the right, then the sections.

- [ ] **Step 1: Make the edits above.** The panel keeps the zoom control where the tabs were.
- [ ] **Step 2: Verify:** `pnpm lint && pnpm typecheck && pnpm format:check` pass, and `grep -rn '"prototype"' src | grep -v Object.prototype` finds nothing outside `modules/prototype/`.
- [ ] **Step 3: Commit:** `refactor(design): properties panel without the Prototype tab`.

### Task 3: The mode shell: tools, toolbar, switch, Flows tab, badge · model: Sonnet

**Files:**

- Create in `modules/prototype/`: `prototype.mode.ts`; `mode/index.ts`, `mode/prototype-select.tool.ts`, `mode/prototype-allowed-commands.ts`; `ui/stores/prototype-view-store.ts` + `.types.ts`; `ui/hooks/use-prototype-selection.ts` + `.types.ts`; `ui/toolbar/use-prototype-toolbar-items.ts`; `ui/flows-tab/flows-tab.tsx`, `ui/flows-tab/flow-row.tsx` (+ types); `ui/interaction-badge.tsx`; `ui/sidebar/prototype-sidebar.tsx` (the empty-state panel only, for now)
- Modify: `prototype.constants.ts`, `prototype.module.ts`, `ui/index.ts`, `README.md`, locales

**Interfaces:**

- Produces:
  - `PROTOTYPE_MODE_ID = "prototype"`, `PROTOTYPE_TOOLS = { select: "prototype.select", connect: "prototype.connect" } as const`, `PROTOTYPE_COMMANDS = { toggle: "prototype.toggle", addFlow: "prototype.addFlow", play: "prototype.play" } as const`.
  - `PrototypeSelectTool extends SelectTool` (`id = PROTOTYPE_TOOLS.select`, `movesSelection = false`, `resizeMode = "none"`, deep picks via `ctx.targetAt(world, true)`). On `deleteSelection` it calls `DESIGN_PROTOTYPE.removeInteractions(selection)` and returns `true`, so layers are never deleted here. The mode's `commandLabels` names it `t("mode.removeInteractions")`.
  - `prototypeMode = defineDesignMode({ id: PROTOTYPE_MODE_ID, order: 5, icon: Workflow, tool: PROTOTYPE_TOOLS.select, tools: [select], allowTools: ["hand"], commands: PROTOTYPE_ALLOWED_COMMANDS, toolbar: { useItems: usePrototypeToolbarItems }, rail: { tabs: [{ id: "flows", icon: Workflow, component: FlowsTab, … }], keep: ["layers"] }, sidebar: PrototypeSidebar, overlays: [], hostCommands: [addFlow] })`. Later tasks add to `tools`, `overlays` and `hostCommands`.
  - `usePrototypeViewStore`: `{ selectedFlow: string | null; showLinks: "all" | "selection"; selectFlow(id: string | null): void; setShowLinks(v): void }`.
  - `usePrototypeSelection(): PrototypeSelection`, where `PrototypeSelection = { kind: "none" } | { kind: "flow"; id: string } | { kind: "screen"; id: string } | { kind: "layer"; id: string; screen: string }`. A selected flow wins when the engine selection is empty. One selected element is a screen or a layer; several count as none. Selecting on the canvas clears `selectedFlow`, and picking a flow clears the engine selection.
- Consumes: Task 1's service, `screensOf`, `nodeInteractions`; `defineDesignMode`, `registerDesignMode`, `designEditor` (`@design/ui/modules`); `useEditorMode` (`@canvas-ui`).

- [ ] **Step 1: Tools and allowed commands.** `PROTOTYPE_ALLOWED_COMMANDS` copies the view, history and selection commands from `catalog/mode/catalog-allowed-commands.ts`, plus `deleteSelection` and `cancel`.
- [ ] **Step 2: Toolbar items** (`{ useItems }`, as `use-catalog-toolbar-items.ts`): Select (V), Hand (H) | Add flow start. Add flow start is the mode's host command `PROTOTYPE_COMMANDS.addFlow` with `keybindings: { [PROTOTYPE_COMMANDS.addFlow]: [{ key: "f", shift: true }] }`, enabled when the selection is in a screen that starts no flow. It calls `addFlow(page, screen.id)`, then selects the new flow.
- [ ] **Step 3: Toggle command.** Contribute `designCanvas.hostCommands` `{ id: PROTOTYPE_COMMANDS.toggle, label, keys: [{ key: "e", shift: true }] }` from the module, not the mode, so it works in every mode. A session hook (`designEditor.sessionHooks`) runs it with `useEditorMode().setMode(...)`: Prototype ↔ the default mode.
- [ ] **Step 4: Flows tab.** A `Flows` section with + (adds a flow at the selected screen, else at the page's first screen; disabled with no screens), one `ListRow` per flow of the page on screen (platform icon, name, "Mobile · starts at Welcome", a ▶ `IconButton`, disabled until Task 9) and the hint text under it. A row click calls `selectFlow(id)`.
- [ ] **Step 5: Badge and empty sidebar.** `InteractionBadge` (`designEditor.layerBadges`) shows a `Zap` only while the mode is Prototype and `nodeInteractions(node).length > 0`. `PrototypeSidebar` shows the header ("Prototype" + zoom, as the mockup) and the `EmptyState` text for every selection kind, until Tasks 5 and 6.
- [ ] **Step 6: Register** with `registerDesignMode(host, prototypeMode)`, then the badge and the toggle in `prototype.module.ts`; update the README's **Contributes**.
- [ ] **Step 7: Verify:** `pnpm lint && pnpm typecheck && pnpm format:check` pass.
- [ ] **Step 8: Commit:** `feat(prototype): the Prototype mode, its tools and Flows tab`.

### Task 4: Link arrows and flow flags · model: Sonnet

**Files:**

- Create in `modules/prototype/ui/canvas/`: `link-path.ts` + `.types.ts`, `links-layer.tsx`, `link-arrow.tsx`, `link-stub.tsx`, `flow-flag.tsx` (+ types)
- Modify: `prototype.mode.ts` (`overlays: [LinksLayer]`), `README.md`, locales, `CHANGELOG.md`, `CHANGELOG.es.md`

**Interfaces:**

- Produces: `linkPath(from: Rect, fromScreen: Rect, to: Rect): LinkPath`, where `LinkPath = { d: string; origin: Point; end: Point; angle: number }`. All rects are screen px (`engine.worldRectToScreen`), and the routing is the spec's "Arrows" section with 24/36 as screen px. Forward: `d` = `M sx sy C sx+k sy, ex-k ey, ex-6 ey` with `k = max(40, (ex-sx)/2)`, `angle 0`. Under: `angle -90`. Over: `angle 90`.
- Consumes: `usePrototypeSelection`, `usePrototypeViewStore`, `DESIGN_PROTOTYPE`, `screensOf`, `isScreen`; `useDesignEngine`, `useDesignState` (`@design/ui/design-engine-context`), `engine.onViewChange`.

- [ ] **Step 1: `linkPath`** as above (pure).
- [ ] **Step 2: `LinksLayer`**, a pointer-events-none SVG over the canvas that redraws on view change and document version (as `brochure-canvas-layer.tsx`). For each node on the page with interactions:
  - `navigate`/`overlay`/`swap` to a screen get a `LinkArrow`: solid, or dashed for overlays, with a square origin and a filled head in `--primary`.
  - `back`/`close`/`link` get a `LinkStub`: 18 px and a chip saying "Back", "Close" or "Open link".
  - The selection's arrows (the layer's, or every layer's on a selected screen) are thicker. With `showLinks === "selection"` only those show.
- [ ] **Step 3: `FlowFlag`**, a chip above each flow's start screen ("▶ Order coffee"), in DOM over the canvas. A click selects the flow until Task 9 makes it play.
- [ ] **Step 4: Changelog.** Under the unreleased section, `New`/`Novedades`: one or two sentences on the Prototype mode (link layers to screens, flows per device, arrows on the canvas). Later phases extend this same entry while it's unreleased.
- [ ] **Step 5: Verify:** `pnpm lint && pnpm typecheck && pnpm format:check` pass.
- [ ] **Step 6: Commit:** `feat(prototype): link arrows and flow flags on the canvas`.

**End of Phase 1:** stop, report, wait for the user.

## Phase 2: Editing

### Task 5: The interaction editor · model: Sonnet

**Files:**

- Create in `modules/prototype/ui/sidebar/`: `layer-panel.tsx`, `interactions-section.tsx`, `interaction-card.tsx`, `trigger-fields.tsx`, `action-fields.tsx`, `transition-fields.tsx`, `overlay-fields.tsx`, `interaction-summary.ts` (+ types), `edit-interaction.ts`
- Modify: `prototype-sidebar.tsx`, locales, `README.md`

**Interfaces:**

- Produces:
  - `editInteraction(ix: PrototypeInteraction, patch: Partial<PrototypeInteraction>): PrototypeInteraction`, pure. Changing the action drops `to` and `url` and `overlay` when the new action doesn't take them, gives `overlay`/`swap` `DEFAULT_OVERLAY` when it's missing, and keeps `to` between navigate/overlay/swap.
  - `interactionSummary(ix, screenName: (id: string) => string): string` ("On click → Navigate to Menu").
  - `InteractionsSection({ owner: string })`, reused by Task 6 for screens.
- Consumes: `DESIGN_PROTOTYPE.setInteractions/addInteraction`, `newInteraction`, `screensOf`, `screenOf`.

- [ ] **Step 1: Pure helpers** (`editInteraction`, `interactionSummary`).
- [ ] **Step 2: The card**, as in the mockup:
  - The summary with the trigger icon and a remove button.
  - Trigger (`SelectField`), plus Key (a text field) for `key` and After (`NumberInput`, ms) for `delay`.
  - Action (`SelectField`), plus To (`SelectField` of the page's screens except the owner's own) for navigate/overlay/swap, or URL (a `useCommitField` text field) for link.
  - Overlay fields: Position (`SegmentedControl` top/center/bottom), and "Close on a click outside" and "Dim what's behind" (`SwitchField`).
  - Transition, hidden for `link`: Animation (`SelectField`), From (`SegmentedControl` of 4 arrows) for the directional animations, ms (`NumberInput`) and easing (`SelectField`) unless `instant`.
  - Every change is one `setInteractions` call. A `NumberInput` drag is one undo step (kit behavior).
- [ ] **Step 3: `LayerPanel`**: the layer's name and "In <screen>", then `InteractionsSection`. The + button adds `newInteraction(firstOtherScreen)`, and with no other screen it adds `back`. The empty state says "No interactions. Press + or drag from the square on the right of the layer onto a screen."
- [ ] **Step 4: Verify:** `pnpm lint && pnpm typecheck && pnpm format:check` pass.
- [ ] **Step 5: Commit:** `feat(prototype): edit a layer's interactions`.

### Task 6: Screen, flow and empty panels · model: Sonnet

**Files:**

- Create in `modules/prototype/ui/sidebar/`: `screen-panel.tsx`, `flow-panel.tsx`, `empty-panel.tsx`, `device-fields.tsx` (+ types)
- Modify: `prototype-sidebar.tsx`, locales, `README.md`

**Interfaces:**

- Consumes: Task 5's `InteractionsSection`; `DESIGN_PROTOTYPE` flow methods and `linksTo`; `PROTOTYPE_DEVICES`.

- [ ] **Step 1: Screen panel.** "Flow start": a `SwitchField`. On, it calls `addFlow`, with the label "Starts “<flow>”". Off, it removes the flows starting there, in one step. Then `InteractionsSection({ owner: screenId })`. Then "Links to this screen": rows from `linksTo`, each with the layer's name and its screen; a click selects that layer.
- [ ] **Step 2: Flow panel.** Name (a `useCommitField` field), Starts at (`SelectField` of the page's screens), Platform (`SegmentedControl` with icons), Device (`SelectField` of that platform's devices, i18n labels with sizes as in the mockup), Orientation (mobile and tablet only), "Show hotspots on a missed click" (`SwitchField`), Play (disabled until Task 9) and Delete flow (destructive ghost).
- [ ] **Step 3: Empty panel.** The `EmptyState` text, then "Show links: All / Selection" (`SegmentedControl` → `setShowLinks`).
- [ ] **Step 4: Verify:** `pnpm lint && pnpm typecheck && pnpm format:check` pass.
- [ ] **Step 5: Commit:** `feat(prototype): screen and flow settings`.

### Task 7: Connect by dragging · model: Opus

**Files:**

- Create in `modules/prototype/mode/`: `connect-drag.ts` + `.types.ts` (service), `connect-gesture.ts`, `connect.tool.ts`
- Create: `modules/prototype/ui/canvas/connect-handle.tsx`, `drag-line.tsx`
- Modify: `mode/prototype-select.tool.ts`, `prototype.mode.ts` (Connect tool with `keys: [{ key: "l" }]`, overlays), `ui/toolbar/use-prototype-toolbar-items.ts` (Connect after Hand), `README.md`, locales, both changelogs (extend the entry)

**Interfaces:**

- Produces:
  - `CONNECT_DRAG = defineService("prototype.connectDrag", () => new ConnectDrag())`. `ConnectDrag` has `state(): ConnectDragState | null`, `start(from: string, at: Point): void`, `move(at: Point, target: string | null): void`, `end(): void`, `onChange(listener: () => void): () => void` (an `Emitter`). `ConnectDragState = { from: string; start: Point; at: Point; target: string | null }`, in world units.
  - `class ConnectGesture`, constructed with `(ctx: ToolContext<DesignToolOptions>)`, with `begin(from: string, p: CanvasPointer): void`, `move(p: CanvasPointer): void`, `finish(p: CanvasPointer): void` and `cancel(): void`. The target is `screenOf(ctx.doc, ctx.elementAt(p.world)?.id)` when it's not the source's own screen. On finish:
    - a target adds `newInteraction(target.id)`;
    - no element under the pointer, with the distance from start above 24 screen px (`pastThreshold`-style check with that value), adds `{ ...newInteraction(), action: "back", to: undefined }`;
    - otherwise nothing is added.
    - Then the source is selected.
  - `ConnectTool` (`id = PROTOTYPE_TOOLS.connect`, cursor `crosshair`): a pointer-down on any element begins the gesture from `ctx.targetAt(world, true)` (or its screen).
  - `PrototypeSelectTool`: a pointer-down within 8 screen px of the single selection's right-middle point begins the same gesture instead of selecting.
- Consumes: `DESIGN_PROTOTYPE.addInteraction`, `screenOf`, `newInteraction`; `pastThreshold` (`canvas/tools/drag-threshold.ts`).

- [ ] **Step 1: `ConnectDrag` and `ConnectGesture`** as above. Esc (`onCancel`) clears the drag without writing.
- [ ] **Step 2: The tools.** Add `ConnectTool`, and the handle hit test in `PrototypeSelectTool`.
- [ ] **Step 3: Overlays.** `ConnectHandle` draws a 14 px square with a 2 px `--primary` border at the single selection's right-middle (screen px), in the mode only. `DragLine` draws the drag's curve while `CONNECT_DRAG.state()` is set, plus a dashed `--primary` outline on the target screen.
- [ ] **Step 4: Toast** on drop, from the overlay listening to `CONNECT_DRAG` end: "Linked “Start order” to Menu" or "“Start order” now goes Back".
- [ ] **Step 5: Verify:** `pnpm lint && pnpm typecheck && pnpm format:check` pass.
- [ ] **Step 6: Commit:** `feat(prototype): connect layers to screens by dragging`.

**End of Phase 2:** stop, report, wait for the user.

## Phase 3: The player

### Task 8: The player session (plain TS) · model: Sonnet

**Files:**

- Create: `modules/prototype/model/player-session.ts` + `.types.ts`, `mirror-transition.ts`, `play-target.ts` + `.types.ts`; export them from `model/index.ts`

**Interfaces:**

- Produces:
  - `PlayerState = { flow: string; stack: PlayerEntry[]; overlays: OverlayEntry[] }`, with `PlayerEntry = { screen: string; via: PrototypeTransition | null }` and `OverlayEntry = { screen: string; interaction: PrototypeInteraction }`.
  - `PlayerStep`, one of:
    - `{ kind: "none" }`
    - `{ kind: "screen"; from: string; to: string; transition: PrototypeTransition }`
    - `{ kind: "openOverlay"; entry: OverlayEntry }`
    - `{ kind: "closeOverlay"; entry: OverlayEntry }`
    - `{ kind: "swapOverlay"; from: OverlayEntry; to: OverlayEntry }`
    - `{ kind: "link"; url: string }`
  - `startSession(flow: PrototypeFlowElement, at?: string): PlayerState` (stack `[{ screen: at ?? flow.start, via: null }]`).
  - `applyInteraction(state: PlayerState, ix: PrototypeInteraction, exists: (screen: string) => boolean): { state: PlayerState; step: PlayerStep }`. It never mutates its input.
    - `navigate`: clears the overlays and pushes `{ screen: to, via: ix.transition }`.
    - `back`: with overlays open, it closes the top one; else it pops. The step's transition is `mirrorTransition(popped.via)`, or `instant` when `via` is null. On the first screen, `none`.
    - `overlay`: pushes an overlay.
    - `swap`: replaces the top overlay, or opens one when there's none.
    - `close`: pops the top overlay, or `none`.
    - `link`: state unchanged.
    - A `to` for which `exists` is false gives `none`.
  - `mirrorTransition(t: PrototypeTransition): PrototypeTransition`: the opposite direction; `move-in` ↔ `move-out`, `slide-in` ↔ `slide-out`; `push`, `dissolve` and `instant` stay.
  - `playTarget(doc: CanvasDocument, page: string, selection: PrototypeSelection): PlayTarget | null`, where `PlayTarget = { flow: string; at?: string }`:
    - a selected flow plays that flow;
    - a selection in a screen that starts a flow plays that flow;
    - a selection in another screen plays the page's first flow of the same device kind (web/desktop vs mobile/tablet, from `defaultFlowDevice`) with `at` = that screen;
    - anything else plays the first flow;
    - with no flows, `null`.

- [ ] **Step 1: Write the three files** with the rules above (pure, no engine, no React).
- [ ] **Step 2: Verify:** `pnpm lint && pnpm typecheck && pnpm format:check` pass.
- [ ] **Step 3: Commit:** `feat(prototype): the player's session model`.

### Task 9: The player · model: Opus

**Files:**

- Create in `modules/prototype/ui/player/`:
  - `player-store.ts` + `.types.ts`, `player.tsx`, `player-bar.tsx`, `device-frame.tsx`, `device-chrome.tsx`, `player-stage.tsx`
  - `screen-pictures.ts` + `.types.ts`, `hotspots.tsx`, `hotspot-rects.ts`, `run-transition.ts`, `use-triggers.ts`, `use-player-keys.ts`
  - types for each of the above
- Modify: `prototype.mode.ts` (overlay `Player`; host command `PROTOTYPE_COMMANDS.play` with `keys: [{ key: "Enter", mod: true }]`; `onLeave` closes the player), the toolbar items (Play last, a primary button), `flow-row.tsx`, `flow-flag.tsx` and `flow-panel.tsx` (▶ and Play open the player), `README.md`, locales, both changelogs (extend the entry)

**Interfaces:**

- Produces:
  - `usePlayerStore`: `{ target: PlayTarget | null; open(target: PlayTarget): void; close(): void }`. The play command opens `playTarget(...)`, or with `null` shows `toast(t("player.noFlow"))`.
  - `class ScreenPictures`, constructed with `(engine: DesignEngine)`, with `load(screen: FrameElement, scale: number): Promise<string>` (an object URL, kept while `entry.screen === screen` as in `catalog/ui/preview/preview-images.ts`) and `clear(): void`. It draws with `engine.workspace("prototype:player").exportElements({ format: "png", background: "solid", area: "board", ids: [screen.id], rect: screen, scale })` after `setScope(screen.pageId)`.
  - `hotspotRects(engine: DesignEngine, screen: FrameElement): { id: string; rect: Rect }[]`: every member of the screen (`engine.withMembers([screen.id], "move")`) with interactions, in screen-local units from `engine.getElement`, the screen itself excluded.
  - `runTransition(oldEl: HTMLElement | null, newEl: HTMLElement, t: PrototypeTransition): Promise<void>`. It uses the Web Animations API with the mockup's keyframes (`left` → the new screen comes in from `translate(100%, 0)`; slide moves the other screen by 30%; `spring` = `cubic-bezier(.34, 1.56, .64, 1)`). It always cancels its animations and removes `oldEl` at the end.
- Consumes: Task 8; `isScreen`, `nodeInteractions`, `DESIGN_PROTOTYPE`; `openExternal` (`@platform`).

- [ ] **Step 1: The store, `ScreenPictures`, `hotspotRects` and `runTransition`** as above.
- [ ] **Step 2: The player overlay**, fixed over the whole window like the Catalog's `BrochurePreview`:
  - The bar: flow `SelectField`, device `Badge`, Back (Alt+←), Restart (R), hotspots toggle (H), Close (Esc).
  - The stage: `DeviceFrame` (by platform: phone, tablet, the OS title bar for desktop, a browser bar with `<page name>/<screen name, slugged>` for web) around the screen at its size, scaled to fit the stage (max 2.4×).
  - The foot: hint text, with "Tap" or "Click" by platform.
- [ ] **Step 3: Playing.** Each user action goes through `applyInteraction` and then performs its step:
  - `screen` runs `runTransition` between two picture layers;
  - overlays are placed by position, with `dim` as `bg-overlay`; a click outside closes them when `closeOutside`, and they close with their transition reversed;
  - `link` calls `openExternal(url)` only for http(s), reporting failures with `notifyError`.
  - While a transition runs, input is ignored.
  - `exists` checks that the screen is a screen of the flow's page.
- [ ] **Step 4: Triggers** (`useTriggers`), on the showing screen's or the top overlay's hotspots and the screen itself:
  - click (the nearest hotspot under the pointer with a click interaction);
  - hover (enter runs it, leave closes the overlay it opened);
  - press;
  - enter and leave;
  - drag (12 px);
  - delay (`setTimeout`, cleared on every step and on close).
  - A click on no hotspot flashes the hotspots for 700 ms when `flow.hints`. The hotspots toggle keeps them shown.
- [ ] **Step 5: Keys** (`usePlayerKeys`): first a `key` interaction on what's showing (case-insensitive `event.key`), then Esc, R, H and Alt+←. The editor's keys don't run while the player is open.
- [ ] **Step 6: Verify:** `pnpm lint && pnpm typecheck && pnpm format:check` pass.
- [ ] **Step 7: Commit:** `feat(prototype): play a flow in its device`.

**End of Phase 3:** stop, report, wait for the user.

## Phase 4: Agents

### Task 10: MCP tools · model: Sonnet

**Files:**

- Create: `modules/prototype/mcp/index.ts`, `flows.mcp.ts`, `interactions.mcp.ts`, `interaction-args.ts`, `describe-flow.ts`
- Modify: `prototype.module.ts` (`host.contribute(designMcpTools, { id: "prototype", tools: () => prototypeTools })`), `README.md` (**MCP tools**), `src/app/mcp/README.md` if it lists tool groups

**Interfaces:**

- Produces:
  - `list_flows { page? }` → `{ designPage, flows: [{ id, name, start, startName, platform, device }] }`.
  - `set_flow { flow?, page?, name?, start?, platform?, device?, orientation?, hints? }`: without `flow` it creates one (needs `start`). It validates that `start` is a screen of the page and that `device` belongs to the platform.
  - `remove_flow { flow }`.
  - `get_interactions { nodes: string[] }` → each node's list.
  - `set_interactions { node, interactions: PrototypeInteraction[] (no id needed) }`: replaces the list. Every entry must pass `readInteraction`, and every `to` must be a screen on the node's page other than its own. On the first failure it throws one message naming the index and the field.
  - Writes go in one `asUndoStep(engine.doc, …)` with `writeInteractions` or doc calls, never the checkpointing service methods.
- Consumes: `requireDesign`, `requireNodes`, `DesignMcpTool` (`../../mcp`); `asUndoStep`, arg helpers (`@canvas`); Task 1's model.

- [ ] **Step 1: The tools** as above. Mirror `catalog/mcp/brochure-list.mcp.ts` for shape and `layer-export.mcp.ts` for `asUndoStep`. Descriptions say what a screen is, the trigger/action/animation values and the direction meaning (`left` = comes in from the right).
- [ ] **Step 2: Verify:** `pnpm lint && pnpm typecheck && pnpm format:check` pass.
- [ ] **Step 3: Commit:** `feat(prototype): agent tools for flows and interactions`.

### Final review · model: Opus

- [ ] One reviewer reads the spec and the whole diff since Task 1's base commit, against the Global Constraints and the Review Focus list, and reports issues by severity. Fixes go in small follow-up commits checked directly or by a Haiku re-review.
- [ ] Delete this plan and the spec once the user confirms the feature is done (the user's rule: finished plans go; git keeps them). Write the result to memory.
