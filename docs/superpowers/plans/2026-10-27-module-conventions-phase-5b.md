# Module conventions, phase 5b: one definition per mode

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A mode is one object (`defineDesignMode` / `defineBoardMode`) registered with one call. Catalog, the Design system and ER are rewritten onto it, and the rail rule is written in one place.

**Architecture:** A product-neutral base in `@canvas-ui` (`EditorModeDefinition`, `registerEditorMode(host, points, mode)`) fans one definition out into today's points: canvas `modes`, `tools` and `hostCommands`; editor `modes` (with a generated `ModeToolbar`), `overlays` (mounted only while the mode is on) and `sessionHooks` (commands' `run`, `onEnter`/`onLeave`, `hooks`). Design adds `rail` and `sidebar` through a merged `modePanels` point. Board adds nothing. Nothing in the editors' layout changes; the helper only fans out.

**Tech Stack:** React 19, TypeScript strict, Zustand.

**Spec:** `docs/superpowers/specs/2026-10-25-module-conventions-design.md` (§15.1–15.3, §16.5, §12 phase 5b)

## Global Constraints

- Git is the user's: never commit, branch or `git mv` (use `mv`). End with a commit message for the user.
- Verification is only `pnpm lint`, `pnpm typecheck`, `pnpm format:check` (after `pnpm format`). There is no test framework, so each task's "test" is those passing plus the `grep` in its last step.
- No legacy code or aliases. Old points, constants and hooks are deleted, not re-exported. The plugin API stays v1.
- Every `interface`/`type` goes in a sibling `.types.ts`, re-exported with `export type`.
- Modules import other modules only through `index.ts`/`ui/index.ts`. `.mode.ts` files count as module UI (ESLint `PRODUCT_UI` already includes them).
- Every mode keeps its behavior: same tools, isolation, fading, commands, keys, toolbar buttons, tab, sidebar, overlays and enter/leave work.
- Rule 1: update the README of every folder whose behavior changes, in the same task.

## Decisions (rulings made while planning)

- **Names:** the spec writes `registerMode` for all three. Here the base is `registerEditorMode(host, points, mode)` in `@canvas-ui`, and the product helpers are `defineDesignMode`/`registerDesignMode` (`@design/ui/modules`) and `defineBoardMode`/`registerBoardMode` (`@board/ui/modules`). Three functions with one name would collide in the plugin API and in imports.
- **`toolbar`** is one of three forms:
  - an item list, for static items;
  - `{ useItems }`, a hook returning the items, for items that depend on state (Catalog's `disabled` while empty, ER's badge);
  - `{ component }`, a custom toolbar.

  A plain function can't be told apart from a component, hence the objects. The generated toolbar's title is the mode's `label` and `icon`, and its aria-label is `<label> mode`. ER's title becomes "ER diagrams" (its mode label) instead of "ER diagram".

- **`hostCommands[].run(engine)`** is optional. A command whose handler needs React context (Catalog's PDF export reads `useCanvasFile()` for the file name) has no `run`, and a `hooks` entry handles it.
- **Design's `modeSidebars` point becomes `modePanels`** (`{ mode, sidebar?, keepSections?, keepTabs? }`), so all of a mode's panel settings are one entry. No aliases.
- **Not done:** `menu` (no mode has a menu of its own) and board's `sidePanel` (ER's panel is a normal side panel, shown in every mode). Each is a field to add when a mode first needs it.
- **`keepSections` and `rail.keep`** are built, as the spec asks, but no built-in mode uses them yet. **`onLeave`** has a first user: Catalog closes its preview, so leaving the mode with the preview open doesn't bring it back on the next entry.

## Review Focus

1. **Overlays now mount only while their mode is on.** An overlay that kept state or listeners between entries loses them; check `BrochurePreview`, `ErPalette`, `ErCheckBadges`, `BrochureOverlay` and `StyleguideEmpty` after removing their own `inMode` checks.
2. **`onEnter`/`onLeave` must fire once per switch**, and not on first mount while the editor opens in the default mode. They must also fire for a switch made by someone else (following a collaborator).
3. **The rail in a mode shows exactly that mode's tabs plus `keepTabs`.** The tab picked in the default mode must come back when the mode is left (`useLeftTabs` keeps `picked`).
4. **Host commands registered by the generated hook** must unregister when the editor closes, and must not double-register with a leftover hook (`useCatalogCommands`, `useErModeCommands` are deleted).
5. **A tool registered through `tools`** must still be pickable only in its mode: the canvas mode's `tools` list is `allowTools` plus the registered ids other than `tool`.

