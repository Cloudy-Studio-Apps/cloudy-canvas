# Cross-platform Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Cloudy Canvas behave correctly on Windows, macOS and Linux by fixing every bug found in the cross-platform audit of 2026-11-01.

**Architecture:** Most fixes are small and local. The one shared piece is `useRowDrag` in `canvas-ui`, a pointer-based list drag that replaces HTML5 drag and drop. A new CI workflow compiles Rust and the frontend on all three systems, because the Linux dev machines can't check Windows or macOS code.

**Tech Stack:** Tauri 2.12, wry 0.57, React 19, TypeScript strict, PixiJS 8, Vite 8, GitHub Actions.

**Spec:** There is no separate spec. The audit findings are summarized in the table below, and this plan is the spec.

| #   | Bug                                                             | Systems             | Task |
| --- | --------------------------------------------------------------- | ------------------- | ---- |
| 1   | HTML5 drag to reorder and the color wizard's drop zone are dead | Windows, macOS      | 7-10 |
| 2   | Cmd+Q skips the unsaved-changes dialog and the quit tasks       | macOS               | 5    |
| 3   | F5, Ctrl+R, right-click Refresh reload the app and lose work    | Windows             | 3    |
| 4   | Dropped files land at half their position                       | macOS, HiDPI Linux  | 4    |
| 5   | Trackpad pinch doesn't zoom                                     | macOS               | 6    |
| 6   | `[` and `]` shortcuts dead on Spanish keyboards                 | Windows, macOS      | 2    |
| 7   | Unlock All never fires                                          | macOS               | 2    |
| 8   | Canvas keeps the old pixel ratio after a monitor change         | Windows, macOS      | 11   |
| 9   | Saves fail when another program briefly holds the file          | Windows             | 12   |
| 10  | `.cboard` and `.cdesign` have no mime type in the `.deb`        | Debian, Ubuntu      | 13   |
| 11  | Reserved names break folder exports                             | Windows             | 14   |
| 12  | Non-Unicode launch arguments crash the app                      | Linux, Windows      | 14   |
| 13  | Hidden `.SF NS` style fonts in the picker                       | macOS               | 14   |
| 14  | Real macOS floor is undocumented                                | macOS 12            | 13   |
| 15  | Files using a missing font reflow silently                      | All                 | 16   |
| 16  | Spanish Macs may open in English                                | macOS               | 13   |
| 17  | No recovery after a WebGL context loss                          | All, mostly Windows | 15   |

**Decisions that differ from the audit:**

- **Dot-folder scope: won't fix.** Setting `requireLiteralLeadingDot: false` would let the webview read `~/.ssh` and every other hidden folder, because the fs scope is `**`. Keeping those folders protected is worth more than reopening a recent file from a hidden folder. A file picked in a dialog still works.
- **WebView2 settings:** handled in the frontend, not with `SetAreBrowserAcceleratorKeysEnabled`. Tauri doesn't expose that setting, changing it from Rust adds a Windows-only dependency, and it may only apply on the next navigation.
- **Blank windows on NVIDIA, Ctrl+click on Mac, D3D shaders:** not changed up front. Task 18 tests them and says what to do if a test fails. Forcing `WEBKIT_DISABLE_DMABUF_RENDERER` for every NVIDIA user would slow down machines that work today.

## Global Constraints

