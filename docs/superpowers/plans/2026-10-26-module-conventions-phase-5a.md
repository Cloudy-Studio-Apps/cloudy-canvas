# Module conventions, phase 5a: shared pieces

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every piece the spec's §16.2 finds written twice or more is written once, in `@shared/ui/kit`, `@canvas-ui` or a module's `ui/index.ts`, and every copy uses it.

**Architecture:** New pieces go where §16.1 says by what they know: theme-only fields go in the kit, and engine-aware pieces (colors, images, thumbnails, mode chrome) go in `@canvas-ui`. Each task adds one piece, moves every duplicate onto it, deletes the duplicates and updates the READMEs that describe them. Element thumbnails need two small engine additions (`scopeOf`, `rootOf`) so the class can leave catalog.

**Tech Stack:** React 19, TypeScript strict, Tailwind v4, shadcn/Radix, Zustand.

**Spec:** `docs/superpowers/specs/2026-10-25-module-conventions-design.md` (§16.1–16.5 and §12, phase 5a; §15.2 for the toolbar's item shape)

## Global Constraints

- Git is the user's: never commit, branch or `git mv` (use `mv`). The plan ends with a commit message for the user.
- Verification is only `pnpm lint`, `pnpm typecheck` and `pnpm format:check`. No builds, cargo, `tauri dev` or browser checks. There is no test framework, so each task's "test" is these three commands passing and a `grep` showing no duplicate left.
- No legacy code or aliases. Old names are deleted, not re-exported. The plugin API stays v1 (`PLUGIN_API_VERSION` 1).
- Every `interface`/`type` goes in a sibling `<file>.types.ts`, re-exported with `export type`.
- UI uses semantic tokens only, with sharp radii (`rounded-xs`/`rounded-md`/`rounded-card`, 8px max).
- Modules import other modules only through `index.ts`/`ui/index.ts`. A feature may only import core modules or modules in its `requires`/`uses`, and never its own product barrel (`pnpm lint` checks this).
- Rule 1: update the README of every folder whose behavior changes, in the same task.
- Run `pnpm format` before `pnpm format:check`.

## Review Focus

1. **A color drag must stay one undo step everywhere.** `ColorField` holds checkpoints while dragging, and callers that also pass `info` on (effects) must not split or double the step. Drag a shadow color, a variable color and a board color, then undo once each.
2. **Closing a color popover mid-drag, or unmounting it**, must still release the held checkpoints (as `SwatchInput` does today).
3. **Catalog thumbnails must keep their cache when a frame only moves** (Arrange, a drag) and must be redrawn when something inside changes. That only works if design's `rootOf` returns the top-level frame for a deep child.
4. **ModeToolbar's `{ tool: "hand" }`** must find its label, icon and shortcut from the `tools` point. A tool with no entry must render nothing rather than crash.
5. **The kit-import rewrite** must not change which component is used. `cn`, `Button`, `Popover`, … from the kit are the same objects re-exported, and any name the kit doesn't export must make the script stop rather than guess.

---

### Task 1: Labelled fields in the kit (`SelectField`, `CheckboxField`, `SwitchField`)

**Files:**

- Create: `src/shared/ui/kit/select-field/{select-field.tsx,select-field.types.ts,index.ts}`, `src/shared/ui/kit/checkbox-field/{checkbox-field.tsx,checkbox-field.types.ts,index.ts}`, `src/shared/ui/kit/switch-field/{switch-field.tsx,switch-field.types.ts,index.ts}`
- Modify: `src/shared/ui/kit/index.ts`, `src/shared/ui/kit/README.md`
- Replace and delete: `design/modules/catalog/ui/sidebar/{setting-select.tsx,toggle.tsx}` (and their types in `sidebar.types.ts`), `design/modules/effects/ui/fields/effect-toggle.tsx` (and `EffectToggleProps`), `design/modules/variables/ui/type-scale/choice-field.tsx` (and `ChoiceFieldProps`), `design/modules/styleguide/ui/sidebar/modes-switch.tsx`
- Rewrite onto the fields: `styleguide/ui/picker/option-field.tsx` (boolean and select cases), `styleguide/ui/sidebar/source-fields.tsx` (both selects), `styleguide/ui/sidebar/sheet-fields.tsx` (the switch row), `variables/ui/window/inspector/purpose-select.tsx`, `variables/ui/window/generator/ratio-field.tsx` (the "Custom" item is one more option), `core/ui/styles/stroke-style-dashes.tsx`, `design/ui/components/paint-picker/image-editor.tsx` (scale mode select), `shader-effect/ui/shader-editor.tsx` (preset select, if its value is a plain option; else leave it)

**Interfaces:**

- Produces (all from `@shared/ui/kit`):
  - `SelectField<T extends string>(props: SelectFieldProps<T>)`, where `SelectFieldProps<T> = { label: string; value: T; options: readonly SelectOption<T>[]; onChange: (value: T) => void; layout?: "inline" | "stacked" | "bare"; placeholder?: string; disabled?: boolean; className?: string }` and `SelectOption<T> = { value: T; label: string }`. `"bare"` (the default) shows no label, only `aria-label`/`title`. `"inline"`/`"stacked"` wrap it in `Field` with that layout. The trigger is `h-7 w-full text-xs`, as all the copies use.
  - `CheckboxField(props: CheckboxFieldProps)`, where `CheckboxFieldProps = { label: string; checked: boolean | "mixed"; onChange: (checked: boolean) => void; disabled?: boolean; className?: string }`. It renders the kit `Checkbox` with `label` and `text-muted-foreground`, like `Toggle`/`EffectToggle`.
  - `SwitchField(props: SwitchFieldProps)`, where `SwitchFieldProps = { label: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean; className?: string }`. It renders a `<label>` with `flex items-center justify-between gap-2 text-xs text-muted-foreground` holding the text and the kit `Switch`, like `ModesSwitch`.

- [ ] **Step 1:** Write the three fields, their types and `index.ts`, and export them from `src/shared/ui/kit/index.ts`.
- [ ] **Step 2:** Rewrite each file listed above onto them. Delete `SettingSelect`, `Toggle`, `EffectToggle`, `ChoiceField` and `ModesSwitch` with their props types, and inline `ModesSwitch` as a `SwitchField` in its two callers. Remove `EffectToggle` from `effects/ui/fields/index.ts` and `effects/ui/index.ts`. In `src/app/plugins/create-plugin-api.ts` and `plugin-api.types.ts`, drop `EffectToggle` from `design.effects`; plugins get `CheckboxField` through `api.ui.kit`.
- [ ] **Step 3:** Update `src/shared/ui/kit/README.md` (the three fields: when to use which layout), and the READMEs of catalog, effects, variables and styleguide wherever they name a deleted piece. Also check `docs/plugins.md` for `EffectToggle` and change it to `api.ui.kit.CheckboxField`.
- [ ] **Step 4: Verify**
      Run: `pnpm lint && pnpm typecheck && pnpm format && pnpm format:check && grep -rnE "SettingSelect|EffectToggle|ChoiceField|ModesSwitch|function Toggle\b" src docs/plugins.md`
      Expected: all three checks pass and grep prints nothing.

### Task 2: `ColorField` and `ColorPopover` in `@canvas-ui`

**Files:**

- Create: `src/canvas-ui/components/color-field/{color-popover.tsx,color-field.tsx,color-field.types.ts,index.ts}`
- Modify: `src/canvas-ui/index.ts`, `src/canvas-ui/README.md`
- Replace and delete: `design/modules/effects/ui/fields/effect-color-field.tsx` (and `EffectColorFieldProps`), `design/modules/variables/ui/swatch-input.tsx` (and `SwatchInputProps`)
- Rewrite onto them: `effects/ui/editors/*` (every `EffectColorField`), `shader-effect/ui/shader-param-field.tsx`, `sticker/ui/sticker-outline-fields.tsx`, `sticker/ui/sticker-edge-field.tsx`, `variables/ui/value-field.tsx` and `variables/ui/window/inspector/color-mode-card.tsx` (swatch + hex + opacity → `ColorField`), `variables/ui/window/generator/base-color-field.tsx` (`ColorField` without `opacity`), `board/modules/colors/ui/color-value-popover.tsx` (→ `ColorPopover` with `TokenSwatch` as trigger and the description textarea as children)
- Plugin API: `src/app/plugins/create-plugin-api.ts`, `src/app/plugins/plugin-api.types.ts`, `docs/plugins.md`

**Interfaces:**

- Produces (from `@canvas-ui`):
  - `ColorPopover(props: ColorPopoverProps)`, where `ColorPopoverProps = { color: string; opacity?: number; label: string; onChange: (next: ColorValue, info: ColorChangeInfo) => void; trigger?: ReactNode; side?: "left" | "bottom" | "right" | "top"; children?: ReactNode }` and `ColorValue = { color: string; opacity: number }`. `trigger` is the popover's trigger. By default it's a swatch button (`CHECKERBOARD` under the color, `size-3.5 rounded-xs border border-border-strong`) labelled `Edit <label>`. The content is `ColorPicker` followed by `children`. **Undo is built in:** the first `info.done === false` step takes `engine.doc.holdCheckpoints()` (from `EngineContext`, nothing outside an editor), and `done`, closing the popover or unmounting releases it. This is the logic `SwatchInput` has now; `ColorValuePopover`'s `useScrubUndo` version goes away. When `opacity` is left out, `next.opacity` is `1`.
  - `ColorField(props: ColorFieldProps)`, where `ColorFieldProps = { color: string; opacity?: number; label: string; hex?: boolean; onChange: (next: ColorValue, info: ColorChangeInfo) => void; className?: string }`. Inside a kit `FieldBox` (`gap-0 pl-2`) it shows a `ColorPopover`, then a `HexInput` (unless `hex === false`, `px-2`) and a `PercentInput` when `opacity !== undefined` (`w-12 border-l border-surface px-1.5`, as the variables copies do). Hex and percent commits call `onChange(…, { done: true })`.
- Consumes: `ColorPicker`, `HexInput`, `PercentInput`, `CHECKERBOARD`, `EngineContext` (all in `@canvas-ui`), and `FieldBox`, `Popover*` from `@shared/ui/kit`.

- [ ] **Step 1:** Write `ColorPopover`, `ColorField` and their types, and export them and the types from `src/canvas-ui/index.ts`.
- [ ] **Step 2:** Rewrite every caller listed above onto them. Effects' editors pass `info` on as before. The variables callers do `set(joinTokenColor(next.color, next.opacity))`. In `base-color-field.tsx`, the fixed-color branch becomes `<ColorField color={hex} label="Base color" onChange={(next) => change({ baseColor: joinTokenColor(next.color, 1) })} />`.
- [ ] **Step 3:** Delete `EffectColorField`, `SwatchInput` and their types, and remove them from `effects/ui/fields/index.ts`, `effects/ui/index.ts` and the variables barrels. In the plugin API, drop `EffectColorField` from `design.effects` (the `Pick` keeps `"EffectChoice" | "ScrubField"`) and add `"ColorField" | "ColorPopover"` to the `canvasUi` `Pick` of `api.ui`, with the values in `create-plugin-api.ts`.
- [ ] **Step 4:** Update the docs. `src/canvas-ui/README.md` gets a "Color field" paragraph: one color field app-wide, and how a drag counts as one undo step. Also update the READMEs of effects, variables (`BaseColorField` line), sticker, shader-effect and board colors, and `docs/plugins.md`. `PaintField` stays: it edits a paint (solid, gradient or image) through `PaintPicker`, not a color. Say so in one line in `src/products/design/ui/README.md` next to `PaintField`.
- [ ] **Step 5: Verify**
      Run: `pnpm lint && pnpm typecheck && pnpm format && pnpm format:check && grep -rnE "EffectColorField|SwatchInput|holdCheckpoints" src --include='*.tsx'`
      Expected: the checks pass; grep shows `holdCheckpoints` only in `src/canvas-ui/components/color-field/color-popover.tsx` (plus any non-color user that already existed) and no `EffectColorField`/`SwatchInput`.

### Task 3: `chooseImageAsset` and `ImageChooseButton` in `@canvas-ui`

**Files:**

- Create: `src/canvas-ui/images/{choose-image-asset.ts,choose-image-asset.types.ts,image-choose-button.tsx,image-choose-button.types.ts,index.ts}`
- Modify: `src/canvas-ui/index.ts`, `src/canvas-ui/README.md`, `src/products/design/ui/components/paint-picker/image-editor.tsx`, `src/products/design/modules/catalog/ui/page-actions.ts`, `src/products/design/ui/README.md`, `src/products/design/modules/catalog/README.md`, plugin API (`create-plugin-api.ts`, `plugin-api.types.ts`), `docs/plugins.md`

**Interfaces:**

- Produces (from `@canvas-ui`):
  - `chooseImageAsset(engine: CanvasEngine, options: ChooseImageOptions): Promise<string | null>`, where `ChooseImageOptions = { title: string; errorTitle?: string }`. It runs `pickImageFiles({ title, multiple: false })`, then `createId()` and `engine.doc.addAsset(id, file.data)`, and returns the id. Cancel returns `null`. Errors call `notifyError(errorTitle ?? "The image couldn't be opened", error)` and return `null`.
  - `ImageChooseButton(props: ImageChooseButtonProps)`, where `ImageChooseButtonProps = { onChoose: (assetId: string) => void; replace?: boolean; title?: string } & Omit<ButtonProps, "onClick" | "children">`. It's a kit `Button` with the `ImagePlus` icon and "Replace image…"/"Choose image…", whose click awaits `chooseImageAsset(useEngine(), { title: title ?? "Choose an image" })` and calls `onChoose` with an id.
- Consumes: `pickImageFiles` (`@platform`), `createId` (`@shared/core`), `notifyError` (`@shared/stores/toast-store`).

- [ ] **Step 1:** Write both, with their types and `index.ts`, and export them from `src/canvas-ui/index.ts`.
- [ ] **Step 2:** In `ImageEditor`, the button becomes `<ImageChooseButton replace={!!url} variant=… size="sm" className=… onChoose={(assetId) => onChange(paint ? { ...paint, assetId } : imagePaint(assetId))} />`, and the local `choose` is deleted. In catalog's `replaceImage`, use `const assetId = await chooseImageAsset(engine, { title: "Replace the image", errorTitle: "The image couldn't be replaced" }); if (!assetId) return;`, followed by `checkpoint()` and `update`, as before. Remove the `@platform`/`createId` imports that are no longer used.
- [ ] **Step 3:** Add both to the plugin API's `api.ui` `Pick` and values. Update the READMEs listed above and `docs/plugins.md`.
- [ ] **Step 4: Verify**
      Run: `pnpm lint && pnpm typecheck && pnpm format && pnpm format:check && grep -rn "pickImageFiles" src/products`
      Expected: the checks pass and grep prints nothing.

### Task 4: `ModeToolbar` and `ModeToolbarItem` in `@canvas-ui`

**Files:**

- Create: `src/canvas-ui/modules/{mode-toolbar.tsx,mode-toolbar-item.tsx,mode-toolbar.types.ts}`
- Modify: `src/canvas-ui/modules/index.ts`, `src/canvas-ui/modules/README.md`
- Rewrite onto it: `design/modules/catalog/ui/toolbar/catalog-mode-toolbar.tsx`, `board/modules/er/ui/er-mode/er-mode-toolbar.tsx`, `design/modules/vector/ui/vector-edit-toolbar.tsx`; READMEs of catalog, er and vector
- Plugin API: add `ModeToolbar`, `ModeToolbarItem` to `api.ui`'s `canvasUi` `Pick`; `docs/plugins.md`

**Interfaces:**

- Produces (from `@canvas-ui`). The data type is `ModeToolbarEntry`, so that `ModeToolbarItem` can be the component the spec names:

  ```ts
  type ModeToolbarEntry =
    | "divider"
    | { tool: string; label?: string; description?: string; icon?: ExtensionIcon }
    | {
        command: string;
        label: string;
        description?: string;
        icon: ExtensionIcon;
        disabled?: boolean;
        activeWhen?: { tool: string };
        badge?: number;
      }
    | {
        run: () => void;
        label: string;
        description?: string;
        icon: ExtensionIcon;
        disabled?: boolean;
        active?: boolean;
        badge?: number;
      };
  interface ModeToolbarProps {
    items: readonly ModeToolbarEntry[];
    /** Shown first with its icon and a divider; without it, the toolbar starts with the items. */
    title?: { label: string; icon: ExtensionIcon };
    /** The toolbar's aria-label (default: the title's label). */
    label?: string;
    /** What Done does (default: `useEditorMode().leave`). */
    onDone?: () => void;
  }
  interface ModeToolbarItemProps {
    item: Exclude<ModeToolbarEntry, "divider">;
  }
  ```
  - `ModeToolbar` renders `FloatingPanel role="toolbar" aria-orientation="horizontal"`, then the title, `"divider"` as `PanelDivider`, one `ModeToolbarItem` per item, and finally `PanelDivider` and a kit `Button size="sm" className="mx-1"` labelled "Done".
  - `ModeToolbarItem` renders a `ToolButton`:
    - **tool item:** label, description and icon default from the `tools` point's entry (`useOptionalEditorPoint((p) => p.tools)` + `toolInfo`). If there's no entry and no `label`/`icon` given, it renders `null`. The shortcut is `engine.keymap.label(\`tool.${tool}\`)`, it's active when `useEngineState((s) => s.tool) === tool`, and a click does `engine.setTool(tool)`.
    - **command item:** a click does `engine.runHostAction(command)`, the shortcut is `engine.keymap.label(command)`, and it's active when `activeWhen.tool` is the engine's tool.
    - **run item:** a click calls `run`.
    - **`badge`** (> 0) draws the small count ER's check button draws today (`bg-warning … text-surface`), over the icon. The icon is drawn with `ExtensionIconView`.

- [ ] **Step 1:** Write the types, `ModeToolbarItem` and `ModeToolbar`, and export them and their types from `src/canvas-ui/modules/index.ts`.
- [ ] **Step 2:** Rewrite the three toolbars as components that build `items` (they still read their own state for `disabled`/`badge`) and return `<ModeToolbar …/>`:
  - **Catalog:** title `{ label: "Catalog", icon: BookOpen }`; `{ tool: CATALOG_TOOL, label: "Select pages", description: …, icon: MousePointer2 }`, `{ tool: "hand" }`, divider, `{ command: CATALOG_COMMANDS.pick, label: "Pick frames", …, icon: ListChecks, activeWhen: { tool: CATALOG_PICK_TOOL } }`, `{ run: () => brochure?.arrange(), … disabled: pages === 0 }`, then preview and export as commands with `disabled: pages === 0`. Keep the labels and descriptions word for word.
  - **ER:** title `{ label: "ER diagram", icon: Network }`, and every button is a `run` item; Check diagram passes `badge: findings`.
  - **Vector edit:** no title, `label: "Vector editing"`, the five `TOOLS` as tool items (with their own label, description and icon), `onDone: () => engine.commands.editSelection?.()`.
- [ ] **Step 3:** Update the three modules' READMEs and `src/canvas-ui/modules/README.md`, and add the plugin API entries and `docs/plugins.md`.
- [ ] **Step 4: Verify**
      Run: `pnpm lint && pnpm typecheck && pnpm format && pnpm format:check && grep -rln "PanelDivider" src/products`
      Expected: the checks pass. grep doesn't list the three toolbar files (other `PanelDivider` users, such as the main toolbars, may remain).

### Task 5: Element thumbnails in `@canvas-ui` (with `scopeOf`/`rootOf` on the engine)

**Files:**

- Engine: `src/canvas/canvas-product.types.ts` (`rootOf?`), `src/canvas/modules/create-canvas-points.ts` + `canvas-points.types.ts` + `compose-product.ts` (a single-contribution `rootOf` point, as `alignTarget` is), `src/canvas/canvas-engine.ts` (`scopeOf`, `rootOf`), `src/canvas/README.md` and `src/canvas/modules/README.md`
- Design: `src/products/design/modules/core/tree/root-of.ts` (new), `core/core.canvas.ts` (contribute it), `core/README.md`
- Create: `src/canvas-ui/thumbnails/{element-thumbnails.ts,use-element-thumbnail.ts,element-thumbnail.tsx,thumbnails.types.ts,index.ts}`
- Modify: `src/canvas-ui/index.ts`, `src/canvas-ui/README.md`
- Catalog: delete `catalog/ui/thumbnails/frame-thumbnails.ts`, `catalog/ui/hooks/use-frame-thumbnail.ts`, `catalog/ui/brochure-tab/page-thumbnail.tsx` (and `PageThumbnailProps`); rewrite `brochure-page-row.tsx`, `brochure-options-list.tsx`, `sidebar/page-section.tsx` and `preview/preview-strip.tsx` onto `ElementThumbnail`; update `catalog/README.md`

**Interfaces:**

- Produces (engine):
  - `CanvasProduct.rootOf?(doc: CanvasDocument, id: string): string | null` is "the top-level element `id` is drawn in (itself when nothing holds it); `null` when `id` isn't an element". The point `rootOf` is single, like `alignTarget`.
  - `CanvasEngine.rootOf(id: string): string | null` returns the product's answer, or `id` when the product has none and `doc.get(id)` exists, else `null`.
  - `CanvasEngine.scopeOf(el: CanvasElement): string | null` returns `this.scopes?.of(el) ?? null`.
  - Design core contributes `treeRootOf(doc, id)`: the `topOf` walk now in `FrameThumbnails`, which reads `doc.field(id, "parentId")` and stops after 256 steps.
- Produces (from `@canvas-ui`):
  - `class ElementThumbnails` and `elementThumbnailsOf(engine: CanvasEngine): ElementThumbnails` (one per engine, `WeakMap`). `FrameThumbnails` keeps its behavior with these changes:
    - `isPageFrame(frame)` becomes "the element still exists".
    - `topOf` becomes `engine.rootOf`.
    - `capture` compares `engine.scopeOf(el)` with `engine.scope`.
    - `render` does what `drawFrame` did, generically: `const ws = engine.workspace("thumbnails"); if (ws.scope !== scope) ws.setScope(scope); ws.exportElements({ format: "jpg", background: "solid", area: "board", ids: [id], rect: { x, y, w, h }, scale: THUMBNAIL_SIDE / Math.max(w, h, 1) })`.
    - Constants stay: side 240, redraw delay 400 ms, `MOVE_FIELDS` `x`/`y`. The `onClose` key becomes `"canvas-ui.thumbnails"`.
  - `useElementThumbnail(id: string): string | null`.
  - `ElementThumbnail(props: ElementThumbnailProps)`, where `ElementThumbnailProps = { id: string; className?: string }`, renders `PageThumbnail`'s markup.
- **Ruling (spec says `useElementThumbnail(id, size)`):** there's one size (240 px longest side), because every caller uses it and the cache is per id. A `size` parameter can be added when a caller needs another one.

- [ ] **Step 1:** Engine: add the point, the product field, `compose-product` wiring and the two engine methods, and document them in `src/canvas/README.md`/`modules/README.md`.
- [ ] **Step 2:** Design: write `core/tree/root-of.ts` (`treeRootOf`), contribute it in `core.canvas.ts`, and add a line to core's README.
- [ ] **Step 3:** Write `src/canvas-ui/thumbnails/` and export `ElementThumbnails`, `elementThumbnailsOf`, `useElementThumbnail`, `ElementThumbnail` and the types.
- [ ] **Step 4:** Move catalog onto it (`PageThumbnail frameId={…}` becomes `ElementThumbnail id={…}`), delete the three catalog files and their types, and update catalog's README (thumbnails are `@canvas-ui`'s, drawn the same way).
- [ ] **Step 5:** Add `ElementThumbnail`, `useElementThumbnail` to the plugin API's `api.ui` `Pick`, and to `docs/plugins.md`.
- [ ] **Step 6: Verify**
      Run: `pnpm lint && pnpm typecheck && pnpm format && pnpm format:check && grep -rnE "FrameThumbnails|useFrameThumbnail|PageThumbnail|frameThumbnailsOf" src`
      Expected: the checks pass and grep prints nothing.