---

### Task 1: The mode definition and its registration (`@canvas-ui`, design, board)

**Files:**

- Create: `src/canvas-ui/modules/editor-mode/{editor-mode.types.ts,register-editor-mode.tsx,index.ts}`
- Modify: `src/canvas-ui/modules/index.ts`, `src/canvas-ui/modules/README.md`
- Design: `src/products/design/ui/modules/{design-mode.types.ts,register-design-mode.ts,design-editor-points.ts,design-editor-points.types.ts,tabs-for-mode.ts,index.ts}`, `src/products/design/ui/components/left-panel/use-left-tabs.ts`, `src/products/design/ui/components/properties-panel/{properties-panel.tsx,property-sections.tsx,property-sections.types.ts}`, `src/products/design/README.md` (or `ui/README.md`, wherever the rail/`modeSidebars` is described)
- Board: `src/products/board/ui/modules/{board-mode.types.ts,register-board-mode.ts,index.ts}`, board `ui` README

**Interfaces:**

- Produces (from `@canvas-ui`):
  ```ts
  interface ModeHostCommand extends HostCommand {
    // HostCommand from @canvas
    /** Runs it; left out when a `hooks` entry handles it. */
    run?: (engine: CanvasEngine) => void;
  }
  type ModeToolbarSpec =
    | readonly ModeToolbarEntry[]
    | { useItems: () => readonly ModeToolbarEntry[] }
    | { component: ComponentType };
  interface EditorModeDefinition<O extends object> {
    id: string;
    label: string;
    description?: string;
    icon: ExtensionIcon;
    order: number;
    tool: string; // the tool it starts with
    tools?: readonly ProductTool<O>[]; // registered with it
    allowTools?: readonly string[]; // other tools that work in it ("hand")
    isolate?: CanvasMode["isolate"];
    faded?: CanvasMode["faded"];
    commands?: CanvasMode["commands"];
    keybindings?: CanvasMode["keybindings"];
    hostCommands?: readonly ModeHostCommand[];
    toolbar?: ModeToolbarSpec;
    overlays?: readonly ComponentType[]; // mounted only while it's on
    onEnter?: (engine: CanvasEngine) => void;
    onLeave?: (engine: CanvasEngine) => void;
    hooks?: readonly (() => void)[]; // session hooks for as long as the editor is open
  }
  interface ModePoints<O extends object> {
    canvas: CanvasPoints<O>;
    editor: EditorPoints;
  }
  function defineEditorMode<O extends object>(
    mode: EditorModeDefinition<O>,
  ): EditorModeDefinition<O>; // identity
  function registerEditorMode<O extends object>(
    host: ModuleHost,
    points: ModePoints<O>,
    mode: EditorModeDefinition<O>,
  ): void;
  ```
- `registerEditorMode` contributes:
  - `canvas.modes`: `{ id, tool, tools: [...(allowTools ?? []), ...registered ids ≠ tool], isolate, faded, commands, keybindings }`, leaving out unset keys.
  - `canvas.tools`: the `tools`.
  - `canvas.hostCommands`: each command's `{ id, label, keys }`.
  - `editor.modes`: `{ id, label, description, icon, order, toolbar }`, with the toolbar component built from `ModeToolbarSpec`. A list or `useItems` renders `<ModeToolbar title={{ label, icon }} label={`${label} mode`} items={…} />`.
  - `editor.overlays`: `${id}.overlay${i}`, each wrapped in a component rendering it only while `useEngineState((s) => s.mode) === id`.
  - `editor.sessionHooks`:
    - `${id}.mode`: registers every `run` with `engine.handleHostAction` and unregisters on cleanup. It also calls `onEnter`/`onLeave` on transitions of `state.mode` into or out of `id`, not on first mount, using a ref of the previous value.
    - `${id}.hook${i}`: each of `hooks`.