- Work on a branch named `fix/cross-platform`, created from `master`. Don't push until the user says so.
- Commit messages get **no** `Co-Authored-By: Claude` line (the user's standing rule).
- Follow `CLAUDE.md`. In particular: every `interface` and `type` goes in a sibling `<file>.types.ts`; files stay near 200 lines; user-facing text goes through the folder's `t` with `en.json` and `es.json`; no raw `<button>`/`<input>` outside the kit; semantic color tokens only; radii per the sharp-shape rule.
- **There is no test framework, so don't add one.** Each task's verification is `pnpm lint`, `pnpm typecheck` and `pnpm format:check`. Run them after every task. Expected: exit code 0 and no errors. Don't run `tauri dev`, cargo or builds locally. Rust is checked by the CI workflow from Task 1.
- Every user-facing task adds its changelog lines, already given in the task, under `### Fixed` in `CHANGELOG.md` and `### Correcciones` in `CHANGELOG.es.md`, in the `Unreleased` / `Sin publicar` section. `pnpm lint` keeps the two files in step.
- When a task changes how something works, update the `README.md` named in that task in the same commit.
- Delete this plan file in the last commit, at the end of Task 18 (the repo deletes finished plans).

## Review Focus

These are the failure modes no task's verification exercises, because lint and typecheck can't see them. Task 18 lists each as a manual check.

1. **A drag that ends on a click target.** Dragging a row and releasing over the row's own button mustn't trigger the button or select the row. The hook's click swallow covers this.
2. **A reserved key in a text field on Windows.** Ctrl+R or Ctrl+F while typing in a name field mustn't reload, and must leave the typed text alone.
3. **Ctrl+G and Ctrl+Shift+R on the canvas on Windows.** The app binds these and the browser reserves them. They must run the app's command and not the browser's.
4. **Cmd+Q with no file open, or with the dialog already open.** The first quits at once. The second must not stack two dialogs.
5. **A file dropped outside the color wizard's zone while the wizard is open.** It must go to the canvas as before.

---

### Task 1: CI check on all three systems

Rust changes in later tasks can only be compiled on their own system, so this comes first.

**Files:**

- Create: `.github/workflows/check.yml`

- [ ] **Step 1: Create the workflow**

Triggers: `pull_request` and `workflow_dispatch`. One job with a `fail-fast: false` matrix of `windows-latest`, `macos-latest` and `ubuntu-22.04`. Copy these from `release.yml` as they are: the `Install Linux dependencies` step, `pnpm/action-setup@v4` with version 12, `actions/setup-node@v4` with `lts/*` and `cache: pnpm`, `dtolnay/rust-toolchain@stable`, and `swatinem/rust-cache@v2` with `workspaces: src-tauri -> target`.

Then run, in order:

```yaml
- run: pnpm install --frozen-lockfile
- run: pnpm lint
- run: pnpm typecheck
- run: pnpm exec vite build
- run: cargo check --locked --manifest-path src-tauri/Cargo.toml
```

`vite build` is there because `generate_context!` needs `dist/` to exist. `pnpm lint` on Windows also proves the scripts in `scripts/` work with backslash paths.

- [ ] **Step 2: Verify**

Run: `pnpm lint && pnpm typecheck && pnpm format:check`
Expected: exit code 0.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/check.yml
git commit -m "ci: check lint, types and Rust on Windows, macOS and Linux"
```

---

### Task 2: Shortcuts on non-US keyboards

**Files:**

- Modify: `src/shared/core/keyboard.ts`
- Modify: `src/canvas/input/base-keybindings.ts:41`

**Interfaces:**

- Produces: `isWindowsPlatform(): boolean`, exported from `@shared/core`. Tasks 3 and 4 use it.

- [ ] **Step 1: Add `isWindowsPlatform()` beside `isApplePlatform()`**

`typeof navigator !== "undefined" && /Win/.test(navigator.platform)`.

- [ ] **Step 2: Rewrite the modifier check in `matchesShortcut`**

The key and code checks stay. Replace the final `return`:

```ts
// AltGr types a character: Windows reports it as Ctrl+Alt, which is neither `mod` nor `alt` here.
const altGr = event.getModifierState("AltGraph");
const mod = !altGr && isModKey(event);
const alt = !altGr && event.altKey;
// macOS has no AltGr: `[` on a Spanish keyboard is Option plus a key, with `key` already "[".
const optionTyped = alt && !shortcut.alt && isApplePlatform() && isSymbolKey(shortcut.key);
return (
  mod === Boolean(shortcut.mod) &&
  event.shiftKey === Boolean(shortcut.shift) &&
  (alt === Boolean(shortcut.alt) || optionTyped)
);
```

Add a private `isSymbolKey(key: string | undefined): boolean`, true for one character that isn't a letter or digit (`/^[^\p{L}\p{N}]$/u`).

- [ ] **Step 3: Fix Unlock All**

In `base-keybindings.ts:41` use `{ code: "KeyL", mod: true, alt: true, shift: true, label: "L" }`. Option changes `event.key` on macOS, so Option shortcuts must use `code`.

- [ ] **Step 4: Check for other Option shortcuts that use `key`**

Run: `git grep -nE -B3 -A3 "alt: true" -- 'src/*.ts' | grep "key: \""`
Expected: no output. If a line appears, change it to `code` the same way.

- [ ] **Step 5: Add the changelog lines**

EN: `Keyboard shortcuts now work on keyboards where a key needs AltGr or Option, such as the layer order shortcuts [ and ] on Spanish keyboards on Windows and macOS. Unlock All also works on macOS.`

ES: `Los atajos de teclado ahora funcionan en teclados donde una tecla necesita AltGr u Opción, como los atajos de orden de capas [ y ] en teclados españoles en Windows y macOS. Desbloquear todo también funciona en macOS.`

- [ ] **Step 6: Verify**

Run: `pnpm lint && pnpm typecheck && pnpm format:check`
Expected: exit code 0.

- [ ] **Step 7: Commit**

```bash
git add src/shared/core/keyboard.ts src/canvas/input/base-keybindings.ts CHANGELOG.md CHANGELOG.es.md
git commit -m "fix(keyboard): shortcuts typed with AltGr or Option"
```

---

### Task 3: Browser behavior in the desktop app

**Files:**

- Modify: `src/shared/core/keyboard.ts`
- Create: `src/platform/browser-guard.ts`
- Modify: `src/platform/index.ts`
- Modify: `src/app/main.tsx`
- Modify: `src/canvas/input/keyboard-input.ts:9`
- Modify: `src/shared/ui/hooks/use-hotkey.ts:17`
- Modify: `src/app/README.md`

**Interfaces:**

- Consumes: `isWindowsPlatform()` (Task 2).
- Produces: `isBrowserReservedKey(event: KeyboardEvent): boolean` from `@shared/core`; `installBrowserGuard(): void` from `@platform`.

- [ ] **Step 1: Add `isBrowserReservedKey` to `keyboard.ts`**

True for `F3`, `F5` and `F7` with any modifiers; Ctrl with `f`, `g`, `j`, `p` or `r`; Ctrl+Shift with `g`, `p` or `r`. Compare `event.key.toLowerCase()`. Use `event.ctrlKey`, not `isModKey`: this list is WebView2's.

- [ ] **Step 2: Create `installBrowserGuard()` in `browser-guard.ts`**

Do nothing unless `isTauri()` and `import.meta.env.PROD`, so dev builds keep reload and Inspect. Install two listeners:

- `window` `contextmenu` in the **bubble** phase: `preventDefault()` unless `isTypingTarget(event.target)`, so text fields keep cut, copy and paste. It must be bubble: Radix's `composeEventHandlers` skips its own handler when `defaultPrevented` is already true, so a capture listener would break every Radix context menu.
- `window` `keydown` in the **capture** phase, only when `isWindowsPlatform()`: `preventDefault()` when `isBrowserReservedKey(event)`. Don't call `stopPropagation`.

- [ ] **Step 3: Call it in `main.tsx`**

Call `installBrowserGuard()` right after the imports, before `loadPlugins()`. Export it from `src/platform/index.ts`. `import "./i18n-boot"` stays the first import.

- [ ] **Step 4: Let the app's own shortcuts through**

The guard prevents the default before these listeners run, and both return early on `defaultPrevented`. That would kill Ctrl+G (group) and Ctrl+Shift+R (paste to replace). In `keyboard-input.ts:9` and `use-hotkey.ts:17`, replace `event.defaultPrevented` with:

```ts
event.defaultPrevented && !isBrowserReservedKey(event);
```

- [ ] **Step 5: Document it**

Add a `Browser behavior` paragraph to `src/app/README.md`: what is blocked, that it's production only, and why `contextmenu` is bubble and `keydown` is capture.

- [ ] **Step 6: Add the changelog lines**

EN: `On Windows, F5, Ctrl+R and the right-click Refresh no longer reload the app and lose unsaved changes, and print or find shortcuts no longer open browser windows.`

ES: `En Windows, F5, Ctrl+R y Actualizar en el menú contextual ya no recargan la app ni pierden los cambios sin guardar, y los atajos de imprimir o buscar ya no abren ventanas del navegador.`

- [ ] **Step 7: Verify**

Run: `pnpm lint && pnpm typecheck && pnpm format:check`
Expected: exit code 0.

- [ ] **Step 8: Commit**

```bash
git add src/shared/core/keyboard.ts src/platform/browser-guard.ts src/platform/index.ts src/app/main.tsx src/canvas/input/keyboard-input.ts src/shared/ui/hooks/use-hotkey.ts src/app/README.md CHANGELOG.md CHANGELOG.es.md
git commit -m "fix(windows): keep browser shortcuts and menus out of the app"
```

---

### Task 4: Dropped file position

**Files:**

- Modify: `src/platform/tauri-file-open-requests.ts:25`

**Interfaces:**

- Consumes: `isWindowsPlatform()` (Task 2).

- [ ] **Step 1: Convert only on Windows**

wry 0.57 reports physical pixels on Windows and logical points on macOS and GTK, and Tauri labels them all physical. Add a private `dropPoint(position: PhysicalPosition): { x: number; y: number }`: on Windows return `position.toLogical(window.devicePixelRatio)`, elsewhere return `{ x: position.x, y: position.y }`. Replace the comment at line 24 with one that states this.

- [ ] **Step 2: Add the changelog lines**

EN: `Files dropped on the canvas now land where you drop them on Retina Macs and high-resolution Linux screens.`

ES: `Los archivos que sueltas en el lienzo ahora caen donde los sueltas en Mac con pantalla Retina y en pantallas Linux de alta resolución.`

- [ ] **Step 3: Verify**

Run: `pnpm lint && pnpm typecheck && pnpm format:check`
Expected: exit code 0.

- [ ] **Step 4: Commit**

```bash
git add src/platform/tauri-file-open-requests.ts CHANGELOG.md CHANGELOG.es.md
git commit -m "fix(drop): place dropped files correctly on macOS and HiDPI Linux"
```

---

### Task 5: Cmd+Q asks before quitting

**Files:**

- Create: `src-tauri/src/mac_menu.rs`
- Modify: `src-tauri/src/lib.rs`
- Modify: `src/canvas-ui/file/README.md`

- [ ] **Step 1: Create `mac_menu.rs`**

Module doc: the default Quit item calls `terminate:`, which never emits `CloseRequested`, so it would skip the close guard and quit tasks.

`pub fn setup(app: &App) -> tauri::Result<()>`:

1. `let menu = Menu::default(app.handle())?;`
2. Take `menu.items()?` index 0 with `.as_submenu()`. That is the app submenu; Quit is its last item.
3. Read the last item's text through `.as_predefined_menuitem()` and `.text()?`, then `submenu.remove(...)`.
4. Append `MenuItem::with_id(app, QUIT_ID, text, true, Some("CmdOrCtrl+Q"))?`, with `const QUIT_ID: &str = "cloudy-quit"`.
5. `app.set_menu(menu)?;`
6. `app.on_menu_event(...)`: when `event.id() == QUIT_ID`, call `close()` on the `"main"` window, or `app.exit(0)` if there is no window. `close()` emits `CloseRequested`; `destroy()` wouldn't.

- [ ] **Step 2: Register it in `lib.rs`**

Add `#[cfg(target_os = "macos")] mod mac_menu;` and, in `.setup`, after `app_links::setup(app)?;`:

```rust
#[cfg(target_os = "macos")]
mac_menu::setup(app)?;
```

- [ ] **Step 3: Document it, with the known limit**

In the `Quitting asks` bullet of `src/canvas-ui/file/README.md`, add that Cmd+Q closes the window through `mac_menu.rs`, and that Quit from the Dock menu and logging out still end the app directly. Only autosave covers those.

- [ ] **Step 4: Add the changelog lines**

EN: `On macOS, Cmd+Q now asks about unsaved changes and finishes saving before the app quits.`

ES: `En macOS, Cmd+Q ahora pregunta por los cambios sin guardar y termina de guardar antes de cerrar la app.`

- [ ] **Step 5: Verify**

Run: `pnpm lint && pnpm typecheck && pnpm format:check`
Expected: exit code 0. Rust is compiled by `check.yml` when the branch runs (Task 18).

- [ ] **Step 6: Commit**

```bash
git add src-tauri/src/mac_menu.rs src-tauri/src/lib.rs src/canvas-ui/file/README.md CHANGELOG.md CHANGELOG.es.md
git commit -m "fix(macos): Cmd+Q goes through the close guard"
```

---

### Task 6: Pinch zoom on macOS

**Files:**

- Create: `src/canvas/input/pinch-input.ts`
- Create: `src/canvas/input/pinch-input.types.ts`
- Modify: `src/canvas/input/index.ts`
- Modify: `src/canvas/input/wheel-input.ts:13`
- Modify: `src/canvas/canvas-engine.ts:1534`

**Interfaces:**

- Produces: `bindPinch(disposables: Disposables, canvas: HTMLCanvasElement, camera: Camera, onChange: () => void): void`.

- [ ] **Step 1: Declare the event type**

In `pinch-input.types.ts`: `export interface WebKitGestureEvent extends UIEvent { scale: number; clientX: number; clientY: number; }`.

- [ ] **Step 2: Implement `bindPinch`**

WebKit on macOS sends `gesturestart`, `gesturechange` and `gestureend`, never Ctrl+wheel. On `gesturestart`: `preventDefault()` and remember `camera.zoom`. On `gesturechange`: `preventDefault()`, take the point relative to `canvas.getBoundingClientRect()`, call `camera.zoomAt(point, startZoom * event.scale)`, then `onChange()`. On `gestureend`: `preventDefault()`. Listen with `{ passive: false }`. Other webviews never fire these, so no platform check is needed.

- [ ] **Step 3: Wire it**

Export it from `src/canvas/input/index.ts` and call it beside `bindWheel` at `canvas-engine.ts:1534`. Fix the comment at `wheel-input.ts:13`: pinch arrives this way in Chromium only.

- [ ] **Step 4: Add the changelog lines**

EN: `Pinching on a Mac trackpad now zooms the canvas at the pointer.`

ES: `Pellizcar en el trackpad de un Mac ahora hace zoom en el lienzo donde está el puntero.`

- [ ] **Step 5: Verify**

Run: `pnpm lint && pnpm typecheck && pnpm format:check`
Expected: exit code 0.

- [ ] **Step 6: Commit**

```bash
git add src/canvas/input CHANGELOG.md CHANGELOG.es.md src/canvas/canvas-engine.ts
git commit -m "fix(macos): trackpad pinch zooms the canvas"
```

---

### Task 7: The `useRowDrag` hook

**Why not just turn off `dragDropEnabled`:** dropping files on the canvas needs Tauri's event, which gives real paths. The rows move to pointer events instead, as the layers list already does.

**Files:**

- Create in `src/canvas-ui/components/row-drag/`: `use-row-drag.ts`, `row-drag.types.ts`, `row-drop-index.ts`, `row-drop-line.ts`, `edge-scroll.ts`, `drag-ghost.tsx`, `drag-ghost.types.ts`, `index.ts`
- Modify: `src/canvas-ui/index.ts`
- Modify: `src/canvas-ui/README.md`
- Modify: `src/products/design/modules/layers/ui/drag/use-layer-drag.ts`
- Modify: `src/products/design/modules/layers/ui/drag/drop-indicator.tsx`

**Interfaces (all exported from `@canvas-ui`):**

```ts
export type RowDropSide = "before" | "after";

export interface RowDragState {
  id: string;
  /** The target under the pointer that accepts this row; `null` for none. */
  overId: string | null;
  side: RowDropSide;
  pointer: { x: number; y: number };
}

export interface RowDragOptions {
  onDrop: (id: string, overId: string, side: RowDropSide) => void;
  /** Whether `overId` takes this row. Everything but the row itself when left out. */
  canDrop?: (id: string, overId: string) => boolean;
}

export interface RowDrag {
  drag: RowDragState | null;
  /** Spread on what starts the drag: a row, or its grip. */
  grabProps: (
    id: string,
    enabled?: boolean,
  ) => { onPointerDown: (event: PointerEvent<HTMLElement>) => void };
  /** Spread on what takes a drop: a row, or a whole group. */
  dropProps: (id: string) => { "data-row-drop": string; "data-row-drop-scope": string };
}

export function useRowDrag(options: RowDragOptions): RowDrag;
export function rowDropIndex(from: number, over: number, side: RowDropSide): number;
export function rowDropLine(side: RowDropSide | null): string;
export function edgeScrollStep(pointerY: number, box: DOMRect): number;
export function DragGhost(props: { label: string; pointer: { x: number; y: number } }): JSX.Element;
```

- [ ] **Step 1: Create `row-drop-index.ts`**

`const to = over + (side === "after" ? 1 : 0); return from < to ? to - 1 : to;`. This is the "slot shifts once it leaves its place" arithmetic now repeated in `pages-section.tsx`, `brochure-tab.tsx` and `styleguide-tab.tsx`.

- [ ] **Step 2: Create `row-drop-line.ts`**

Returns the indicator classes, using the `before:`/`after:` strings from `page-row.tsx` (`absolute`, `inset-x-0`, `h-0.5`, `bg-primary`), or `""` for `null`. The row needs `relative`. Write the strings out in full so Tailwind sees them.

- [ ] **Step 3: Create `edge-scroll.ts`**

Move `SCROLL_EDGE = 28`, `SCROLL_SPEED = 14` and the step arithmetic out of `autoScroll` in `use-layer-drag.ts`. Return the pixels to scroll this frame, `0` when not near an edge.

- [ ] **Step 4: Create `DragGhost`**

Move the portal block from `drop-indicator.tsx` here unchanged, then use `DragGhost` in `drop-indicator.tsx` and call `edgeScrollStep` in `use-layer-drag.ts`. The layers list keeps working as before.

- [ ] **Step 5: Implement `useRowDrag`**

Same lifecycle as `press` in `use-layer-drag.ts`, including the latest-options ref and the stop-on-unmount effect. `scope` is `useId()`.

- **Press:** ignore when `enabled === false`, when `event.button !== 0`, or when the target is inside `button, a, input, textarea, select, [role='checkbox'], [role='menuitem'], [data-row-drag-ignore]`. `ListRow` is a `div` with `role="button"`, so it isn't matched, and that's what we want.
- **Start:** past `MOVE_THRESHOLD_PX`. Then set `document.documentElement.style.userSelect = "none"` and `.cursor = "grabbing"`, restored on stop, and start the edge-scroll frame loop.
- **Hit test on each move and scroll:** take `document.elementFromPoint(x, y)`, then walk outward through `closest("[data-row-drop]")`, keeping only elements whose `data-row-drop-scope` equals `scope`. Take the first whose id isn't the dragged row and passes `canDrop`. The outward walk is what lets a mode dropped on a group's locked first row fall through to the group. `side` comes from the upper or lower half of that element.
- **Edge scroll:** the scroller is the pressed element's nearest ancestor with `overflow-y` of `auto` or `scroll`. Skip scrolling if there is none.
- **End:** `pointerup` calls `onDrop` when `overId` is set. `pointercancel` and Escape (capture, `stopPropagation`) cancel. After any real drag, swallow the next `click` on `window` exactly as `finish` does in `use-layer-drag.ts`.

- [ ] **Step 6: Export and document**

Add the `export type *` and value lines to `src/canvas-ui/index.ts`. Add `useRowDrag` to the components list in `src/canvas-ui/README.md`, with one line saying list reordering uses it and never HTML5 `draggable`, because Tauri's file-drop handler blocks HTML5 drags on Windows and macOS.

- [ ] **Step 7: Verify**

Run: `pnpm lint && pnpm typecheck && pnpm format:check`
Expected: exit code 0.

- [ ] **Step 8: Commit**

```bash
git add src/canvas-ui src/products/design/modules/layers/ui/drag
git commit -m "feat(canvas-ui): pointer-based row drag for lists"
```

---

### Task 8: Pages, brochure pages and style guide categories

**Files:**

- Modify: `src/products/design/modules/pages/ui/page-row.tsx`, `page-row.types.ts`, `pages-section.tsx`
- Modify: `src/products/design/modules/catalog/ui/brochure-tab/brochure-page-row.tsx`, `brochure-page-row.types.ts`, `brochure-tab.tsx`
- Modify: `src/products/design/modules/styleguide/ui/tab/category-row.tsx`, `tab.types.ts`, `styleguide-tab.tsx`

**Interfaces:**

- Consumes: `useRowDrag`, `RowDrag`, `rowDropIndex`, `rowDropLine`, `DragGhost` (Task 7).

Each list follows the same steps. In all three, the parent owns `useRowDrag` and passes `rowDrag: RowDrag` to each row in place of `position` and `onDropPage` / `onDropCategory`.

- [ ] **Step 1: Pages**

In `pages-section.tsx`, `onDrop(id, overId, side)` finds both indexes in `pages` and calls `engine.service(DESIGN_PAGES).reorder(id, rowDropIndex(from, over, side))`. In `page-row.tsx`, remove the `PAGE_DRAG` constant, the `drop` state and all `draggable`/`onDrag*`/`onDrop` props; spread `rowDrag.grabProps(page.id, !renaming)` and `rowDrag.dropProps(page.id)` on the `li`; and use `rowDropLine(overId === page.id ? side : null)`. Render `DragGhost` in `pages-section.tsx` with the dragged page's name.

- [ ] **Step 2: Brochure pages**

Same again. In `brochure-tab.tsx`, `onDrop` calls `brochure?.move(id, rowDropIndex(from, over, side))`, with indexes from `pages` by `slot.id`. Props go on the inner `div`, not the `li`, so the options list under a selected page isn't a drop target. The ghost shows `page.frame.name`.

- [ ] **Step 3: Style guide categories**

Same again. In `styleguide-tab.tsx`, `onDrop` removes `id` from `ids` and inserts it at `rowDropIndex(from, over, side)`, then calls `styleguide.setOrder(ids)`. The ghost shows `entry.category.label`.

- [ ] **Step 4: Confirm nothing is left in these modules**

Run: `git grep -nE "draggable|onDragStart|dataTransfer" -- src/products/design/modules/pages src/products/design/modules/catalog src/products/design/modules/styleguide`
Expected: only `draggable={false}` on images, if anything.

- [ ] **Step 5: Add the changelog lines**

EN: `Reordering pages, brochure pages and style guide categories by dragging now works on Windows and macOS, and long lists scroll while you drag.`

ES: `Reordenar páginas, páginas de folleto y categorías de la guía de estilo arrastrándolas ahora funciona en Windows y macOS, y las listas largas se desplazan mientras arrastras.`

- [ ] **Step 6: Verify**

Run: `pnpm lint && pnpm typecheck && pnpm format:check`
Expected: exit code 0.

- [ ] **Step 7: Commit**

```bash
git add src/products/design/modules/pages src/products/design/modules/catalog src/products/design/modules/styleguide CHANGELOG.md CHANGELOG.es.md
git commit -m "fix(design): reorder pages, brochure pages and categories on every system"
```

---

### Task 9: Effects and variable modes

**Files:**

- Modify: `src/products/design/modules/effects/ui/effect-row.tsx`, `effect-stack-editor.tsx`, `effects-ui.types.ts`
- Modify in `src/products/design/modules/variables/ui/window/inspector/`: `mode-row.tsx`, `mode-group-card.tsx`, `modes-inspector.tsx`, `inspector.types.ts`

**Interfaces:**

- Consumes: Task 7's exports.
- Changes: `ModeMoves` loses `drag` and `setDrag` and gains `rowDrag: RowDrag`. `ModeDrag` is deleted. `move` and `moveToNewGroup` stay.

- [ ] **Step 1: Effects**

In `effect-stack-editor.tsx`, replace the `moving` state and `finishMove` with `useRowDrag`. Rows are shown topmost first, so work in display indexes and convert back:

```ts
const from = effects.length - 1 - fromShown;
const to = effects.length - 1 - rowDropIndex(fromShown, overShown, side);
```

Call `onChange` with the same splice and `movedTo(from, to)` as `finishMove` does now, and skip it when `from === to`. In `effect-row.tsx`, replace the `onDragStart`/`onDragOver`/`onDragEnd` props with `rowDrag: RowDrag`: spread `grabProps(effect.id)` on the grip span and `dropProps(effect.id)` on the root, add `relative` and `rowDropLine`, and read `dragging` from `rowDrag.drag?.id === effect.id`. Render `DragGhost` in the editor with the effect's label.

- [ ] **Step 2: Modes**

Target ids: a mode uses its own id; a group uses `` `axis:${axis.id}` ``.

In `modes-inspector.tsx`, create the `useRowDrag` with:

- `canDrop(id, overId)`: for a group, true when it isn't the mode's current group. For a mode, true when it isn't its group's first mode.
- `onDrop(id, overId)`: a group calls `move(id, axisId)`; a mode calls `move(id, axisOfMode, overId)`.

In `mode-row.tsx`, spread `grabProps(mode.id, !first)` on the grip and `dropProps(mode.id)` on the root. `over` becomes `rowDrag.drag?.overId === mode.id`. Keep the top-border indicator, since a mode always goes before the row it's dropped on. In `mode-group-card.tsx`, spread `dropProps(`axis:${axis.id}`)` on the root and derive `over` the same way. Render `DragGhost` with the mode's name. Remove the `setData("text/plain", …)`.

- [ ] **Step 3: Confirm the audit's list is finished**

Run: `git grep -nE "draggable( |=\{[^f]|$)|onDragStart|setData\(" -- src`
Expected: no output.

- [ ] **Step 4: Add the changelog lines**

EN: `Reordering effects and moving variable modes between groups by dragging now works on Windows and macOS.`

ES: `Reordenar efectos y mover modos de variables entre grupos arrastrándolos ahora funciona en Windows y macOS.`

- [ ] **Step 5: Verify**

Run: `pnpm lint && pnpm typecheck && pnpm format:check`
Expected: exit code 0.

- [ ] **Step 6: Commit**

```bash
git add src/products/design/modules/effects src/products/design/modules/variables CHANGELOG.md CHANGELOG.es.md
git commit -m "fix(design): drag effects and variable modes on every system"
```

---

### Task 10: The color wizard's drop zone

Tauri takes file drops before the webview sees them, so `event.dataTransfer.files` is empty there. Only the app's drop target receives them.

**Files:**

- Create: `src/canvas-ui/use-file-drop-zone.ts`, `src/canvas-ui/use-file-drop-zone.types.ts`
- Modify: `src/canvas-ui/index.ts`
- Modify: `src/products/design/modules/color-wizard/ui/colors/image-source.tsx`

**Interfaces:**

- Consumes: `isWindowsPlatform`-corrected `drop.at` (Task 4); `useFileDropStore`; `useFileDragOver`.
- Produces: `useFileDropZone(zone: RefObject<HTMLElement | null>, onDrop: (file: DroppedFile) => void): void`, exported from `@canvas-ui`. Use the element type of `FileDrop["files"]` for `DroppedFile`.

- [ ] **Step 1: Implement `useFileDropZone`**

While mounted, wrap the store's target. Keep the previous target, and call `setTarget` with a function that calls `onDrop(drop.files[0])` when `drop.at` is inside `zone.current.getBoundingClientRect()`, and otherwise passes `drop` to the previous target. On unmount, restore the previous target only if the wrapper is still the current one, as `useCanvasFileDrop` checks. Keep `onDrop` in a latest-ref, so the effect runs once.

- [ ] **Step 2: Use it in `image-source.tsx`**

Add a `ref` to the zone `div`. Call `useFileDropZone` with a callback that reads the file and hands it to `takeImageFile`:

```ts
const type = imageTypeFromName(file.name) ?? "";
takeImageFile(new File([await file.read()], file.name, { type }));
```

Keep the existing HTML5 handlers, because `pnpm dev` and the future web build need them. Highlight the zone with `over || draggingFiles`, using `useFileDragOver()`. Report a failed read with `notifyError`.

- [ ] **Step 3: Add the changelog lines**

EN: `Dropping a picture on the color wizard now works in the desktop app.`

ES: `Soltar una imagen en el asistente de color ahora funciona en la app de escritorio.`

- [ ] **Step 4: Verify**

Run: `pnpm lint && pnpm typecheck && pnpm format:check`
Expected: exit code 0.

- [ ] **Step 5: Commit**

```bash
git add src/canvas-ui src/products/design/modules/color-wizard CHANGELOG.md CHANGELOG.es.md
git commit -m "fix(color-wizard): take dropped pictures in the desktop app"
```

---

### Task 11: Follow the screen's pixel ratio

**Files:**

- Create: `src/canvas/render/watch-pixel-ratio.ts`
- Modify: `src/canvas/render/renderer.ts:134`
- Modify: `src/canvas/render/layers/ruler-guide-layer.ts`, `size-label-layer.ts`, `snap-layer.ts`
- Modify: `src/canvas/canvas-engine.ts:1545`
- Modify: `src/canvas/render/README.md`

**Interfaces:**

- Produces: `watchPixelRatio(disposables: Disposables, onChange: (ratio: number) => void): void`; `Renderer.setPixelRatio(ratio: number): void`; `setResolution(ratio: number): void` on the three layers.

- [ ] **Step 1: Implement `watchPixelRatio`**

A media query only fires once, so re-arm it: `matchMedia(`(resolution: ${devicePixelRatio}dppx)`)`, on `change` call `onChange(window.devicePixelRatio)` and create a new query for the new ratio. Remove the live listener through `disposables`.

- [ ] **Step 2: Add `Renderer.setPixelRatio`**

Call `this.app.renderer.resize(this.app.screen.width, this.app.screen.height, ratio)`, then `setResolution(ratio)` on the ruler guide, size label and snap layers. `SnapLayer` must also use the ratio for labels created later, so store it there instead of reading `devicePixelRatio`. Then refresh world text with the same call the camera path uses to reach `ElementLayer.setTextZoom` (find it with `git grep -n setTextZoom`). `textResolution` already reads the live ratio.

- [ ] **Step 3: Wire it in the engine**

Beside the `ResizeObserver` at `canvas-engine.ts:1545`, call `watchPixelRatio(this.disposables, …)` with `renderer.setPixelRatio`, `this.frames.flush()` and `this.viewChanges.emit()`.

- [ ] **Step 4: Document and add the changelog lines**

Add one line to `src/canvas/render/README.md`.

EN: `The canvas stays sharp when you move the window to a screen with different scaling.`

ES: `El lienzo se mantiene nítido cuando mueves la ventana a una pantalla con otra escala.`

- [ ] **Step 5: Verify**

Run: `pnpm lint && pnpm typecheck && pnpm format:check`
Expected: exit code 0.

- [ ] **Step 6: Commit**

```bash
git add src/canvas CHANGELOG.md CHANGELOG.es.md
git commit -m "fix(render): follow the screen's pixel ratio"
```

---

### Task 12: Saves survive a briefly locked file

**Files:**

- Create: `src/platform/rename-with-retry.ts`
- Modify: `src/platform/tauri-storage.ts` (`writeAtomic`, `writeIndex`)

**Interfaces:**

- Produces: `renameWithRetry(from: string, to: string): Promise<void>`.

- [ ] **Step 1: Implement `renameWithRetry`**

Call `rename` from `@tauri-apps/plugin-fs`. On failure wait and try again: delays of 50, 100, 200 and 400 ms, so five attempts in 750 ms. After the last failure, `remove(from)` inside a `try` that ignores its own error, then rethrow the rename error. The original file is untouched in that case, and `.tmp` files don't pile up.

- [ ] **Step 2: Use it**

Replace `rename(...)` in `writeAtomic` and `writeIndex` with `renameWithRetry(...)`. `setAsideIndex` keeps plain `rename`. Update the `writeAtomic` comment.

- [ ] **Step 3: Add the changelog lines**

EN: `Saving no longer fails when antivirus or a sync app such as OneDrive briefly holds the file.`

ES: `Guardar ya no falla cuando un antivirus o una app de sincronización como OneDrive retiene el archivo un momento.`

- [ ] **Step 4: Verify**

Run: `pnpm lint && pnpm typecheck && pnpm format:check`
Expected: exit code 0.

- [ ] **Step 5: Commit**

```bash
git add src/platform/rename-with-retry.ts src/platform/tauri-storage.ts CHANGELOG.md CHANGELOG.es.md
git commit -m "fix(storage): retry the final rename of a save"
```

---

### Task 13: Packaging and config

**Files:**

- Modify: `src-tauri/tauri.conf.json`
- Create: `src-tauri/Info.plist`
- Modify: `README.md:45`

- [ ] **Step 1: Ship the mime types in the `.deb`**

The Tauri CLI doesn't write a shared-mime-info file (the string isn't in the 2.12.3 binary), so double-clicking a `.cboard` on Ubuntu has no type to match. Add under `bundle`:

