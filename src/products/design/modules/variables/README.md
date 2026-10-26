# Variables, styles and the design system

This folder is the design's **variables** module. The feature itself spans several folders,
because the token engine is shared by both products. This guide covers all of it: what each
feature does, how it works, where its code is, and how to extend it.

The design that led to it is
`docs/superpowers/specs/2026-10-24-variables-design-system-design.md`, with one plan per phase in
`docs/superpowers/plans/2026-10-2*-variables-*.md`.

## Where the code lives

| Folder                                      | What's there                                                                                                                                             |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/canvas/tokens/`                        | The engine (plain TS, both products): records, the store, resolution, the sync, edits, generators, usage, deletion, the clipboard, expressions           |
| `src/canvas/tokens/exchange/`               | Import and export: picking, import plans, DTCG, Tokens Studio, code (CSS, Tailwind, SCSS, Swift, Kotlin)                                                 |
| `src/canvas/agent/tokens/`                  | What both products' agent tools share: reading references and values, describing variables                                                               |
| `src/canvas-ui/tokens/`                     | React pieces both products share: `VariablePicker`, `VariableChip`, `VariableValue`, `TokenSwatch`, `ImportConflicts`, `useDocumentTokens`               |
| `src/products/design/modules/variables/`    | This module: the design's sync context, the Variables and Styles sections, the Variables window, contrast, the type scale, import/export UI, agent tools |
| `src/products/design/modules/styleguide/`   | The Design system view (a mode) and live design-system elements                                                                                          |
| `src/products/board/modules/colors/`        | Board colors: the board's sync, the colors panel, color bars, its agent tools                                                                            |
| `src/products/design/figma/convert/tokens/` | Figma variables, styles and bindings to ours                                                                                                             |

## The model

Everything lives in the document's `"tokens"` Y.Map as `TokenRecord`s keyed by id
(`canvas/tokens/token.types.ts`). Like elements, tokens are undoable, sync in live sessions, are
read-only for viewers and can be edited by agents in their own workspaces, with no extra code.

- **Collections** (`CollectionRecord`) are folders of variables: Primitives, Semantic, Spacing.
- **Mode axes** (`ModeAxisRecord`) belong to the file, not to a collection. Examples: Theme
  (Light/Dark), Device (Mobile/Desktop). Axes combine (Theme × Brand). An axis's first mode is
  its base, and `current` is the mode the file shows.
- **Variables** (`VariableRecord`) have a `type` (`color`, `number`, `string`, `boolean`) and a
  `name` that is a slash path (`brand/primary/500`); the path's segments are its groups. Values:
  - `values.default` applies in every mode.
  - With `axisId`, `values[modeId]` overrides the default for that mode of that axis.
  - A value is raw (`{ color: "#3A83C9FF" }`, `{ number: 8 }`, …), an **alias** of another
    variable of the same type (`{ alias: id }`), or, for numbers, an **expression**
    (`{ expr: "{<id>} * 2" }`, see Expressions).
  - Other fields: `scopes` (where pickers offer it), `description`, `codeSyntax` (its name per
    platform), `hidden`, `contrastWith`.
- **Styles** (`StyleRecord`) are named composite looks: text, paint, effect and stroke. A style's
  `value` is plain JSON. Its `bindings` let parts of it follow variables.
- **Generators** (`GeneratorRecord` for color shades, `ScaleRecord` for number scales) keep the
  variables they made linked to a base.

`TokenStore.of(doc)` is the read model. It's cached per tokens version and offers sorted lists,
`find(ref)` (by id, `Collection/path` or a unique path) and `aliasDependents(id)`.
`DOCUMENT_TOKENS` (`DocumentTokens`, a service) is the only thing that edits tokens. Each call
is one undo step and throws a message people and agents can act on. It's a class chain, one
file each: `TokenEditsBase` → `ModeEdits` → `VariableEdits` → `DocumentTokens`.

### Resolving

`resolveVariable(store, id, modes)` (`resolve-token.ts`) gives a variable's value for a layer
whose modes are `modes` (axis id → mode id):

- Per axis: the mode picked in `modes`, else the axis's `current`, else its base (`modeFor`).
- Aliases are followed, each by its own axis.
- Expressions are worked out, each reference in the same modes.
- It returns `null` for a loop, a broken chain, a wrong type or a result that isn't a number. A
  bound layer then keeps what it shows.

## Bindings and the sync

A layer uses a variable through its `bindings`: a field path → a variable or style id
(`"fills.0.color"`, `"cornerRadius"`, `"layout.padding.top"`, `"textStyle"`). Its ordinary fields
keep the **resolved value**, so drawing, exports, auto layout and agents read fields as they
always did.