- Produces (design, from `@design/ui/modules`):
  - `ModePanelEntry = { mode: string; sidebar?: ComponentType; keepSections?: readonly string[]; keepTabs?: readonly string[] }` on the point `designEditor.modePanels` (keyed by `mode`). It replaces `modeSidebars`/`ModeSidebarEntry`.
  - `DesignModeDefinition = EditorModeDefinition<DesignToolOptions> & { rail?: { tabs: readonly DesignModeTab[]; keep?: readonly string[] }; sidebar?: ComponentType | { component: ComponentType; keepSections: readonly string[] } }`, where `DesignModeTab = Omit<LeftTabEntry, "modes" | "order"> & { order?: number }` (default order `(i + 1) * 10`).
  - `defineDesignMode(mode: DesignModeDefinition): DesignModeDefinition` (identity) and `registerDesignMode(host, mode)`. It calls `registerEditorMode(host, { canvas: designCanvas, editor: designEditor }, mode)`, contributes each rail tab to `designEditor.leftTabs` with `modes: [mode.id]`, and contributes one `modePanels` entry when `sidebar` or `rail.keep` is set.
  - `tabsForMode(tabs, mode, keep?: readonly string[])` is **the rail rule, written here once**. In the default mode it shows every tab without `modes`. In any other mode it shows only the tabs whose `modes` include it, plus the default tabs whose id is in `keep`. `useLeftTabs` passes `host.find(designEditor.modePanels, mode)?.keepTabs`.
  - `PropertiesPanel`: the tool's sidebar (`toolSidebars`) still wins. Otherwise, when the mode's `modePanels` entry has a `sidebar`, it shows that, followed by `<PropertySections tab="design" only={keepSections} />` when `keepSections` is set. `PropertySections` gains `only?: readonly string[]` (section ids).
- Produces (board, from `@board/ui/modules`): `BoardModeDefinition = EditorModeDefinition<BoardToolOptions>`, `defineBoardMode` (identity), and `registerBoardMode(host, mode)` (calls `registerEditorMode` with `boardCanvas`/`boardEditor`).

- [ ] **Step 1:** Write the canvas-ui types and `registerEditorMode`/`defineEditorMode`, and export them from `src/canvas-ui/modules/index.ts` (and through `@canvas-ui`).
- [ ] **Step 2:** Design:
  - Rename the point to `modePanels` (entry type `ModePanelEntry`) and update the two readers: `properties-panel.tsx` and `use-left-tabs.ts`/`tabs-for-mode.ts`, the latter with `keep`.
  - Add `only` to `PropertySections`.
  - Write `defineDesignMode`/`registerDesignMode` and their types, and export them from `ui/modules/index.ts`.
  - The old `modeSidebars` contributions in catalog and styleguide go away in Tasks 2–3. Until then, change them to `modePanels` entries with `sidebar`, so this task compiles on its own.
- [ ] **Step 3:** Board: write `defineBoardMode`/`registerBoardMode` and export them.
- [ ] **Step 4:** READMEs:
  - `canvas-ui/modules/README.md` gets a "Mode definitions" section: the fields, what each fans out to, the toolbar forms, overlays only while on, `onEnter`/`onLeave`.
  - The design editor's README writes the rail rule and `modePanels` (`keepSections`, `keepTabs`).
  - Board's README gets one line about its helper.
- [ ] **Step 5: Verify**
      Run: `pnpm lint && pnpm typecheck && pnpm format && pnpm format:check && grep -rn "modeSidebars\|ModeSidebarEntry" src`
      Expected: the checks pass and grep prints nothing.

### Task 2: Catalog on `defineDesignMode`

**Files:**

- Create: `src/products/design/modules/catalog/catalog.mode.ts`
- Modify: `catalog/catalog.module.ts`, `catalog/mode/index.ts`, `catalog/ui/toolbar/catalog-mode-toolbar.tsx` (becomes `useCatalogToolbarItems`), `catalog/ui/canvas/brochure-overlay.tsx` (drop its own `inMode` check), `catalog/README.md`
- Delete: `catalog/mode/catalog-mode.ts` (`CATALOG_MODE`), `catalog/ui/hooks/use-catalog-commands.ts` (its pick and preview become `run`; the export becomes `catalog/ui/hooks/use-export-command.ts`, a hook that registers only `CATALOG_COMMANDS.exportPdf` with `useExportBrochure`)

**Interfaces:**

- Consumes: `defineDesignMode`, `registerDesignMode` (Task 1).
- Produces: `catalogMode` (in `catalog.mode.ts`), and `useCatalogToolbarItems(): readonly ModeToolbarEntry[]` (in `catalog/ui/toolbar/use-catalog-toolbar-items.ts`, which replaces `catalog-mode-toolbar.tsx`; same items as today).

