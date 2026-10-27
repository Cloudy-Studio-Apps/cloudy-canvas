# Elements

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

Everything on a canvas is an element. **Elements are plain data and behavior lives in kind classes.** Never branch on `el.type` outside an element's folder: ask its kind. The framework is in `canvas/elements/`; the element types live in their product's modules (`products/board/modules/<name>/`).

## Data

- **Data:** every element extends the `CanvasElement` interface (`id`, `type: string`, `index`, `x`, `y`, `w`, `h`) in `element.types.ts`. They're plain JSON because they live in the Yjs doc. **The set of types is open:** there's no closed union of types, so plugins can add types the engine has never heard of. Code outside an element's folder only sees `CanvasElement` and asks its kind. Patches are `ElementPatch<E>` (typed by the kind for its element), and the document takes the base `ElementPatch`.

## Behavior

- **Behavior:** each type has one `ElementKind<E, O>` subclass (`element.kind.ts`), registered in its product's `ElementKinds` (`element.kinds.ts`, a `Registry` from `utils/registry.ts` that throws on duplicate keys; `composeProduct` fills it from the modules' `boardCanvas.kinds` contributions). `kinds.kindOf(el)` returns it, and `kinds.isElement(data)` is true only for registered types. Every kind declares its metadata: `label`, `description` (tooltips, listings) and `tool`, the id of the tool that creates it. The hotkey isn't stored on the kind: `engine.elementInfo(type)` reads it from the keymap through `tool`. The toolbar takes element tools' label and description from `elementInfo`. A kind can provide:
  - `draw`, `bounds`, `hitTest`
  - `move`, `resizable` / `resize`, `keepsRatio` (always resize proportionally, not only with Shift)
  - `assets(el)`: the document assets it shows (e.g. an image's file)
  - `text`: an `ElementText` spec (`get`, `set`, `style`) that the `TextEditor` and the drawer share, so edited text lines up with drawn text. `fitContent` sizes the element to its unwrapped text (the editor grows while typing), and `removeWhenEmpty` deletes it when its text is emptied
  - `fillDefaults` (for older files)
  - `describe` (agent summaries), `completePatch(el, patch, context)` (fields that follow from an agent's patch, e.g. a text's size; it throws on invalid values, e.g. an unknown geo `kind`, and maps fields the element doesn't store, e.g. a connector's `from`/`to`, which `patchableFields` must list)
  - `optionsOf` / `restyle` (the tool options panel, typed with the product's options `O`)
  - `text.style(el).singleLine`: a one-line text (a name), where Enter finishes editing
  - `partAt(el, p)`, `partBounds(el, part)` / `removePart(el, part)`: a selected part of the single selected element (a table cell, picked by clicking the already selected element at `partAt`, which gets the click's Shift and Ctrl/Cmd to extend the current part; or a row, set by a handle with `ctx.setPart`; read as `EngineState.selectedPart`, cleared when the selection changes or Esc is pressed). The overlay outlines it and Delete removes it instead of the element.
  - `interactionAt(el, p, query)`: part of the element a press grabs before selecting it (a handle, a button). It returns an `ElementInteraction` (`cursor`, `press(ctx, p)`); `press` runs a one-shot action or returns an `ElementGesture` (`move`, `finish`, `cancel`, `onCameraChange`) that the select tool drives. Resize handles of the single selection win over it.
  - `handles(el, zoom)`: `ElementHandle`s the overlay draws while the element is selected or hovered (`look: "dot"` for small actions; `bar` and `add`, with `w`/`h`, for grips and "+" strips). A hovered element with handles stays hovered a little outside its bounds, so handles drawn outside it can be reached.
  - `boxed`: whether selection and hover outline its bounds (`false` for connectors, which show their ends)
  - `connectable` and `anchor(el, side)`: whether connectors attach to it, and where on each `ElementSide` (`BoxKind` is connectable; geo variants give their own `sideAnchor`)
  - `build(spec, index, context)` from an `ElementSpec` (agents' `create_shapes`), plus `creatable` and `patchableFields`. Type-specific spec fields are declared in `specProperties` (merged into the `create_shapes` schema) and read from `spec.args`; `context.lookup(ref)` finds elements by id or by a `key` given earlier in the same call.

## Shared bases

- **Shared bases** (`canvas/elements/bases/`). Anything several types do goes in a base, never copied into each kind:
  - `BoxKind`: hit anywhere in the bounds, resizable.
  - `TextBoxKind extends BoxKind`: in-place `text` (get, set, describe). Subclasses only give `textStyle`.
  - `LineKind`: hit near a polyline `points`.
  - `ElementKind.specRect` turns a spec into bounds for `build`.
  - Factories start from `createElementBase(type, rect, index)` (`element.factory.ts`: id, type, index, bounds) and spread their own fields on top. The editor's aria label is `${kind.label} text`.

## One folder per type

- **One folder per type** (in its module's folder, or a subfolder of it for families like `db/` and `er/`). Files are named `<name>.<role>.ts` so the role shows in the name:
  - `<type>.types.ts`: the data interface
  - `<type>.factory.ts`: `create<Type>()`, pure data with no rendering
  - `<type>.draw.ts`: the Pixi drawer
  - `<type>.kind.ts`: the `ElementKind` subclass
  - `<type>.defaults.ts`: one typed object (`STICKY_DEFAULTS`, `GEO_DEFAULTS`) that satisfies its `<Type>Defaults` interface, which extends `ElementDefaults` (`size?`, `fontSize?`). The kind exposes it as `kind.defaults`, so generic code (e.g. `loadFonts`) reads defaults through the kinds and never names a type's constants. Values every element shares (font family, line height, minimum size) are in `ELEMENT_DEFAULTS` (`canvas/elements/element.defaults.ts`). No loose constants.
  - `index.ts`: the folder's exports

  Extra pieces follow the same pattern (`stroke.outline.ts`, `geo/variants/<id>.variant.ts`, `variant.registry.ts`, `bases/box.kind.ts`), and one-off helpers keep plain names (`ellipse-arc.ts`). Element folders import the framework from `@canvas`. The board's types are:

## Where the types live

- **Where the types live:** each is in its module (`products/board/modules/<name>/`: `draw` holds `stroke`, `geo`, `text`, `connector`, `section`, `table`, `image`, `sticker`, `sticky`, `embed`, `db`, `er`), and paths above are relative to it. A module's tools are `<name>.tool.ts`, its MCP tools `<name>.mcp.ts`, its options `<name>-options.types.ts` and its panels in `ui/`.

## Adding a type to a product

- **Adding a type to a product:** write a module (see Modules): its folder in the product's `modules/`, contributing the kind to `boardCanvas.kinds` and, if it has one, the tool (with its `keys`) to `boardCanvas.tools` and its tool entry to `boardEditor.tools` (icon, placement; see Editors). Agents' `create_shapes` schema, `loadFonts` and `elementInfo` read the composed kinds. A geo variant is still `geoVariants.register(new MyVariant())`.