- **What can be bound:** each kind lists its fields in `kind.bindable(el)` (`BindableField`: path,
  type, scopes, label). It writes a value with `bindValues`/`bindPatch`, which kinds override
  where a field has consequences (a text lays out again, a size resizes).
- **The sync** (`syncTokens`, run in `afterEdit`) keeps fields true, inside the same undo step as
  the edit. It updates the elements the edit touched, those bound to a changed variable or style,
  to anything that aliases one or reads it in an expression, and those whose modes changed.
  `BindingIndex` makes that proportional to what's bound.
- **The detach rule:** writing a bound field with anything but its variable's value (a drag, the
  Scale tool, an agent's `update_nodes`) unlinks it. Values the sync writes never detach.
- **Modes per layer:** in a design, a layer reads the file's modes, then its page's
  `variableModes`, then each ancestor's, then its own (`DESIGN_TOKEN_CONTEXT`, in
  `core/tree/`). A board has one mode per axis for the whole board (`BOARD_TOKEN_CONTEXT`).
- **Stacks:** paint and effect stacks have no ids, so their edits remap binding paths
  (`stackBindingsPatch`).
- **Copy and paste:** Copy properties carries bindings. The clipboard carries the variables copied
  layers use, with what they alias or read.

## Features

### Variables panel and window (phases 1–2)

- **The Variables section** shows when nothing is selected. It has:
  - `GlobalModes`: one switch per axis with several modes.
  - "+": a new color or number variable.
  - Each collection's groups as rows that unfold to `VariableRow`s.
  - `VariableEditor` popovers: path, "Varies by", a value per mode (`ValueField`), scopes,
    description, code syntax, hidden.
- **The Variable modes section** (on containers and pages) picks a mode per axis or Auto.
- **The Variables window** (`ui/window/`, "Variables…" in the main menu) is a large overlay:
  - Collections on the side.
  - A board of color and number cards by group, with mode chips.
  - An inspector for the selected variable: values per mode, contrast, usage, advanced settings.
  - The palette and scale generators.
- **Binding fields:** `BindSlot`, `BindableNumberField`, `BindButton`, and `PaintField.bindPath`
  (`ui/components/panel/`) bind fields through `useFieldBinding`. A bound field shows a
  `VariableChip`; the hover hexagon opens the picker.
- **Value types:** strings drive texts' content, font family and face. Booleans drive
  visibility, clip content, ignore auto layout and mask invert.

### Styles (phase 2)

There are four types: text, paint, effect and stroke. Each is a `designStyleTypes` entry
(`ui/modules/style-types.ts`) with its preview, summary and editor.

- **Applying:** a layer applies a style at `textStyle`, `fills`/`strokes`, `effects` or
  `strokeStyle`; text ranges at `runs.textStyle.<id>`.
- **Variables inside:** a style's own parts can be bound to variables (`StyleBindingScope`).
  `resolveStyle` resolves them in each layer's modes.
- **UI:** the Styles section lists them. `StyleControl` and `StyleChip` sit in the Fills, Strokes,
  Effects and Typography headers.

### Design system view (phase 3, `../styleguide/`)

The file's variables and styles drawn as a style guide that stays up to date.

- **The system page:** a hidden page holds one sheet per category (colors, typography, spacing,
  …). Each sheet is built from a template as node specs and reconciled only when its content
  hash changes.
- **Live elements:** any frame with a `sheet` field shows a category or group the same way, on
  any page. **Convert to design** turns it into ordinary layers that keep their bindings.
- **The mode:** "Design system" isolates the sheets. Its sidebar picks templates and their
  options and exports PDFs.

### Generators, contrast and usage (phase 4)

- **Shades** (`shade-ramp.ts`): a base color becomes a 50–950 ramp in OKLab. It's kept linked:
  edit the base and the shades follow. A shade set by hand leaves its generator.
- **Number scales** (`number-scale.ts`, `generated-scale.ts`): a base and a ratio give steps
  named xs…3xl or numerically. They're live: every step is an expression of the base step
  (`round({space/md} * 1.5625)`), so editing `md` moves the whole scale, in every mode. A scale
  made from a number writes it into `md`, which then becomes its base; one made from a variable
  makes `md` an alias of it. A step set by hand leaves the scale; `md` stays its base. Scales
  from before become live when the file opens (`migrate-live-scales.ts`, `liveScaleRecords`):
  only the steps the scale still owns, with the same values.
