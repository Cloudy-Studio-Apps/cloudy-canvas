# Variables, styles and the Design System view

Status: design, awaiting approval. Date: 2026-10-24.

## Intent

Designers and devs keep rebuilding the same "style guide" boards by hand: color ramps, swatch
grids with hex codes, "Aa" type specimens, spacing rulers. Cloudy Canvas should hold a file's
design decisions as **variables and styles** (Figma's model, made more robust) that layers use
**by reference**, and should **generate the design system's documentation for you** from them, kept
up to date as values change, and convertible into ordinary editable layers when you want to
design around it.

The point of the whole system is the reference: a converted swatch, a button's fill, a frame's
padding all stay linked to `brand/primary`, so changing the variable changes all of them, and a
dev can see the token name, not just `#4F46E5`.

Components (buttons, badges, inputs) are **out of scope** here; they're a later project that will
build on these variables. Every structure below must leave room for them (a "Components" category
in the Design System view, component properties bound to boolean/string variables).

## Goals

1. Variables (color, number, string, boolean) in collections with modes, aliases, scopes, groups,
   descriptions and per-platform code names, bindable to nearly every design property.
2. Styles (paint, text, effect, stroke) as composite looks, whose fields may themselves be variables.
3. A **Variables & Styles panel** in the design's right sidebar when nothing is selected, with groups
   as accordions, plus a wide table editor for collections × modes.
4. A **Design System view** (a mode) that renders the whole system from templates, category by
   category and group by group, with a template picker per category/group, export per section or
   of the whole system as PDF.
5. A **live design-system element** placeable on any design page, rendering a category or group
   with a template, updating itself, and **Convert to design** into editable layers that keep their
   variable links.
6. The extras: ramp / type scale / spacing scale generators, WCAG contrast checks, usage tools
   (count, select users, replace, unused, detach), token import/export (another `.cdesign`, W3C
   Design Tokens JSON, Tokens Studio JSON, CSS / Tailwind / SCSS / Swift / Kotlin), Figma import of
   variables and styles, agent tools, math expressions (last).
7. **Board:** color variables only, where they're really useful (see Board).

## Non-goals

- Components, variants, instances, component properties (later project).
- Shared live libraries across files. Tokens live inside the file; reuse is by import, which keeps
  ids so re-importing updates (a step toward libraries later).
- A Dev Mode / inspect panel. Code names are stored now so a later Dev Mode can show them.
- Layout grids and grid styles (no layout grids exist yet).
- Prototype variables (actions that set variables at runtime).

## Anti-goals (would make it a failure even if it works)

- Bound values that drift: a layer showing one color while its variable says another, after undo,
  remote edits, paste, import or a mode change.
- A generated design system that looks different from what "Convert to design" produces.
- Changing one variable in a large file causing a visible stall (it must touch only the layers
  bound to it).
- Hard-coded variable types or templates: templates and categories are extension points, as the
  rest of the app is (plugins can add templates).
- Rounded "pill" UI in the panels (the app's sharp style applies; the _generated documentation_
  may use rounded shapes because templates are user content).

## Constraints

- Layering rules of `CLAUDE.md`: the token model, resolution and formats are plain TS in
  `canvas/tokens/` (shared by both products, no React); products bind their own fields; UI in
  `canvas-ui` (shared pieces) and the products' `ui/` and modules.
- Content lives only in the Yjs doc; edits through `CanvasDocument`; undoable; live sessions and
  agents' workspaces must work with no extra code (they will, if tokens are in the doc and edits
  go through the document like everything else).
- Small single-purpose files, types in `.types.ts`, modules with one register file.
- Verification is `pnpm lint`, `pnpm typecheck`, `pnpm format:check`.

---

## Decisions

Marked **(user)** when the user decided, **(my call)** otherwise.

### Where tokens live — (my call)