`catalogMode` is:

```ts
defineDesignMode({
  id: CATALOG_MODE_ID,
  label: "Catalog",
  description: "Arrange frames into a print brochure: order, options, checks and PDF.",
  icon: BookOpen,
  order: 10,
  tool: CATALOG_TOOL,
  tools: [
    { id: CATALOG_TOOL, create: (ctx) => new CatalogTool(ctx) },
    { id: CATALOG_PICK_TOOL, create: (ctx) => new CatalogPickTool(ctx) },
  ],
  allowTools: ["hand"],
  isolate: isPageFrame,
  faded: catalogFaded,
  commands: CATALOG_ALLOWED_COMMANDS,
  hostCommands: [
    {
      id: CATALOG_COMMANDS.pick,
      label: "Pick the brochure's frames",
      run: (e) => e.setTool(CATALOG_PICK_TOOL),
    },
    {
      id: CATALOG_COMMANDS.preview,
      label: "Preview the brochure",
      run: () => useBrochurePreviewStore.getState().open(),
    },
    { id: CATALOG_COMMANDS.exportPdf, label: "Export the brochure as PDF" }, // useExportCommand
  ],
  toolbar: { useItems: useCatalogToolbarItems },
  rail: { tabs: [{ id: "brochure", label: "Brochure", icon: BookOpen, component: BrochureTab }] },
  sidebar: CatalogSidebar,
  overlays: [BrochureOverlay, BrochurePreview],
  onLeave: () => useBrochurePreviewStore.getState().close(),
  hooks: [useExportCommand, useArrangeGlide, useArrangeOnEnter],
});
```

`catalog.module.ts` keeps the kind, `onRemove`, migration, `editElement` and MCP contributions, and calls `registerDesignMode(host, catalogMode)` in place of the mode's contributions.

- [ ] **Step 1:** Write `catalog.mode.ts`, `useCatalogToolbarItems` and `useExportCommand`. Delete `CATALOG_MODE`, `CatalogModeToolbar` and `useCatalogCommands`, and update `mode/index.ts`.
- [ ] **Step 2:** Rewrite `catalog.module.ts` and remove `BrochureOverlay`'s own mode check.
- [ ] **Step 3:** Update catalog's README (the mode is one definition in `catalog.mode.ts`; the overlays mount only while it's on; leaving closes the preview) and its Files list.
- [ ] **Step 4: Verify**
      Run: `pnpm lint && pnpm typecheck && pnpm format && pnpm format:check && grep -rnE "CATALOG_MODE\b|CatalogModeToolbar|useCatalogCommands|designEditor\.(modes|leftTabs|overlays|sessionHooks)" src/products/design/modules/catalog`
      Expected: the checks pass and grep prints nothing.

### Task 3: The Design system on `defineDesignMode`

**Files:**

- Modify: `styleguide/styleguide.mode.ts` (becomes `export const styleguideMode = defineDesignMode({…})`), `styleguide/styleguide.module.ts` (calls `registerDesignMode(host, styleguideMode)` in place of `registerStyleguideMode(host)`), `styleguide/mode/index.ts`, `styleguide/ui/empty/styleguide-empty.tsx` (drop its own mode check, keeping any other use of the flag), `styleguide/README.md`
- Delete: `styleguide/mode/styleguide-mode.ts` (`STYLEGUIDE_MODE`)

**Interfaces:**

- Produces: `styleguideMode`, made of:
  - `id: STYLEGUIDE_MODE_ID`, `label: "Design system"`, description as today, `icon: Palette`, `order: 20`;
  - `tool: STYLEGUIDE_TOOL`, `tools: [{ id: STYLEGUIDE_TOOL, create: (ctx) => new StyleguideTool(ctx) }]`, plus `allowTools`, `isolate`, `faded` and `commands` copied from today's `STYLEGUIDE_MODE`;
  - `rail: { tabs: [{ id: "styleguide", label: "Design system", icon: Palette, component: StyleguideTab }] }`;
  - `sidebar: StyleguideSidebar`, `overlays: [StyleguideEmpty]`, `hooks: [useStyleguideScope, useStyleguideSelection]`.

  `useStyleguideScope` stays a hook: it also reacts to the system page showing outside the mode, so it isn't an `onEnter`. It has no toolbar (as today).