- **Type scale** (`type-scale/`): a font-size scale plus a text style per step bound to it.
- **Contrast** (`contrast/`): declared text/surface pairs, plus fill pairs found in the file, are
  checked in every mode combination with WCAG grades.
- **Usage** (`token-usage.ts`, `ui/usage/`): who uses a variable or style. From there you can
  select those layers, replace the token everywhere (`replacePlan`), find unused tokens, or
  detach everywhere or from the selection.
- **Deleting** a used variable bakes its value into what used it: layers, styles, and variables
  that aliased it or read it in an expression.

### Import and export (phase 5, `canvas/tokens/exchange/`, `exchange/` here)

- **Import** from:
  - another `.cdesign` or `.cboard` (read without opening it, `readFileTokens`);
  - W3C Design Tokens (DTCG) JSON;
  - Tokens Studio JSON.
- **How importing works:** `planTokenImport` matches by id, then by name. A conflict is kept as
  both, replaced or skipped. Ids are kept, so importing the same source again updates it.
- **Export to:**
  - DTCG. Its `$extensions["app.cloudy-canvas"]` keeps everything DTCG has no place for, so
    reading it back is exact.
  - CSS (modes as `[data-<axis>]` blocks and `prefers-color-scheme`).
  - Tailwind v4 `@theme`, SCSS, Swift and Kotlin.
- **Formats are a point:** `tokenFormats` (`TokenFormat`: `write`, `read`, `detect`).
- **Figma import** (`figma/convert/tokens/`): variables with their modes, aliases, scopes, code
  syntax and expressions; shared text, color and effect styles; and layers' bindings to them.

### Board colors (phase 6, `src/products/board/modules/colors/`)

Boards bind colors only, to the same color variables:

- **Bindable:** stickies, shape fills and outlines, texts, pen strokes, connectors, sections, and
  table headers and cells. Cell bindings follow row and column edits.
- **Color bars:** every color bar offers the document's colors first. Picking a plain color
  unlinks.
- **The Board colors panel:** collections, colors and groups (create, rename, delete), "follow
  another color" (an alias), the board's mode per axis, import from a design or tokens file, and
  export as DTCG or CSS.

### Expressions (phase 7, `canvas/tokens/expression/`)

A number variable's value can be math over other number variables. For example,
`space/md = {space/base} * 2`: change `base` and every variable and layer built on it follows,
in each mode.

- **Syntax:**
  - Numbers, with an optional `px`, or `rem` (= 16).
  - `{references}`: a variable's path, or `Collection/path` when the path isn't unique.
  - `+ - * /`, parentheses and unary minus.
  - `min`, `max`, `round`, `floor`, `ceil`, `abs`, `clamp(x, lo, hi)`.
- **Stored by id:** an expression is stored with references by id (`{<id>} * 2`), so renaming a
  variable never breaks it. `formatExpression` shows it with names; `readExpression` turns typed
  names back into ids.
- **Same as aliases everywhere:** `valueRefs(value)` and `mapValueRefs(value, map)`
  (`value-refs.ts`) give an alias's target or an expression's references. Everything that
  follows aliases uses them: the dependents index (and so the sync), loop checks, usage,
  deletion, replace, the clipboard, picking for export, and import remapping.
- **Refused by `setValue`:** loops, references to non-number variables, and results that aren't
  numbers (a division by zero). A loop that arrives stored (a remote edit, an import) resolves to
  `null` without hanging.
- **Exchange:**
  - DTCG's `$value` is the result; the expression is kept in the extension.
  - DTCG and Tokens Studio math (`{spacing.base} * 2`) imports as expressions.
  - CSS writes `calc(var(--base) * 2)`. Rounding and opacities are written as values; the other
    code formats always write values.
  - Figma's arithmetic `EXPRESSION`s import as expressions.
- **The builder** (`ui/expression-builder/`, for people new to it): the Σ button on a number
  opens it. Pick what it starts from, then add steps, each an operator (+ − × ÷) and a variable
  picked from the list, a number, or a group (a part worked out first, in parentheses, with its
  own steps: `{a} * ({b} + {c})`), then rounding (exact, round, down, up) and limits (at least,
  at most). It shows the expression and its result as it's built, and Apply writes it as one
  undo step. Its model is pure (`formulaOf`, `formulaText`, `Formula` in
  `canvas/tokens/expression/`): steps apply left to right, written with the parentheses that
  keeps; an expression of another shape (typed by hand) shows as text, with Start over.
- **The text field** (`ExpressionInput`, for those who know the syntax): names typed in `{…}`,
  the result after `=` (or "Not applied" in red with the reason), a `{}` picker that puts a
  variable's name where the caret was, the builder's button, and "Use its value instead".
  Results elsewhere are marked ƒ.