A new `"tokens"` Y.Map in `CanvasDocument` (next to `"shapes"`, `"assets"`, `"meta"`), tracked by
the undo history like `"meta"` (`DocumentHistory` tracks it; actor documents too), synced in live
sessions, read-only with the document. API in `canvas/tokens/` as a service-like facade
(`DOCUMENT_TOKENS`, a `defineService`, observing through a `DocumentFeed`): collections, modes,
variables, styles, groups, with typed edits (one undo step each when called from UI).

Why not element records (like pages)? Tokens must be shared by both products and have no place
on a canvas; a dedicated map keeps `doc.all()` and the scene free of them.

### How a layer uses a variable — bound values are cached in the fields (my call)

Each element gets an optional `bindings: Record<string, string>`: a **field path** →
variable id (or style id, see Styles), e.g. `"fills.0.color"`, `"cornerRadius"`,
`"layout.padding.top"`, `"text"`, `"effects.2.color"`. The element's ordinary fields keep holding
the **resolved value**, so drawing, hit tests, exports, auto layout, agents and older code read
fields exactly as today.

A **token sync** keeps them true:

- `syncTokens(doc, kinds, change)` (`canvas/tokens/`), called first in each product's `afterEdit`
  (the design then runs auto layout, because a bound size or padding changes layout). It re-resolves
  bindings of elements whose bindings or mode context changed, and of every element bound to a
  variable (or an alias chain reaching one) that changed. An index `token id → bound element ids`
  (built lazily, kept with the feed) makes this proportional to what's bound.
- Token edits therefore update layers **in the same undo step** as the variable change. Undo and
  redo and remote updates need nothing (they replay both).
- Kinds declare what can be bound: `kind.bindable(el)` → `BindableField[]` (`path`, variable
  `type`, the `scopes` it accepts, a label) and apply values through `kind.bindPatch(el, path,
value)` (so a text re-lays itself out, a stroke weight updates `strokeWeights`, a ramp-bound size
  goes through `kind.resize`). A base implementation in `DesignNodeKind` covers the shared node
  fields.
- **The detach rule (my call):** at the end of an edit, for every bound field that the edit
  changed, the sync compares the new value with the freshly resolved one. Equal (the variable or a
  mode changed, or the sync itself wrote it) → kept. Different → **the binding is removed** and the
  written value stays. So anything that writes a bound field detaches it: drag-resizing a bound
  width, auto layout fill/hug resizing it, a text's `autoResize` changing a bound size, the Scale
  tool scaling a bound radius / stroke weight / font size, agents' `update_nodes` (their reply says
  which bindings were detached). Figma behaves the same for resizes. In the panel, a bound field
  can't be typed into: it shows the variable chip, and the user detaches first (chip menu →
  Detach) — so a panel edit never detaches by surprise.
- **Paint opacity (my call):** a color variable carries alpha. A paint bound to it gets `color`
  from the RGB and `opacity` from the alpha; both are part of the one binding (`fills.N.color`),
  so editing the paint's opacity by hand detaches it, per the rule above.
- **Paths with indexes (my call):** paints and effects have no ids, so paths like `fills.0.color`
  must be rewritten when a stack is reordered, added to or removed from. Every paint/effect stack
  edit goes through helpers that remap the element's binding paths (reorder in the panel, the
  picker, agents, flips, copy properties). Bindings to a removed paint are dropped.
- A deleted variable that's still in use asks first ("Used by 14 layers": Delete and detach /
  Replace with… / Cancel). Detached layers keep the last resolved value.

### Modes and where they apply — (my call, following Figma)

- A collection has 1+ modes (the first is the default). Every variable has a value per mode of its
  collection (a raw value or an alias).
- **Design:** pages and container nodes (frames, sections, groups) may set
  `variableModes: Record<collectionId, modeId>`; a layer reads the nearest ancestor's choice per
  collection, else the page's, else the default. Changing a frame's mode re-syncs its subtree.
  The Appearance section gets a "Modes" row (per collection used inside, with "Auto (inherit)").
