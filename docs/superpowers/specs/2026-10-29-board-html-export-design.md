# Board HTML export (read-only viewer) — design

Date: 2026-10-29. Status: implemented (plan: `docs/superpowers/plans/2026-10-29-board-html-export.md`).

## Intent

A board (usually a database schema or an ER diagram) is finished work that has to reach a final
client or a reviewer who won't install Cloudy Canvas. Today the only way is a PDF/PNG, which goes
blurry when they zoom into column names. The board needs an **HTML export**: one self-contained
`.html` file they double-click and get the board exactly as it looks in the app, sharp at any zoom,
which they can pan and zoom around and read, but never change.

It is a **viewer, not an editor**. The file has nowhere to save anything, so nothing in it edits:
what the reviewer can do is look, and flip view toggles (show a code panel, show all code, …) that
live only in memory while the page is open.

## Goals

- Export the **whole board** from the existing Export dialog as a new format, **HTML**.
- One `.html` file, **fully self-contained and offline**: the viewer runtime, the board's content,
  its images, the fonts it uses, and the code of every plugin whose elements it shows. Several MB is
  fine (the user accepted > 1 MB).
- Renders **exactly like the app** at any zoom: the real canvas engine (PixiJS) and the board's real
  element kinds and links draw it, not pre-rendered pictures.
- **Light theme only** for now.
- Pan and zoom like the app (drag, wheel, trackpad pinch); opens **fitted to the whole board**.
- **Plugin elements render too**, the same as built-in ones (see Plugins).
- A **module pattern**: every module (built-in or plugin) that wants to appear in the viewer plugs
  into it through an extension point; the export pattern generalizes to future export formats.

## Non-goals (for now)

- The "made with Cloudy Canvas, you can check…" popup (next step, after the viewer).
- Dark mode or a theme switch.
- Exporting only the selection.
- The Design product (`.cdesign`). The pattern should not block it later, but only the board gets
  HTML now.
- Live/collaborative viewing, comments, or anything that talks to a server.

## Anti-goals (a failure even if it technically works)

- Anything that looks editable: selection handles, forms, palettes, the ER mode, the Check diagram,
  context menus, text that can be typed into. A control that does nothing is worse than no control.
- A file that needs the network, an install, or the app to open.
- Blurry text when zooming in on a schema.
- Plugin content silently missing from the export.
- Hard-coding db/er knowledge into the viewer itself instead of the modules contributing it.

## What the reviewer sees (approved mockup: option A + brand bar)

Mockups: `.superpowers/brainstorm/227045-1793269251/content/viewer-layout-v4.html`.

- The canvas **fills the window** (light board background with its dots, as in the app).
- **Top-left floating label**: the seal logo, "Cloudy Canvas", `/`, the board's title, "· view only",
  then the **toggle buttons modules contribute**. Built-ins: **Schema** (only when the board has
  database tables/enums) and **ER** (only when it has ER diagrams). Every panel is **hidden by
  default**; a button shows as pressed while its panel is open.
- **Clicking the title** opens a popup under it, like the app's document info popover
  (`DocumentInfoPopover`), but **plain text only**: the title and the description, no inputs and no
  file path. Without a description it shows only the title. Click outside or Esc closes it.
- **Bottom-left floating zoom bar**: −, the zoom percentage, +, Fit.
- **Right side panel** (one at a time, like the app's side panels), opened by a toggle button or by
  clicking one of the module's elements:
  - **Schema**: clicking a table or enum shows its DBML (read-only, monospaced, Copy button);
    **All code** switches to the whole schema's DBML.
  - **ER**: clicking an ER shape shows its diagram's ER text; **All code** shows every diagram's text.
  - ✕ closes it.
- Clicking empty canvas does nothing (no selection). Hover cursors only where a click does something.
- Styling follows the app's design system: semantic tokens from the light theme, sharp radii (4 px
  controls, 6 px panels), no pills.

## How it works (decided)

### Two halves: export time and view time

Everything the viewer needs is decided **when exporting**, in the app, and **written into the file as
data**. The viewer only draws that data and reacts to toggles; it never computes schema text, never
reads a document from disk and never writes anything.

1. **Export time (in the app):** collect the board's elements (the same content a `.cboard` holds,
   for the whole board), the images and fonts they use, each viewer part's data, and the plugins
   whose elements are on the board. Pour it all into the viewer template and save one `.html` with
   `exportFile` (`@platform`).
2. **View time (in the file):** the viewer runtime builds a read-only canvas engine with the board's
   kinds and links (built-in modules + the embedded plugins), loads the content, fits it, and mounts
   the brand bar, zoom bar and the parts' buttons and panels.

### The viewer module and its point

- A new board **feature module** (e.g. `modules/viewer/`, name left to the builder) owns the HTML
  export: the export-time collector, the viewer runtime's entry, and the extension point.