```json
"linux": {
  "deb": {
    "files": { "/usr/share/mime/packages/cloudy-canvas.xml": "../packaging/arch/cloudy-canvas.xml" }
  }
}
```

- [ ] **Step 2: Declare the app's languages on macOS**

Create `src-tauri/Info.plist`, which Tauri merges into the bundle: a plist `dict` with `CFBundleLocalizations` set to an array of `en` and `es`. This is so `navigator.languages` isn't reduced to English in WKWebView. Task 18 confirms the effect.

- [ ] **Step 3: State the real macOS floor**

In the install table at `README.md:45`, change the requirement to `macOS 12+ (with Safari 16.4 or later installed)`. Vite 8's default target and the app's `OffscreenCanvas` use both need it. Leave `minimumSystemVersion` at `12.0`, because an updated Monterey qualifies.

- [ ] **Step 4: Add the changelog lines**

EN: `On Ubuntu and Debian, board and design files are now recognized and open in Cloudy Canvas with a double click. Macs set to Spanish now open the app in Spanish.`

ES: `En Ubuntu y Debian, los archivos de pizarra y diseño ahora se reconocen y se abren en Cloudy Canvas con doble clic. Los Mac en español ahora abren la app en español.`

- [ ] **Step 5: Verify**

Run: `pnpm lint && pnpm typecheck && pnpm format:check`
Expected: exit code 0.