## Agents

Each product's tools are files in its `agent/` folder.

- **Design** (`variables/agent/`): `list_variables`, `get_variables`, `create_collection`,
  `update_collection`, `create_mode_axis`, `update_mode_axis`, `create_variables`,
  `update_variables`, `delete_variables`, `bind_variables`, `unbind_variables`,
  `set_variable_mode`, `list_styles`, `create_styles`, `update_styles`, `delete_styles`,
  `generate_shades`, `generate_scale`, `generate_type_scale`, `get_token_usage`,
  `find_unused_tokens`, `replace_token`, `detach_tokens`, `check_contrast`, `export_tokens` and
  `import_tokens`.
- **Design system** (`styleguide/agent/`): `get_design_system`, `set_system_template`,
  `add_system_element` and `convert_system_element`.
- **Board** (`board/modules/colors/agent/`): `list_board_colors`, `create_board_colors`,
  `update_board_colors`, `delete_board_colors`, `create_board_color_collection`,
  `bind_board_colors`, `unbind_board_colors`, `set_board_color_mode`, `import_board_colors` and
  `export_board_colors`.
- **References and values:** agents name variables by id, `Collection/path` or a unique path
  (`requireVariable`). Values are read by `readTokenValue`: `"#3A83C9"`, `8`, `{ alias: "…" }` or
  `{ expr: "{Spacing/base} * 2" }`.
- **Summaries:** layers' summaries report `bindings` and `variableModes`. `get_variables` gives
  expressions by name, with their `result`.

## Extending it

- **A bindable field on a kind:** return it from `bindable(el)` (with `colorField`-style helpers
  on the board). Override `bindPatch` when writing it has consequences.
- **A style type:** add a `designStyleTypes` entry (and a DTCG codec in `DESIGN_STYLE_CODECS` if
  it has a DTCG type).
- **A token file format:** add a `tokenFormats` entry with `write`, `read` and `detect`.
- **Design system templates and categories:** use the `styleguideTemplates` and
  `styleguideCategories` points. Templates are pure `build(group, options, context)` functions
  returning node specs.
- **A function in expressions:** add it to `FUNCTIONS` in `parse-expression.ts`, `evaluate` in
  `evaluate-expression.ts` and, if CSS has it, `CSS_FUNCTIONS` in `exchange/code/css-calc.ts`.

## Checking changes

There's no test framework. Verify with `pnpm lint`, `pnpm typecheck` and `pnpm format:check`.
During development, small scripts that bundle the engine with Vite and run it in Node exercised
the sync, the exchange formats and the agents' arguments; the engine has no React, so it runs
in Node as it is.

## Reference

## Variables