- [ ] **Step 1:** Rewrite `styleguide.mode.ts` and `styleguide.module.ts`, delete `STYLEGUIDE_MODE`, and drop `StyleguideEmpty`'s mode check.
- [ ] **Step 2:** Update styleguide's README (the `modeSidebars` mention becomes `sidebar` of `styleguideMode`).
- [ ] **Step 3: Verify**
      Run: `pnpm lint && pnpm typecheck && pnpm format && pnpm format:check && grep -rnE "STYLEGUIDE_MODE\b|registerStyleguideMode" src`
      Expected: the checks pass and grep prints nothing.

### Task 4: ER on `defineBoardMode`

**Files:**

- Modify: `board/modules/er/er.mode.ts` (becomes `export const erMode = defineBoardMode({…})`), `er/er.module.ts` (calls `registerBoardMode(host, erMode)` in place of `registerErMode(host)`; `enterErMode` stays a `boardCanvas.editElement` contribution there), `er/mode/index.ts`, `er/ui/er-mode/er-mode-toolbar.tsx` (becomes `use-er-toolbar-items.ts`, `useErToolbarItems()`), `er/ui/er-mode/index.ts`, `er-check-badges.tsx` and `er-palette` (drop their own mode checks), `er/README.md`
- Delete: `er/mode/er-mode.ts`'s `ER_MODE` (keep `ER_MODE_ID` in a constants file, as catalog has), `er/ui/er-mode/use-er-mode-commands.ts` (its handler becomes the commands' `run`, through a plain function `runErModeCommand(engine, item)` in `er/ui/er-mode/run-er-mode-command.ts`)

**Interfaces:**

- Produces: `erMode`, made of:
  - `id: ER_MODE_ID`, `label: "ER diagrams"`, description as today, `icon: Network`, `order: 10`;
  - `tool: "select"`, `allowTools: ["hand", "er"]`, `isolate: isErElement`, `keybindings` built from `ER_MODE_COMMANDS` as today;
  - `hostCommands: ER_MODE_COMMANDS.map(({ command, label, item }) => ({ id: command, label, run: (engine) => runErModeCommand(engine, item) }))`;
  - `toolbar: { useItems: useErToolbarItems }`, `overlays: [ErCheckBadges, ErPalette]`.

- [ ] **Step 1:** Write `erMode`, `useErToolbarItems` and `runErModeCommand`. Delete `ER_MODE`, `ErModeToolbar`, `useErModeCommands` and `registerErMode`.
- [ ] **Step 2:** Drop the overlays' own mode checks, and update ER's README.
- [ ] **Step 3: Verify**
      Run: `pnpm lint && pnpm typecheck && pnpm format && pnpm format:check && grep -rnE "ER_MODE\b|ErModeToolbar|useErModeCommands|registerErMode" src`
      Expected: the checks pass and grep prints nothing.

### Task 5: Plugin API, docs, close the phase

**Files:**

- `src/app/plugins/create-plugin-api.ts`, `plugin-api.types.ts`: add `defineMode: defineDesignMode`, `registerMode: registerDesignMode` to `api.design`, and `defineMode: defineBoardMode`, `registerMode: registerBoardMode` to `api.board` (keys as the spec's §15.3 names them; small additions per the Transition rule).
- `docs/plugins.md`: a "Modes" paragraph (one definition, `api.design.registerMode(host, mode)`, the fields).
- `docs/modules.md` §Modes: match the names (`defineDesignMode`/`registerDesignMode`, `defineBoardMode`/`registerBoardMode`), the toolbar forms and `modePanels`.
- `CLAUDE.md`: delete the 5b row of the Transition table and the "No new modes until 5b" bullet. Rule 16 or 21 doesn't change.
- Spec: §12 phase 5 says "5b done 2026-10-27"; §15.2 notes the rulings (names, toolbar forms, `modePanels`, not done: `menu`, `sidePanel`).
- Memory `module-conventions.md` and `MEMORY.md`: 5b done, phase 6 next.

- [ ] **Step 1:** Make the edits.
- [ ] **Step 2: Verify**
      Run: `pnpm lint && pnpm typecheck && pnpm format && pnpm format:check`
      Expected: all pass.
- [ ] **Step 3:** Give the user a commit message (`refactor: one definition per mode`, a bullet per task, the `Co-Authored-By` line). Delete this plan after they commit.