- [ ] **Step 6: Commit**

```bash
git add src-tauri/tauri.conf.json src-tauri/Info.plist README.md CHANGELOG.md CHANGELOG.es.md
git commit -m "fix(packaging): deb mime types and macOS languages"
```

---

### Task 14: Small fixes

**Files:**

- Modify: `src/products/design/modules/layer-export/export-file-name.ts`
- Modify: `src-tauri/src/open_files.rs:27`
- Modify: `src/platform/fonts/installed-fonts.ts:14`

- [ ] **Step 1: Safer export names**

In `export-file-name.ts`, add control characters to the unsafe set: `/[\\/:*?"<>|\p{Cc}]/gu`. In `safeName`, also strip trailing dots after replacing. Add `const RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i`, and when the result matches, append `_`. Windows drops trailing dots and refuses the reserved names even with an extension.

- [ ] **Step 2: Don't crash on non-Unicode arguments**

In `open_files.rs:27`, use `std::env::args_os().map(|arg| arg.to_string_lossy().into_owned())`. `std::env::args()` panics on them.

- [ ] **Step 3: Hide system fonts**

In the loop in `installed-fonts.ts`, skip faces with `face.family.startsWith(".")`.

- [ ] **Step 4: Add the changelog lines**

EN: `Exporting layers named like Windows system files, such as CON, no longer fails, and the macOS font picker no longer lists hidden system fonts.`