- It defines a point, roughly `boardViewerParts` (`<name>.points.ts`), keyed by part id. A **viewer
  part** has two halves, linked by the part id:
  - **`collect(ctx)`** — export time: returns the JSON-safe data the part needs (db: DBML per
    table/enum id + the whole schema; er: ER text per diagram id + all). Returns `null` when the
    board has nothing for it (then its button doesn't appear).
  - **view half** — view time: its toolbar button(s) (icon, label), the panel it shows, which element
    kinds open it on click and what they show, and any in-memory toggles of its own. It gets only its
    own collected data and a small read-only viewer context (open/close my panel, the clicked element,
    copy to clipboard, camera "fit to element" if wanted).
- The view half lives in its **own file per module** (a `<name>.viewer.ts(x)`, the same idea as
  `.mcp.ts`), so the viewer bundle pulls in only those files + the engine + the modules' engine side,
  never the editor UI. `docs/modules.md` gains this file in Module anatomy, and the import rules
  say what a `.viewer` file may import.
- Built-in parts: **db** (Schema) and **er** (ER), each contributed by its own module.

### Export formats as a list, for the future

- The Export dialog's formats stop being a hard-coded list for products that contribute their own:
  a format is an entry (id, name, extension, label, whether area/background/scale options apply,
  and how to produce the file). The board contributes **HTML** (whole board only: the dialog hides
  the selection/background/scale options for it). PNG/JPG/PDF/CSV keep working unchanged for both
  products.
- A future format follows the same shape: it is one entry, and if modules need to add to it, it owns
  its own point the way HTML owns `boardViewerParts`.

### The viewer runtime bundle

- A separate build entry produces the viewer runtime as **one inlined script** (engine, PixiJS,
  board kinds and links, the parts' view halves, the viewer chrome). It ships inside the app as an
  asset; the export reads it and writes it into the `.html`. The `.html` also carries the data as an
  inline JSON block.
- The viewer runs **read-only**: no tools besides pan/zoom, no selection, no edits, no undo, no
  keyboard shortcuts besides zoom/fit.
- Its UI text is light and uses `t` like the rest of the app, in the language the app was in when
  exporting (the export writes the language into the file).

### Plugins

- **A plugin opts in.** A plugin is exported only when it **configures its export**: its module
  contributes to the viewer (at least by declaring that its element kinds draw in the viewer; a
  viewer part is optional). Then the file embeds its code (`main.js`, plus the plugins it
  `require`s, if they opted in too) and the viewer activates it the same way the app does, with a
  viewer-flavoured `api`. A plugin's embed features (web embeds it draws) are supported in the
  viewer when it configured its export.
- **A plugin that didn't configure its export** (or is disabled, missing, or fails to activate in the
  viewer): each of its elements exports as a **placeholder of the element's exact size and place**,
  in the style of the design's image placeholder (the question-mark seal, `placeholderSvg` in
  `products/design/modules/image/placeholder/`), with the **plugin's name** on it. That picture is
  moved to a shared place both products can use instead of being copied. Its code is not embedded.
  The rest of the board always renders (never a blank page). The export dialog says once how many
  elements will show as placeholders, naming the plugins.
- A plugin's viewer part works like a built-in one (its own button/panel).
- In the viewer, only what draws and what views matters: element kinds, links, stickers, embeds and
  viewer parts. Editor contributions (tools, panels, MCP tools, menus) are ignored there.
- **`docs/plugins.md` gets a short, plain section, "In the HTML export"**: by default your elements
  export as a placeholder with your plugin's name; to have them drawn for real, configure your
  export (a minimal example); your plugin's code is then copied into the file and runs in the
  reviewer's browser; nothing edits there, so only drawing, embeds and your viewer part matter.

## Constraints

- Project rules in `CLAUDE.md`: modules/tiers/points, layering (`.viewer` files and the runtime don't
  import editor UI), types in `.types.ts`, small files, i18n (en + es) for every user-facing string,
  semantic tokens, sharp radii, `notifyError` on export failure, a bilingual changelog entry (New).
- Works offline from a local file (`file://`) in current Chrome, Edge, Firefox and Safari: WebGL
  must be available; if it isn't, the page says so plainly instead of staying blank.
- Verification is `pnpm lint`, `pnpm typecheck`, `pnpm format:check` only.
- READMEs of every folder touched are updated in the same change; `docs/modules.md` (the `.viewer`
  file) and `docs/plugins.md` (the plain section above).

## Calls made while writing this (not discussed; check them)

- **Plugin code in someone else's browser:** the file runs an opted-in plugin's code on the
  reviewer's machine. It's code the author already trusted and the plugin chose to export, so no
  extra prompt; the plugins doc says it plainly. (Agreed.)
- **Hyperlinks and web embeds:** a link on an element opens in a new tab on click (looking, not
  editing). A web embed shows what the app shows when it can't load (its card/placeholder), since
  the file is offline-first. (Agreed.)
- **Title and description (decided):** they come from the board's own document info (the title
  and description every board already has, edited in `DocumentInfoPopover`, `canvas-ui/file/`), so
  nothing new is configured. The default file name is the title; the title shows in the brand label
  and the page's `<title>`; the description goes in the page's meta description too. (Agreed.)
- **Images (decided):** embedded as base64, **resized to the size they're placed at** on the board,
  never their original 4K, and **compressed** (JPEG/WebP; PNG only when the picture has
  transparency). My call: "placed size" is at 2× pixels so they aren't soft on high-density
  screens, and never more than the original.

## Left to the builder

- Names (module, point, files), the exact viewer context API and the part type's shape.
- How the runtime bundle is built (a second Vite entry, rolldown like `scripts/plugin-kit/`, …) and
  how the app gets the bundle at export time.
- How images and fonts are embedded (data URLs, only the ones used, their sizes).
- The viewer-flavoured plugin `api`: what a plugin that reaches for editor-only groups gets
  (e.g. stubs) as long as the rule "drawing works, editor parts are ignored, failure is a placeholder"
  holds.
- Whether the viewer reuses `CanvasEngine` with a read-only switch or a slimmer host over the same
  scene/renderer, as long as rendering is identical to the app.
- The panel's code view: plain `<pre>` or a light highlighter from the existing source editor's
  language definitions.