- **Variables** (`variables/`, every phase of the spec, guide: `products/design/modules/variables/README.md`; boards' colors are in the board's `colors` module): the `variables` module contributes `syncTokens` with `DESIGN_TOKEN_CONTEXT` (`core/tree/`: a layer reads the file's modes (each axis's `current`), then its page's `variableModes`, then each ancestor's, then its own; a page is told apart as what isn't a layer) as an `afterEdit` before auto layout's (`after: ["variables"]`), the Variables section (nothing selected, Figma's way: `GlobalModes` (a switch per axis with several modes) first, "+" adds a Color or Number variable, "Local variables" opens the table, then `SidebarGroups`: each collection's groups as `SidebarGroupRow`s (swatches or a number kind's glyph, count; they unfold to their `VariableRow`s, and ↗ opens the window at the group, `openWindowAt`), rows marking variables with overrides), the **Styles** section after it (Figma's: "+" lists the `designStyleTypes` entries, an editor point (see Styles below), and each type's styles show under its heading in group accordions as `StyleRow`s; `VariableEditor` popovers: path, "Varies by" an axis, the default or a value per mode (`ValueField`: a mode without its own shows the default faded, click to override, × to clear), scopes, description, code syntax, hidden; `DeleteTokensDialog` says how many layers get unlinked), the Variable modes section (containers: Auto or a mode per axis, `setVariableModes`), the **Variables window** (`openVariables` host command, "Variables…" in the main menu, "Local variables" in the section; `ui/window/`: an overlay dragged by its title bar (`useDragPanel`) and resized from its corner, state in `useVariablesWindowStore` (collection, axis, view, search, picked variable, generator draft), every piece reading `useBoard()`: `side/` (`CollectionsSide`: collections, the open one's `GroupOutline` (swatches or a number kind's glyph, count, click scrolls to the group), `PaintingSeal` (`shared/ui/brand/`, animated by `seal-breathe`, `seal-brush`, `seal-twinkle`, `seal-tail`) with "Generate a palette"), `board/` (`VariablesBoard`: `BoardToolbar` with search and `ModeChips` (All or one mode; a dark first-surface mode turns the board `dark`), `GroupSection`s of `ColorCard`s (`SwatchHalves` per mode, faded where a mode uses the first one's) and `NumberCard`s (`NumberVisual` by `numberKindOf`: spacing bars, radius corners, "Aa" sizes, opacity fades, stroke lines), `GroupTitle` (renamed in place, "· shades of 500" / "colors" / a number kind, `groupLabel`), `AddCardMenu` (new color, or shades of the group's 500; a number of its kind), `NewGroupMenu` (color palette, color shades, or a number kind: `NUMBER_KINDS`, whose `scopes` are what a number is for), `ShadePreviewSection` and `ScalePreviewSection` (ghost cards: new, update, base), `EmptyCollection`), collections in `CollectionItem` (double-click or right-click → Rename, right-click → Delete with `DeleteCollectionDialog`), `inspector/` (`VariablesInspector`: the `ShadeGeneratorPanel` while drafting, else `VariableInspector` (`VariableHeader`, `ColorModeCard`/`NumberModeRow` per mode with `SameAsFirst`, `ShadeLink` or `PurposeSelect`, `ContrastList` against the collection's "surface" (WCAG grades), `UsageRow`, description, `AdvancedSettings`, delete), else `ModesInspector`: the mode groups (axes) as `ModeGroupCard`s, made with + Group, renamed, shown on the board, deleted after asking; their modes (`ModeRow`) renamed, removed and moved between groups by their grip (drag and drop, before a row or at a group's end) or `MoveModeMenu` (another group, or a new one); `DocumentTokens.moveMode(modeId, toAxis, before?)`: an axis's first mode stays, variables varying only by the moved mode follow it, others keep their own and lose its value (`MoveModeResult.dropped`), layers' and pages' picks move with it; agents' `update_mode_axis` `moveModes`), `generator/` (`ShadeGeneratorPanel`: `BaseColorField`, steps `Segmented`, `GeneratorSlider`s, `ShadeStrips`; `NumberScalePanel`: `ScaleBaseField`, `RatioField`, `StepCount`s, names, rounding, what it's for, `ScaleStepsList`); number inspectors get `ScaleLink`) and the agent tools (`agent/`: `list_variables`, `get_variables`, `create_collection`, `update_collection`, `create_mode_axis`, `update_mode_axis`, `create_variables`, `update_variables`, `delete_variables`, `bind_variables`, `unbind_variables`, `set_variable_mode`; summaries carry `bindings` and `variableModes`, `update_nodes` reports what it unlinked; both products read agents' references with `canvas/agent/tokens/`: `requireVariable`, `requireCollection`, `requireAxis`, `findMode` (each naming its product's listing tool), `readTokenValue`, `describeVariable`, `tokenName`). Bindable fields: `DesignNodeKind.bindable` (paints' and gradient stops' colors by `fillScope`, effects' color and numbers by the fields they have, opacity, W/H, size limits, stroke weights, rotation) plus frames' corner radius and auto layout gaps and padding, rectangles' corner radius, texts' size, line height (a multiplier), letter spacing and weight (stored as its CSS name), polygons' and stars' points and stars' inner radius. Fields bind through `useFieldBinding` (several paths at once for padding pairs) in `BindSlot`/`BindableNumberField`/`BindButton` (`ui/components/panel/`: bound, the field becomes a `VariableChip`; unbound, a hover hexagon opens the picker), on paint rows (`PaintField.bindPath`) and effect editors (`EffectBindingContext`, `EffectBind`). Paint and effect stacks remap bindings when entries are removed or reordered (`stackBindingsPatch`, `removedAt`, `movedTo`); gradient stops rely on the detach rule. **Shade generators** (`canvas/tokens/`): a `GeneratorRecord` (collection, group path, `baseVar` or `baseColor`, `ShadeSettings`: `steps` `50-950`/`100-900`/`5`, `lightest`, `darkest`, `fade`, `other` `flip`/`same`, `axisId`) writes `shadeRamp` (`shade-ramp.ts`: OKLab lightness spread around the base at 500, chroma softened toward the ends, gamut-clipped by `oklchToHex`, `oklab.ts`) as variables named `group/step` with `generatorId` (`generatedShades`); `DocumentTokens.saveGenerator`/`removeGenerator`/`unlinkShade`, and `setValue`/`clearValue` regenerate the shades of a changed base (`followBase`) while a shade set by hand leaves its generator; deleting a base keeps its last color. Agents: `generate_shades`. **Number scales** (`canvas/tokens/`): a `ScaleRecord` (collection, group, `baseVar` or `baseValue`, `scopes`, `ScaleSettings`: `ratio` (`SCALE_RATIOS`), `below`/`above`, `names` `tshirt` (xs…md…3xl) or `numeric`, `round`) writes `numberScale` steps as variables with `generatorId` (`generatedScale`: live, every step an expression of the base step, `round({md} * 1.5625)`; a scale from a number writes it into its base step, which becomes its `baseVar`; one from a variable makes the base step an alias of it; `setValue` keeps a scale's base step in it; older files' scales become live when they open, the variables module's `live-scales` migration, `liveScaleRecords`: only steps the scale still owns, same values), regenerated like shades (`generator-writes.ts`: `regenerate`, `followBase`, `orphanedGenerators`); `DocumentTokens.saveScale`, `removeGenerator` stops either. `DocumentTokens` is a class chain, one file each: `TokenEditsBase` (lookups, checks, writes) → `ModeEdits` (collections, axes) → `VariableEdits` → `DocumentTokens` (generators, scales, styles). Agents: `generate_scale`. **Text and boolean variables:** texts' `text` (through `text.set`, so ranges move), `fontFamily` and `fontStyle` (a face name, `faceFromName`: "Bold Italic" → weight and style) take text variables (scopes `text-content`, `font-family`, `font-style`); every node's `visible`, `layoutAbsolute`, a mask's `maskInverted` and frames' `clipsContent` take booleans (`stringField`, `booleanField`). The Typography section's Text content row (`TextContentBind`), its font and face, the Appearance section's Visible, Clip content, Ignore auto layout and Invert mask are `BindSlot`s; values are edited with `StringValueInput`/`BooleanValueInput` (kit `Switch`), the window shows `PlainCard`s and `PlainModeRow`s (`typeGlyph`: T, ✓). **Styles** (`StyleRecord`s, `canvas/tokens/`; `DocumentTokens.createStyle`/`updateStyle`/`deleteStyles`/`deleteTokens`, `TokenStore.styles`/`style`/`findStyle`; `resolveVariable` returns a style as `{ type: "style", value }` with its own variables resolved, whose fields `bindValues` writes, so writing any of them unlinks it): **text** (the text module: `TextStyleValue`, `readTextStyle`, `textStyleOfNode`, `textStyleSummary` "16/120%", at `TEXT_STYLE_PATH` `"textStyle"`; and on ranges: a run's `textStyle` (style id) is bound at `runs.textStyle.<id>` (`RUN_STYLE_PREFIX`, `applyRunStyle`, `runStylePatch`), the text module's `syncRunStyleBindings` (an `afterEdit`) keeping one binding per style its runs carry, and typography written on a range by hand clears its `textStyle`, `unstyledRangePatch`), **paint** (`PAINT_STYLE`, `{ paints }`, at `fills` or `strokes`, pictures left out where a kind can't show them), **effect** (`EFFECT_STYLE`, `{ effects }`, at `effects`) and **stroke** (`STROKE_STYLE`, weight, sides, align, cap, join, miter, dashes, at `STROKE_STYLE_PATH` `"strokeStyle"`), the last three in `core/styles/` (`read*Style`, `*StyleOfNode`, `*StyleSummary`; `nodeStyleFields`/`nodeStyleValues` give the node base its style fields). Each type is a `designStyleTypes` entry (`ui/modules/style-types.ts`, `StyleTypeEntry`: `id`, `label`, `heading`, `icon`, `order`, `create`, `Preview`, `summary`, `Editor`; text 10, color 20, effect 30, stroke 40). The shared pieces are `ui/components/styles/`: `StyleControl` (a section header's button: the type's `StyleList`, Create style from…, Detach; `StyleBinding` from `useNodeStyleBinding` or, for a text range, `useTextStyleBinding`), `StyleChip` (what Fills, Strokes, Effects and the stroke settings show while a style is applied), `StyleRow` (the Styles section), `StyleEditorPopover`, `StyleEditorFrame` (name, description, delete), `StyleBindingScope` (a `FieldBindingScopeContext` that `useFieldBinding` consults first, so `PaintField`, `BindSlot` and `EffectBind` inside a style's editor bind its parts to variables), `useStyleWriter` (a drag one undo step), `createNodeStyle`, `DeleteTokensDialog`. Editors reuse the panels' stacks: `PaintStackEditor` (core) and `EffectStackEditor` (effects), extracted from their sections; the stroke style's uses kit controls and the shared `stroke-options`. Agents: `list_styles`, `create_styles`/`update_styles` (`type`, `fromNode`, `value`, `bindings`), `delete_styles`, `bind_variables` at a style's path, `style_text_range`'s `textStyle`. **Usage tools** (phase 4; `canvas/tokens/`, shared with boards later): `tokenUsage(store, index, id)` (`TokenUsage`: layers bound directly, layers through a style, aliases, styles, generators), `unusedTokens`/`isUnused`, `replacePlan` (aliases, style bindings, generator bases and declared pairs move; another type, itself or a loop throws); `DocumentTokens.usageOf`, `unused`, `replaceUses(from, to)` (also renames text ranges' `runs.textStyle.<id>` bindings), `detachTokens(ids)` (everywhere, the tokens stay; styles keep the values) and `detachLayers(layers, tokens?)`, one undo step each; the text module's `syncRunStyleBindings` lets an edit of only a text's bindings lead its runs (`followedRuns`: detached ranges lose their style, replaced ones take the new one). UI: `ui/components/token-usage/` (`UsageSummary`: counts, a button per page selecting its layers, `ReplaceWith`, `DetachEverywhere`; in the window's inspector and every style editor, `useTokenUsage`), the window's "Unused · N" (`UnusedEntry`, `UnusedView`: delete picked or all), and "Detach variables and styles" for the selection (`detachLayerVariables` host command, context menu, the variables main menu group). **Contrast** (`variables/contrast/`): `VariableRecord.contrastWith` (declared pairs: it's the text, they're its surfaces; moved by replace, dropped by delete), `contrastPairs(store)` (declared, then text-fill × frame/shape-fill colors of a collection), `contrastChecks(store)` (each pair in every mode combination of the axes its colors and their aliases vary by, at most 16; translucent text composited on its surface, `composite`; `ContrastCheck.worst`; failing first; `contrastGrade`: AAA 7, AA 4.5, AA large 3); UI: the inspector's `ContrastPairsList` (`ContrastRow`, `GradeBadge`, `PartnerPicker`) and the Variables section's `ContrastWarnings`. **Type scale** (`variables/type-scale/`): `createTypeScale(doc, tokens, settings)` makes a number scale of font sizes (`ScaleRecord`, scope font-size) and a text style per step (`Type/<step>`) whose `fontSize` is bound to its step (and `fontFamily` to a font variable), so editing the scale resizes every style and text; `typeScaleSteps` (headings above md: their weight and line height), `DEFAULT_TYPE_SCALE`; the Styles section's "+ Type scale…" (`TypeScaleDialog`, `TypeScaleForm`, `TypeScalePreview`). Agents: `get_token_usage`, `find_unused_tokens`, `replace_token`, `detach_tokens`, `check_contrast`, `generate_type_scale`, `contrastWith` in `create_variables`/`update_variables`. **Import/export** (phase 5): the pure side is `canvas/tokens/exchange/` (shared with boards later): `selectTokens(records, pick)` (`TokenPick`: collections, groups, styles, style types; adds what the picked ones alias and their styles' variables, `extra`), `importConflicts` and `planTokenImport(store, incoming, choice)` (`matchImport`: axes and collections by id, else by name, modes by id, else by name; variables and styles by id (updated), else a conflict with the one of the same collection and path or style type and name: `ImportChoice` `keep-both` (a free name), `replace` (the file's id takes the incoming value) or `skip`; every reference remapped; ids kept, so importing a source again updates it), `DocumentTokens.importTokens(records, choice)` (one undo step), `slugPath`/`camelPath`/`uniqueNames`. **DTCG** (`exchange/dtcg/`): `toDtcg(store, { styles })` writes a root group per collection, groups by path, aliases as `{Collection.path}`, colors as hex, px-like scopes (`PX_SCOPES`) as `dimension` `{ value, unit: "px" }`, font families as `fontFamily`, styles a `DtcgStyleCodec` writes in a `Styles` group (`Styles 2` when a collection has that name) and the rest in the root extension's `styles`; `$extensions["app.cloudy-canvas"]` carries axes, collection ids, each token's id, axis, values per mode (by name), scopes, hidden, code syntax and contrast pairs, and each style's exact record, so reading it back is exact; `fromDtcg(json, { styles })` reads that or any DTCG file (`$type` inherited from groups, 2025 color objects, `"1rem"` = 16 px, unknown types reported in `warnings`), and `finishStyles` drops style bindings of the wrong type (a text style's weight is a name) and resolves bound parts. **Tokens Studio** (`exchange/tokens-studio/`, import only): `fromTokensStudio` (sets → collections by `$metadata.tokenSetOrder`; each `$themes` group an axis of its themes, tokens of sets only some themes turn on one variable varying by it in a collection named after the group; types to variables with scopes, `STUDIO_TYPES`; `typography`/`boxShadow` through the codecs; math left out with a warning), `isTokensStudio`. **Code** (`exchange/code/`): `codeTokens(store, title, styles?)` (names per platform from code syntax or the path, the collection added in front for paths two collections share, values resolved in each axis's first mode, where each differs per mode) and `toCss` (`:root` with `var()` aliases, `[data-<axis>="<mode>"]` blocks, `prefers-color-scheme` for a Dark mode, `--shadow-*`, `.text-*`), `toTailwind` (`@theme` by namespace), `toScss` (maps per mode, mixins), `toSwift` (`enum Tokens`, axis enums and functions), `toKotlin` (Compose `object Tokens`). The design's side is `variables/exchange/`: `DESIGN_STYLE_CODECS` (text ↔ `typography`, shadow-only effects ↔ `shadow`, one-solid color styles → `color`), `designCodeStyles`, the `tokenFormats` point (`TokenFormat`: `id`, `label`, `extension`, `fileLabel`, `write`, `read`, `detect`; `BUILT_IN_TOKEN_FORMATS`: tokens-studio, dtcg, css, tailwind, scss, swift, kotlin) and `readTokenSource(bytes, formats, kinds)` (a `.cdesign` by its magic through `readDesignTokens` (`file/`: `readFileTokens` from `canvas/file/`, read without opening an editor), else JSON by the formats' `detect`). UI: the Variables window's title bar `ExchangeMenu` (`ui/exchange/`: Import from a file… (`pickTokenFile` from `@platform`) opens `ImportTokensDialog` (`ImportPickTree` of collections and style types with their top-level groups, `ImportConflicts` (`canvas-ui/tokens/`), warnings), Export as ▸ each writing format through `exportFile`). Agents: `export_tokens` (`format`, `path`), `import_tokens` (`path` or `text`, `format`, `collections`, `styles`, `conflict`, `preview`). **Expressions** (phase 7, `canvas/tokens/expression/`): a number variable's value may be `{ expr }`, math over number variables stored with references by id (`{<id>} * 2`; `parseExpression`: numbers with `px`/`rem`, `{references}`, `+ - * /`, parentheses, unary minus, `min`, `max`, `round`, `floor`, `ceil`, `abs`, `clamp`; `evaluateExpression`), read and written by people and agents with names (`formatExpression`, `readExpression`). `resolveVariable` works it out per mode, each reference by its own axis (`null` for a loop, a missing or non-number reference, or a division by zero; `setValue` refuses those). Everything that follows aliases asks `valueRefs`/`mapValueRefs` (`value-refs.ts`), so the store's dependents (and the sync), loops, usage, deleting (the value it gave is baked in), replace, the clipboard, picking and importing treat it as an alias of each reference. DTCG writes its result as `$value` and the expression in the extension (`expr`, mode values), DTCG and Tokens Studio math on numbers reads as one (`readExchangeExpression`), CSS writes `calc()` with `var()` (`cssCalc`; rounding and opacities as values), the other code formats values, and the Figma import maps `EXPRESSION` arithmetic (`fig-expression.ts`). UI: `ValueField`'s Σ button opens the visual builder (`ui/expression-builder/`: `ExpressionBuilder`, `FormulaEditor`, `FormulaStepRow`, `OperandField` (a number, or a variable picked from the list), `FormulaLimit`, `FormulaPreview`; `ChainEditor` (a start and its steps, with + Variable, + Number and + Group), over the pure `Formula` model, `formulaOf`/`formulaText`: a start, steps left to right whose values may be groups (`FormulaChain` in parentheses, nesting up to 3 deep in the UI), rounding, at least/at most; expressions with other functions show as text with Start over), and `ExpressionInput` is the text form (names typed in `{…}`, `= result` or "Not applied" with the reason, a `{}` picker inserting a name at the caret, the builder's button, Use its value instead); `VariableValue` marks results ƒ. Resolving memoizes within a call and caches parsed texts (`parsedExpression`), and `formatExpression` shows only names that read back as the same variable. Agents: `{ expr: "{Spacing/base} * 2" }` in `create_variables`/`update_variables`; `get_variables` gives the expression by names and its `result`.