ES: `Exportar capas con nombres de archivos del sistema de Windows, como CON, ya no falla, y el selector de fuentes de macOS ya no muestra fuentes ocultas del sistema.`

- [ ] **Step 5: Verify**

Run: `pnpm lint && pnpm typecheck && pnpm format:check`
Expected: exit code 0.

- [ ] **Step 6: Commit**

```bash
git add src/products/design/modules/layer-export/export-file-name.ts src-tauri/src/open_files.rs src/platform/fonts/installed-fonts.ts CHANGELOG.md CHANGELOG.es.md
git commit -m "fix: safer export names, launch arguments and font list"
```

---

### Task 15: Recover from a lost WebGL context

**Files:**

- Modify: `src/canvas/canvas-engine.ts`
- Modify: `src/canvas/render/README.md`

- [ ] **Step 1: Check what Pixi already restores**

On Linux, run `pnpm dev`, open a design and run this in the browser console:

```js
const gl = document.querySelector("canvas").getContext("webgl2");
const ext = gl.getExtension("WEBGL_lose_context");
ext.loseContext();
setTimeout(() => ext.restoreContext(), 1000);
```

Expected: without a fix, the canvas stays blank until the next change, because rendering is on demand. This is a browser check, so it needs the user's approval under `CLAUDE.md`. Ask once when starting this task.

