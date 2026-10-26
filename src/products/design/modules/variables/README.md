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