- **Board:** one choice per collection for the whole board (in the tokens map), picked in the
  board's colors panel.

### Aliases, groups, scopes, code names — (user: "all of it")

- Alias: a mode value may be `{ alias: variableId }`; resolution follows the chain, per the
  referencing layer's mode context in each collection; cycles are refused when written.
- Groups are slash paths in names (`brand/primary/500`); renaming a group renames every path under
  it; groups show as **accordions** everywhere (user). Collections are the top level.
- Scopes: which bindable scopes a variable is offered in (Figma's: all fills, frame fill, shape
  fill, text fill, stroke, effect color; corner radius, width/height, gap, padding, stroke weight,
  opacity, font size, line height, letter spacing, font weight, effect values; font family, font
  style, text content; visibility…). Default: all of its type.
- Each variable: `description`, `codeSyntax` (`web`, `ios`, `android`, free text with a default
  derived from the path), `hiddenFromSystem` (not shown in the Design System view or the pickers'
  default list).

### Styles — (user: all, including the stroke style extra)

A style is a named, grouped, described composite, stored in the tokens map:

| Style    | Holds                                                                                                           | Applies to                                       |
| -------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Paint    | a `Paint[]` stack (solid, gradient, image, blend modes); paint colors and gradient-stop colors may be variables | fills or strokes (`bindings["fills"] = styleId`) |
| Text     | family, style/weight, size, line height, letter spacing, decoration, case later; each may be a variable         | a whole text, or a run (rich text ranges)        |
| Effect   | a `NodeEffect[]` stack; colors and numbers may be variables                                                     | a node's effects                                 |
| Stroke ★ | weight (+ per side), align, dashes, cap, join, miter                                                            | a node's stroke settings (not its paints)        |