- [ ] **Step 2: Redraw on restore**

In the engine's start method, listen for `webglcontextrestored` on the canvas through `this.disposables`. Call `this.refreshElements` with every element id from `this.scene.elements`, then `this.requestRender()`.

- [ ] **Step 3: Confirm with Step 1's snippet**

Expected: the canvas redraws, with images, within a second of the restore. If images or effects stay blank, report it and stop. Don't rebuild the renderer in this task.

- [ ] **Step 4: Document and add the changelog lines**

Add one line to `src/canvas/render/README.md`.

EN: `The canvas now comes back by itself after the graphics driver resets, for example after waking from sleep.`

ES: `El lienzo ahora se recupera solo cuando se reinicia el controlador gráfico, por ejemplo al despertar de la suspensión.`

- [ ] **Step 5: Verify**

Run: `pnpm lint && pnpm typecheck && pnpm format:check`
Expected: exit code 0.

- [ ] **Step 6: Commit**

```bash
git add src/canvas CHANGELOG.md CHANGELOG.es.md
git commit -m "fix(render): redraw after a WebGL context loss"
```

---

### Task 16: Warn about missing fonts

**Files:**

- Create: `src/canvas-ui/use-missing-fonts-notice.ts`
- Modify: `src/canvas-ui/index.ts`
- Modify: `src/canvas-ui/locales/en.json`, `src/canvas-ui/locales/es.json`
- Modify: `src/products/design/ui/design-editor.tsx:26`
- Modify: `src/products/board/ui/board-editor.tsx:21`