### Task 6: `AnchorPicker` to `@canvas-ui`

**Files:**

- Move: `design/modules/core/ui/scale-sidebar/anchor-picker.tsx` and `anchor-picker.types.ts` to `src/canvas-ui/components/anchor-picker.tsx` and `anchor-picker.types.ts`
- Modify: `core/ui/scale-sidebar/index.ts`, `scale-sidebar.tsx`, `src/canvas-ui/index.ts`, `src/canvas-ui/README.md`, `src/canvas/README.md` (it names `AnchorPicker`), core's README, plugin API, `docs/plugins.md`

**Interfaces:**

- Produces: `AnchorPicker(props: AnchorPickerProps)` from `@canvas-ui`, where `AnchorPickerProps = { value: ScaleAnchor; onChange: (anchor: ScaleAnchor) => void; label?: string }` (`label` is the radiogroup's aria-label, default `"Anchor"`; the scale sidebar passes `"Scale from"`).

- [ ] **Step 1:** `mv` both files, add `label`, export from `@canvas-ui`, update the scale sidebar's imports and drop `AnchorPicker` from its `index.ts`.
- [ ] **Step 2:** Update the READMEs and add it to the plugin API's `api.ui` `Pick` and `docs/plugins.md`.
- [ ] **Step 3: Verify**
      Run: `pnpm lint && pnpm typecheck && pnpm format && pnpm format:check && grep -rn "anchor-picker" src/products`
      Expected: the checks pass and grep prints nothing.

### Task 7: Modules' `ui/index.ts` (`FramePresetPicker`, `openVariablesWindow`)

**Files:**

- Frame: `mv frame/ui/frame-preset-menu.tsx frame/ui/frame-preset-picker.tsx` (and `.types.ts`), rename `FramePresetMenu` to `FramePresetPicker` and its props to `FramePresetPickerProps`; create `frame/ui/index.ts`; update `frame/ui/frame-section.tsx` and frame's README
- Catalog: `catalog/ui/brochure-tab/brochure-empty.tsx` keeps the two A4 buttons and adds a third, "Other size…", a `FramePresetPicker` whose `onPick` is `(preset) => addBlankPage(engine, preset.size, preset.label)`; update catalog's README
- Variables: `variables/ui/window/open-variables-window.ts` (new), `variables/ui/index.ts`, `variables/README.md`; `styleguide/ui/empty/styleguide-empty.tsx`

**Interfaces:**

- Produces:
  - `FramePresetPicker({ trigger, onPick })` from `../frame/ui`.
  - From `../variables/ui`: `openVariablesWindow(): void` (sets the store's `open` to `true`) and `useVariablesWindowOpen(): boolean`. `useVariablesWindowStore` is no longer exported from `variables/ui/index.ts`.
- **Ruling (spec says `openVariablesWindow(at)`):** there's no `at`, because no caller opens it anywhere but its default place. It can be added with the first caller that needs one.

- [ ] **Step 1:** Rename the frame menu, add `frame/ui/index.ts` (comment line + `export type *` of the props + `FramePresetPicker`), and update `frame-section.tsx` to import it from `./frame-preset-picker`.
- [ ] **Step 2:** Add "Other size…" to `BrochureEmpty`, as an outline `Button size="sm"` trigger in full width under the two A4 buttons, importing `FramePresetPicker` from `../../../frame/ui`.
- [ ] **Step 3:** Write `openVariablesWindow`/`useVariablesWindowOpen`, export them, stop exporting the store, and move `styleguide-empty.tsx` onto them.
- [ ] **Step 4:** Update the frame, catalog, variables and styleguide READMEs.
- [ ] **Step 5: Verify**
      Run: `pnpm lint && pnpm typecheck && pnpm format && pnpm format:check && grep -rnE "FramePresetMenu|useVariablesWindowStore" src --include='*.tsx' | grep -v "modules/variables/"`
      Expected: the checks pass and grep prints nothing.

### Task 8: Modules import shadcn primitives and `cn` from the kit (checked)

**Files:**

- Modify: `src/shared/ui/kit/primitives.ts` (add the `context-menu` primitives, which a module uses and the kit lacks); every file under `src/products/*/modules/` importing `@shared/ui/components/ui/*` or `@shared/ui/lib/utils` (139 files today)
- Modify: `scripts/check-modules.mjs` (new rule `kit`), `docs/modules.md` (Import rules, "Checked by"), `src/shared/ui/kit/README.md`
- Temp: one rewrite script in `$CLAUDE_JOB_DIR/tmp` (or `/tmp/claude-1000/` if unset), deleted afterwards

**Interfaces:**

- Produces: check-modules rule `kit`: "a module imports `@shared/ui/components/ui/…` or `@shared/ui/lib/utils`; import it from `@shared/ui/kit`". It applies to files inside `src/products/*/modules/`.

- [ ] **Step 1:** Add `export * from "@shared/ui/components/ui/context-menu"` (or the named list, following `primitives.ts`'s style) to `primitives.ts`.
- [ ] **Step 2:** Write the rewrite script. It must use the TypeScript compiler API, as the barrel script in phase 5 did, and do the following for each module file:
  - Collect the named imports (value and `type`) from those specifiers.
  - Check each name is exported by `@shared/ui/kit`, by resolving the kit's export list with the compiler. **Stop with an error naming file and name if one isn't.**
  - Remove those import declarations and merge the names into the file's existing `@shared/ui/kit` import, or add one.

  Run it, then `pnpm format`.

- [ ] **Step 3:** Add the `kit` rule to `check-modules.mjs` (header comment line and the check in the imports loop, reported as `kit: import "<name>" from "@shared/ui/kit", not "<spec>"`), and document it in `docs/modules.md`. Probe it: add a deep `@shared/ui/lib/utils` import to one module file, see `pnpm lint` report it, then revert.
- [ ] **Step 4:** Delete the temp script.
- [ ] **Step 5: Verify**
      Run: `pnpm lint && pnpm typecheck && pnpm format:check && grep -rlE "@shared/ui/(components/ui/|lib/utils)" src/products/*/modules | wc -l`
      Expected: the checks pass and the count is `0`.

### Task 9: Close the phase (docs)

**Files:**

- Modify: `CLAUDE.md` (Transition: delete the 5a row), the spec (§12 phase 5: "5a done 2026-10-26"; §16.4: mention the `ColorPopover` and `ModeToolbarEntry` names and the two rulings), `docs/modules.md` (if it lists the shared pieces), memory `module-conventions.md` (5a done, 5b next)

- [ ] **Step 1:** Make those edits.
- [ ] **Step 2: Verify**
      Run: `pnpm lint && pnpm typecheck && pnpm format && pnpm format:check`
      Expected: all pass.
- [ ] **Step 3:** Give the user a commit message (title `refactor: shared pieces live once, in the kit and @canvas-ui`, then a bullet per task and the `Co-Authored-By` line). After they commit, delete this plan.