A style binding is resolved by the same sync (a style's own variable fields are resolved in the
**layer's** mode context, so a "Shadow / elevated" style can be darker in Dark mode). Styles carry
no modes of their own.

### Variables per product — the full list (user asked for it)

**Variable types:** `color` (`#rrggbbaa`), `number`, `string`, `boolean`. ★ Recommended number
"units" as metadata for docs and export only: `px`, `%`, `ms` later, unitless.

**Design — bindable fields**

| Type    | Fields                                                                                                                                                                                                                                                                                                                                                                                             |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Color   | solid fills and strokes (each paint's color, and its opacity follows the alpha), **gradient stop colors**, text color (whole text and runs), drop/inner shadow color, glass tint/noise colors where an effect has a color, image placeholder color                                                                                                                                                 |
| Number  | width, height, min/max width/height (`sizeLimits`), corner radius, stroke weight and each side's weight, opacity (layer and paint), auto layout gap, line gap, padding per side, font size, line height, letter spacing, font weight, shadow x / y / blur / spread, layer blur and background blur radius, polygon and star point count, star inner radius, rotation ★ (Figma doesn't; cheap here) |
| String  | text content (★ with a "Language" collection's modes this gives translated mock-ups), font family, font style                                                                                                                                                                                                                                                                                      |
| Boolean | visible, clip content, ★ `layoutAbsolute`, ★ mask inverted                                                                                                                                                                                                                                                                                                                                         |

**Design — styles:** paint, text, effect, stroke.

**Board — bindable fields (colors only, user)**

Only where a brand color is genuinely useful; the rest of the board keeps its fixed palettes:

| Element                              | Field                                      |
| ------------------------------------ | ------------------------------------------ |
| Sticky                               | `color`                                    |
| Geo shape                            | `fill`, `stroke`, text color if it has one |
| Text                                 | `color`                                    |
| Marker stroke (pen, not highlighter) | `color`                                    |
| Connector                            | `color`                                    |
| Section                              | `color`                                    |
| Table                                | header tint `color` and cell `fills`       |

Not on the board: number/string/boolean variables, styles, modes per element, the Design System
view, ER/DB elements (their look is the notation's). The board gets its **document colors**: a
"Document colors" row (accordion by group) at the top of every `ColorPalette` on the board, a small
colors manager (add, rename, group, edit, alias, delete with usage), **Import colors from a design
file**, and a board-wide mode pick per collection. A color variable created on the board is a
normal variable of the same model, so DTCG export/import works the same.

---

## Design UI

### Variables & Styles panel (right sidebar, nothing selected) — (user)

Today the properties panel shows the Page section when nothing is selected. Below it come:

- **Variables**: collections as headers (with a mode switcher showing which mode the _page_ uses),
  then categories (Color, Number, String, Boolean), then group **accordions**; each row shows a
  preview (swatch, value, "Aa"), the name, and an alias chip when aliased. Click opens an inline
  editor popover (value per mode, alias picker, scopes, description, code syntax). Rows drag
  between groups. "+" menu: new variable, new group, new collection, and the generators.
- **Styles**: Paint / Text / Effect / Stroke, same accordion treatment.
- **Open table editor**: a wide floating panel over the canvas (Figma's variables modal): a
  collection's variables as rows, its modes as columns, inline editing, add/rename/duplicate/delete
  modes, multi-select rows to group, move, delete, set scopes.

### Binding in fields

Every bindable field in the design's properties panel (`PaintField`, `NodeNumberField`, the
typography fields, auto layout, effects editors, the visibility toggle…) gets a **bind button**
(a small hexagon/token icon on hover, as Figma's) opening a searchable variable picker filtered by
type and scope, grouped by collection and group. A bound field shows the variable's name as a chip
in place of the value; clicking the chip changes or detaches it. A mixed selection shows "Mixed".
The paint picker's Solid tab gets a "Variables" swatch list (and Paint styles), next to "On this
page" and "Recent". Styles apply from a style chip/button on Fills, Strokes, Typography and Effects
section headers.

### Design System view (a mode) — (user idea; how it's built is my call)

A new design module, `styleguide`, contributes a `CanvasMode` "Design system" to the mode switcher
(**always shown** (user), with an empty state that offers to create the first colors, run a
ramp generator or import tokens).

- **What's on screen:** a hidden, generated **system page** (a page record flagged `system: true`,
  not listed in the Pages section, never exported with "all pages") holding one **live
  design-system element per category**, stacked vertically with headings: a cover (file title and
  description), Colors, Typography, Spacing, Radius, Effects, Strokes, Paint styles, Opacity, Other
  (strings/booleans), and later Components. Each category element shows its groups as
  subsections. The mode switches to that page's scope; leaving switches back.
- **When the system page exists (my call):** it's created by the sync in the same undo step as the
  file's first variable or style (and its category elements as their first token appears), and
  kept up to date by the sync from then on. Entering the view never writes anything, so looking
  doesn't dirty the file, read-only viewers in a live session see the host's page, and guests
  don't write the shared doc by looking. A file with no tokens has no system page (the view shows
  the empty state). Undoing the first token's creation removes the page with it.
- **It's read-only content:** the mode isolates the category elements (`isolate`), allows only
  organizing commands (like Catalog's `commands`), and its tool is a select-only tool.
- **Left panel tab** (`leftTabs` with `modes: ["styleguide"]`): the categories, then their groups as
  accordions; click scrolls/zooms to it and selects it; checkboxes show/hide a category or group in
  the view; drag reorders categories.
- **Right sidebar** (`modeSidebars`): for the selected category or group, the **template picker**
  (thumbnails of each template rendered with the real tokens) and the template's options (columns,
  show hex / rgb / hsl / code name / description, swatch size, show all modes side by side,
  contrast badges on/off, label font). Choosing sets the **default template** for that category or
  group: category default → group override → element override (user).
- **Context menu:** Export this section (PNG, PDF, SVG later), Export whole system as PDF
  (`encodePdfPages`, one page per category, page size fitted to the content — my call), Add to page
  (places a live element of this section on a design page the user picks), Convert to design.

### The live design-system element — (user idea)

A design node kind `token-sheet` (`TokenSheetKind`, a `ChildHostKind`-like container: a frame
whose **children are generated**):

- Fields: `source` (`{ category, group? }`), `template` (id or `null` = the configured default),
  `templateOptions`, `modeView` (one mode, or all side by side), and a `generated: true` marker on
  its children.
- **Rendering = real layers.** A template is a function `(tokens, source, options, context) →
generated node specs` (frames with auto layout, rectangles, texts, ellipses). The sync
  regenerates the children whenever the tokens it shows, its source, template or options change,
  inside `afterEdit` (same undo step). The generated layers are **bound** to the variables they
  show (a swatch rectangle's fill bound to `brand/500`, its label text to the variable's name,
  values as text). Generated children are locked, not selectable on their own, and skipped by
  agents' edits.
- Placing it: a tool in the design toolbar ("Design system", in the `frames` menu or its own,
  shortcut chosen by the builder) — click to place, then the right sidebar shows the same template
  picker as the view, plus "Source" (category / group).
- **Convert to design** (button in its section, context menu, agent tool): the element becomes a
  normal frame; its generated children become normal, editable, unlocked layers **keeping their
  variable bindings** (user). Labels that showed a variable's _name_ become plain text (my call:
  a renamed variable doesn't rename converted labels; the builder may add a string-binding to
  names later). What you saw is exactly what you get, because it's the same tree.
- Because it's real layers, Catalog mode, exports, thumbnails, copy/paste and booleans just work.

### Templates (extension point) — (user idea; list is my call)

Point `styleguideTemplates` (keyed by id; `defineStyleguideTemplate({ id, category, label, icon,
options, build })`); built-ins are one file each. Categories are a point too
(`styleguideCategories`: id, label, which tokens it takes, order), so plugins can add both.

| Category                                       | Templates                                                                                                                                                                                                                                                                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Colors                                         | Ramp strip (joined shades, as the second screenshot) · Swatch grid (squares + name + hex) · Cards (rect + name, hex, rgb, code name, description) · Vertical list · Stripes (Adobe Color–style tall bands) · Circles · Pairs with contrast (on-color text sample and WCAG badge) · Mode columns (each mode side by side) |
| Typography (text styles, font variables)       | Specimen ("Aa" + family + weights) · Scale ladder (each style rendered with name and size / line height) · Paragraph sample · Table                                                                                                                                                                                      |
| Spacing (numbers scoped gap/padding)           | Bars ruler · Nested squares · Table                                                                                                                                                                                                                                                                                      |
| Radius                                         | Corner boxes · Table                                                                                                                                                                                                                                                                                                     |
| Strokes (stroke styles, stroke-weight numbers) | Line samples · Boxes                                                                                                                                                                                                                                                                                                     |
| Effects (effect styles)                        | Cards with the effect · Elevation ladder                                                                                                                                                                                                                                                                                 |
| Paint styles                                   | Swatches (gradients and images too) · Cards                                                                                                                                                                                                                                                                              |
| Opacity                                        | Checkerboard swatches · Table                                                                                                                                                                                                                                                                                            |
| Other (strings, booleans)                      | Table                                                                                                                                                                                                                                                                                                                    |
| Cover                                          | Title + description + date · Minimal                                                                                                                                                                                                                                                                                     |

---

## Extras (user: include all)

- **Ramp generator:** from a base color, generate 50→950 (count and naming configurable) in OKLab
  (`canvas/gradient` already has OKLab), stored as variables in a group with a `generator` record
  (`{ kind: "ramp", base: variableId, steps, curve }`) so editing the base regenerates the shades,
  unless the user "detaches" the generated group.
- **Type scale** (base size × ratio → `xs…6xl` text styles, line heights) and **spacing scale**
  (base × steps → numbers) generators, same `generator` record model.
- **Contrast:** WCAG 2 AA/AAA (and APCA as a later option) for declared pairs and automatic
  text-on-surface pairs; shown in the Colors "Pairs" template and as warnings in the panel.
- **Usage:** "used by N layers" per token (from the sync's index), Select all users (on the page,
  or on every page with a page switch), Replace with… (rebind every use), Find unused, Detach
  (bound → raw value) per field, per layer, or per token everywhere.
- **Import/export:**
  - From another `.cdesign`: pick the file (read without opening it as the editor), tick
    collections / styles / groups, copy in **keeping ids** so re-importing updates; same name with
    another id asks: keep both / replace / skip.
  - W3C Design Tokens (DTCG) JSON: import and export, modes as `$extensions` (format decided by the
    builder, documented).
  - Tokens Studio JSON: import.
  - Export only: CSS custom properties (modes as `[data-theme]` blocks / `prefers-color-scheme`),
    Tailwind v4 `@theme`, SCSS, Swift (SwiftUI `Color`/`CGFloat`), Kotlin (Compose).
  - Clipboard: copying bound layers carries the tokens they use (like assets), so pasting into
    another file brings or matches them by id.
- **Figma import:** `.fig` variables, collections, modes, aliases, `boundVariables` and shared
  styles become tokens and bindings (today `withFigStyles` flattens styles into values; it should
  bind instead when the style is imported). The builder must check the Kiwi schema for the
  variable node types; anything unmapped is counted in `ImportWarnings`.
- **Agent tools** (design, mirrored for board colors): `list_variables`, `get_variables`,
  `create_variables`, `update_variables`, `delete_variables`, `create_collection`, `set_modes`,
  `bind_variables` (layer ids + field paths), `unbind_variables`, `list_styles`, `create_styles`,
  `update_styles`, `apply_styles`, `generate_ramp`, `generate_scale`, `set_variable_mode` (frame/page),
  `export_tokens`, `import_tokens`, `get_design_system`, `set_system_template`, `add_system_element`,
  `convert_system_element`. Summaries (`summarizeElement`) report bindings by variable name.
- **Math expressions** (`{space/base} * 2`) — last phase.

---

## Phases (my call; each one ships usable)

1. **Token engine + design colors & numbers:** `canvas/tokens/` (map, model, aliases, modes,
   resolution, sync, index, undo, clipboard), design bindings for color and number fields, mode
   per page/frame, Variables panel + table editor, bind buttons, agent tools for variables.
2. **Strings, booleans and styles:** text, font, visibility bindings; paint, text (incl. runs),
   effect and stroke styles; style UI; agents.
3. **Design System view + live element:** `styleguide` module, system page, mode, templates and
   categories points, built-in templates, template picker, Add to page, Convert to design, exports.
4. **Extras:** generators, contrast, usage tools, detach-all.
5. **Import/export:** `.cdesign` import, DTCG, Tokens Studio, code exports, Figma import of
   variables and styles.
6. **Board colors:** board bindings, document colors in `ColorPalette`, colors manager, import
   from a design, board-wide mode, agent tools.
7. **Math expressions.**

`CLAUDE.md` gets a section per phase as it lands.

**Planning (my call):** the implementation plan details phase 1 down to files and steps, and
outlines phases 2–7; each later phase gets its own detailed plan when it starts, against the code
phase 1 actually produced.

## Left to the builder

- Exact file/folder layout inside `canvas/tokens/` and the modules, names of points and helpers.
- The DTCG mapping details for modes and styles.
- Template visuals (within the app's look for the panels; the generated content follows the
  tokens) and default template per category.
- Keyboard shortcut for the design-system element tool, if any.
- Whether the table editor is a floating panel or a dialog.
- Performance strategy details of the sync index, provided a variable edit touches only bound
  layers.