**Interfaces:**

- Produces: `useMissingFontsNotice<O extends object>(engine: CanvasEngine<O> | null): void`.

- [ ] **Step 1: Implement the hook**

Run once per engine. Collect family names from `engine.kinds.kindOf(el).fonts(el)` over `engine.doc.all()`. A family is missing when it's in none of these:

- `await fontLibrary.families()`
- the families in `document.fonts`, without quotes (the app's bundled fonts live here)
- the generic names `serif`, `sans-serif`, `monospace`, `system-ui`, `cursive`, `fantasy`

Do nothing at all when the library has no `source === "google"` family or no `source === "installed"` family. That means the list failed to load, or this is the browser, and every font would look missing. Don't use `document.fonts.check`: it returns `true` for fonts that don't exist.

- [ ] **Step 2: Show one toast**

Use `toast({ title, description })` with the first three names, then `+N` for the rest. Add these under a `fonts.missing` group in `canvas-ui/locales`:

| Key                         | en                                                         | es                                                                                 |
| --------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `fonts.missing.title`       | `Some fonts aren't on this computer`                       | `Faltan fuentes en este equipo`                                                    |
| `fonts.missing.description` | `{names} will show in a fallback font, so text may shift.` | `{names} se mostrarán con una fuente alternativa, así que el texto puede moverse.` |

- [ ] **Step 3: Mount it in both editors**

Call it right after `useCanvasFileDrop(engine)` in `design-editor.tsx` and `board-editor.tsx`.

- [ ] **Step 4: Add the changelog lines**

This one goes under `### Improved` / `### Mejoras`.

EN: `Opening a file that uses a font this computer doesn't have now tells you which fonts are missing, so text that shifts doesn't come as a surprise.`

ES: `Al abrir un archivo con una fuente que este equipo no tiene, ahora se te indica qué fuentes faltan, para que el texto que se mueva no te tome por sorpresa.`

- [ ] **Step 5: Verify**

Run: `pnpm lint && pnpm typecheck && pnpm format:check`
Expected: exit code 0.

- [ ] **Step 6: Commit**

```bash
git add src/canvas-ui src/products/design/ui/design-editor.tsx src/products/board/ui/board-editor.tsx CHANGELOG.md CHANGELOG.es.md
git commit -m "feat(fonts): warn when a file's fonts aren't installed"
```

---

### Task 17: Final pass

- [ ] **Step 1: Run the whole check**

Run: `pnpm lint && pnpm typecheck && pnpm format:check`
Expected: exit code 0.

- [ ] **Step 2: Review the branch**

Run: `git log --oneline master..HEAD` and confirm there is one commit per task. Run `git diff master --stat` and confirm no ER or print files were touched by accident.

---

### Task 18: Check on real machines (needs the user)

An agent can't do this task. It needs the branch pushed, and a Windows PC and a Mac. The work went straight to `master`, as the user asked. Push `master`, run `Check` from the Actions tab, and build a test release before tagging a version.

- [ ] **Step 1: CI**

`Check` passes on all three systems. This is the first compile of `mac_menu.rs` and the `open_files.rs` change. Fix anything it reports on the branch.

- [ ] **Step 2: Windows**

- Drag to reorder: pages, brochure pages, categories, effects, modes (including onto a group, and onto a group's first mode).
- Release a dragged row over its own button: nothing is clicked.
- F5, Ctrl+R and Ctrl+P do nothing, on the canvas and in a name field.
- Ctrl+G groups and Ctrl+Shift+R pastes to replace.
- Right-click on a panel shows nothing; on the canvas shows the app's menu; in a text field shows Cut/Copy/Paste.
- With a Spanish keyboard, `[` and `]` change layer order, and typing `@` in a text field works.
- Move the window between a 150% and a 100% monitor: the canvas stays sharp.
- Add a shader effect on Intel graphics and check the window doesn't freeze. If it does, open an issue with the shader; don't change anything here.

- [ ] **Step 3: macOS**

- Everything in Step 2's drag list.
- Cmd+Q with a file open asks; with no file open it quits; pressed twice it shows one dialog.
- Pinch zooms at the pointer.
- Drop an image on a Retina screen: it lands under the pointer.
- With a Spanish keyboard, `[` and `]` work, and Unlock All works.
- Set the system to Spanish and confirm the app opens in Spanish. If it doesn't, add `es.lproj` and `en.lproj` folders through `bundle.resources`.
- Ctrl+click on the canvas opens the menu. If it starts a drag instead, handle `event.ctrlKey` on Apple platforms in `handleDown` at `src/canvas/input/pointer-input.ts`, by returning early without starting a gesture.

- [ ] **Step 4: Linux**

- Install the `.deb` on Ubuntu and double-click a `.cboard`: it opens.
- Run the AppImage on Fedora and on NVIDIA + Wayland. If the window is blank, set `WEBKIT_DISABLE_DMABUF_RENDERER=1` when the variable is unset and `/sys/module/nvidia` exists, at the start of `run()` in `lib.rs`, under `#[cfg(target_os = "linux")]`.
- Drop an image on the color wizard's zone and elsewhere: the zone takes it, and elsewhere it goes on the canvas.
- Open a design using a font this computer lacks: the toast names it.
- In `pnpm dev`, run Task 15's console snippet: the canvas redraws, with images, after the restore. This check wasn't run, because the Chrome extension wasn't connected.

- [ ] **Step 5: Delete this plan and commit**

Once every check above passes:

```bash
git rm docs/superpowers/plans/2026-11-01-cross-platform-fixes.md
git commit -m "docs: remove the finished cross-platform plan"
```
