# Plugins

A plugin adds to Cloudy Canvas without changing its source: element types, tools, toolbar buttons, options panels, side panels, overlays, library items and **agent (MCP) tools**. It's a [module](modules.md), the same as the built-in features, loaded from disk when the app starts.

> Plugins run with the same access as the app: your files, the network and your boards. The app asks before a plugin runs for the first time. Only turn on plugins you trust.

## Format (API version 1)

A plugin is a folder:

```
my-plugin/
  plugin.json
  main.js
  …any other files (icons, data), read with api.plugin.readAsset / readText
```

`plugin.json`:

```json
{
  "id": "my-plugin",
  "name": "My plugin",
  "version": "1.0.0",
  "description": "What it adds.",
  "author": "You",
  "apiVersion": 1,
  "products": ["board"],
  "main": "main.js"
}
```

- `id`: lowercase letters, digits and dashes. Module ids must be the plugin id or start with `<id>.`.
- `main`: **one ES module with no imports.** Everything comes from `api`. If you write it in TypeScript or JSX, bundle it into one file and use `api.libs.React.createElement` as the JSX factory. Never bundle your own React.

- `products`: `["board"]`, `["design"]` or both.

`main.js` exports `activate(api)` by default, returning one module or a list of them (for the one product in `products`), or `{ board: [...], design: [...] }` for a plugin of both:

```js
export default function activate(api) {
  return api.core.defineModule({
    id: "my-plugin",
    register(host) {
      host.contribute(api.board.boardCanvas.kinds, new MyKind());
      host.contribute(api.board.boardEditor.tools, {
        tool: "my-tool",
        element: "my-type", // named and described by the element's kind
        icon: { svg: "<svg…>" },
        toolbar: { group: 1, order: 200 }, // leave it out to keep the tool off the toolbar
      });
    },
  });
}
```

## Tools: icon, name, description and placement

Each tool is one entry on `api.board.boardEditor.tools`:

| Field                  | What it does                                                                                                                                                                                                                                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tool`                 | The tool's id (the one given to `api.board.boardCanvas.tools`).                                                                                                                                                                                                                                                                                    |
| `icon`                 | A Lucide icon or `{ svg: "<svg…>" }` (drawn at the text's color with `currentColor`).                                                                                                                                                                                                                                                              |
| `element`              | For a tool that adds an element: its type. The name and description come from the element kind's `label` and `description`.                                                                                                                                                                                                                        |
| `label`, `description` | For other tools, instead of `element`.                                                                                                                                                                                                                                                                                                             |
| `toolbar`              | `{ group, order, menu }`: its button on the main toolbar; tools with the same `menu` (e.g. `"shapes"` in designs) share one button with a chevron listing them. Group 0 holds select and hand, group 1 the tools that add elements (built-ins use orders 10 to 100, so 110 and up come after them). Leave it out to keep the tool off the toolbar. |
| `library`              | Its card in the library (Shift+I). Tools with an `element` are listed by default; `{ section, order, keywords }` changes where and how, and `false` keeps one out. Other tools are only listed with a placement.                                                                                                                                   |
| `subTools`             | `[{ id, label }]`: tools picked from this tool's panel, which keep its button active.                                                                                                                                                                                                                                                              |

So a plugin that adds an element always shows it in the library, with the icon, name and description it gave. Whether it also gets a toolbar button is its choice.

## The API

`api` is the app's own barrels, whole: a plugin reaches exactly what a built-in feature imports, by
the same names. A group is checked when you read it (`api.board.palette` throws, naming it); what's
inside a group is handed out as it is.

| `api.…`    | What it is                                                                                                                                                                                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `plugin`   | `id`, `manifest`, `readAsset(path)`, `readText(path)` (files in the plugin's folder)                                                                                                                                                                                                                   |
| `core`     | `@shared/core`: `defineModule`, `definePoint` (points other plugins can extend), `createId`, `defineMessages`/`getLocale`/`tCommon` ([Translations](#translations)), stickers, links, …                                                                                                                |
| `canvas`   | `@canvas`, the engine: the kind bases (`ElementKind`, `BoxKind`, `TextBoxKind`, `LineKind`), tools (`FreehandTool`, `pastThreshold`, …), geometry, paths, text, colors, `keyBetween`/`nKeysBetween`, export, variables, the agent tool helpers (`asUndoStep`, `buildElement`, `stringArg`, …)          |
| `canvasUi` | `@canvas-ui`, the shared editor pieces: `useEngine`, `useEngineState`, `useService`, `useEngineElement`, `useEditorMode`, `FloatingPanel`, `ToolButton`, `ColorField`/`ColorPopover`/`ColorPalette`/`ColorSwatch`, `chooseImageAsset`, `ModeToolbar`, `ElementThumbnail`, `AnchorPicker`, …            |
| `ui`       | `kit` (see [Building UI](#building-ui)), `toast`, `notifyError`, `runWithLoading`, `CodeEditor`, the brand seals, `usePaletteFavoritesStore`                                                                                                                                                           |
| `platform` | `exportFile(blob, name, { extension, label })`, `openFile({ title, filters })`, `pickImageFiles`, `readLocalFile`, `http`, `openExternal`, `clipboard`, `fontLibrary`: the parts that touch the user's computer                                                                                        |
| `libs`     | the app's own libraries: `React`, `createPortal`, `icons` (Lucide), `createStore` and `persist` (zustand), `StreamLanguage` (CodeMirror). Bundle any other library yourself                                                                                                                            |
| `board`    | `@board` and `@board/ui`: the points (`boardCanvas`, `boardEditor`, `boardMcpTools`, `boardMigrations`, the er module's `boardErStandards`/`boardErConstructs`), `requireBoard`, the palette (`STICKY_COLORS`, `INK_COLOR`, …), `useBoardEngine`/`useBoardState`, `SourceEditor`, `defineBoardMode`, … |
| `design`   | `@design` and `@design/ui`: see [Design plugins](#design-plugins)                                                                                                                                                                                                                                      |
| `themes`   | `register(theme)`, `useActiveTheme`, `onThemeChange`, `tokens`: see [Themes](#themes)                                                                                                                                                                                                                  |
| `stickers` | `registerGroup({ id, label, description?, order, tab? })`, `registerSet(groupId, stickers)` and `stickerSvg(art, defs?)`: stickers for both products, see [Stickers](#stickers)                                                                                                                        |

The kinds: set `rotatable` for elements that turn (the engine draws and hits them turned and your
kind works unturned); override `scale(el, t)` so the Scale tool grows what you draw (e.g. a font
size, with `scaleRect`/`scaleLength`) and set `scalable` when it can be scaled alone; list the
fields of its look in `styleFields` so Copy and Paste properties carry them, and override
`applyStyle(el, style)` when its size follows them; list the fields variables can drive in
`bindable(el)` and override `bindValues`/`bindPatch` when writing one has consequences. A kind's
`fonts(el)` asks the engine to load the faces its text uses.

### Using another module

A module's UI pieces and its points that aren't in a barrel come from the module itself. List it in
`requires` (or `uses`) and ask the host while registering:

```js
api.core.defineModule({
  id: "my-plugin",
  requires: ["library"],
  register(host) {
    const library = host.require("library"); // the library module's index.ts and ui/index.ts
    host.contribute(library.boardLibrary, myLibraryItem);
  },
});
```

Every built-in module hands its `index.ts` and `ui/index.ts` this way (`host.require("effects")`
gives `designEffectTypes`, `defineEffectType`, `ScrubField`, …; `host.require("frame")` gives
`FramePresetPicker`), and so can a plugin's module, by setting `exports`, for other plugins that
require it. `host.require` throws, naming both modules, outside `register`, for a module that isn't
in `requires`/`uses`, and for one that exports nothing.

### Moved in version 1

Names from before the API became the barrels:

| Before                                                                                        | Now                                                                                              |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `board.canvas`, `board.editor`, `board.mcpTools`                                              | `board.boardCanvas`, `board.boardEditor`, `board.boardMcpTools`                                  |
| `board.palette.X`                                                                             | `board.X`                                                                                        |
| `board.erStandards`, `board.erConstructs`                                                     | `board.boardErStandards`, `board.boardErConstructs`                                              |
| `board.library`                                                                               | `host.require("library").boardLibrary`                                                           |
| `board.defineMode`, `board.registerMode`                                                      | `board.defineBoardMode`, `board.registerBoardMode`                                               |
| `design.canvas`, `design.editor`, `design.mcpTools`, `design.migrations`                      | `design.designCanvas`, `design.designEditor`, `design.designMcpTools`, `design.designMigrations` |
| `design.tree`, `design.pages`                                                                 | `design.DESIGN_TREE`, `design.DESIGN_PAGES`                                                      |
| `design.nodes.X`, `design.network.X`, `design.panel.X`, `design.sections.X`, `design.hooks.X` | `design.X`                                                                                       |
| `design.effects.X` (engine side, `setEffectReader`, shaders)                                  | `design.X`, `canvas.X` (`EffectShader`, `FILTER_HEADER`, …)                                      |
| `design.effects.effectTypes`, `defineEffectType`, `ScrubField`, `EffectChoice`                | `host.require("effects")`: `designEffectTypes`, …                                                |
| `design.defineMode`, `design.registerMode`                                                    | `design.defineDesignMode`, `design.registerDesignMode`                                           |
| `ui.React`                                                                                    | `libs.React`                                                                                     |
| `ui.FloatingPanel`, `ui.ColorField`, `ui.useEngine`, … (the canvas-ui pieces)                 | `canvasUi.X`                                                                                     |

What each point takes is described in the READMEs of `src/shared/core/modules/`, `src/canvas/modules/`, `src/canvas-ui/modules/` and `src/canvas/elements/` and in the types in `src/canvas/modules/canvas-points.types.ts` and `src/canvas-ui/modules/editor-points.types.ts`.

Agent tools are groups contributed to `api.board.boardMcpTools`: `{ id, tools: ({ kinds }) => [{ name, description, inputSchema, run(host, args) }] }`. They're listed by the app's MCP server like the built-in ones, and `list_plugins` tells agents which plugin adds what. Tool names must be unique; a tool whose name is taken is left out.

## Stickers

`api.stickers` adds stickers to the app's one catalog, so they show in the sticker picker of boards **and** designs (whatever the plugin's `products`) and agents can stamp them (`list_stickers`, `stamp_stickers`, `stamp_design_stickers`):

```js
api.stickers.registerGroup({ id: "cats", label: "Cats", description: "Cat moods", order: 30 });
api.stickers.registerSet("cats", [
  // `art` is SVG markup on the 128-unit grid: it gets the built-in stickers' white die-cut
  // edge, which designs can recolor.
  {
    name: "happy",
    label: "Happy cat",
    keywords: ["smile"],
    art: '<circle cx="64" cy="64" r="44" fill="#f7c948"/>',
  },
  // Or a whole SVG file, an image file's bytes or a URL.
  {
    name: "photo",
    label: "Cat photo",
    data: await api.plugin.readAsset("cat.png"),
    type: "image/png",
  },
]);
// Add to a group that exists already: the built-in `seal`, `common`, the emoji groups
// (`smileys`, `people`, `nature`, …) or another plugin's.
api.stickers.registerSet("common", [
  { name: "meow", label: "Meow", svg: await api.plugin.readText("meow.svg") },
]);
```

- Group ids are unique among every group (the seals are `order` 10 and the common stamps 20; `tab: "emojis"` lists a group in the Emojis tab). Sticker ids are `plugin:<plugin id>:<name>`.
- Each sticker gives one picture: `art` (+ `defs` for gradients), `svg`, `data` (+ `type`) or `url`. A stamp copies its picture into the file, so files open without the plugin.
- What `activate` registers is added once it returns, and dropped if the plugin fails. SVG stickers can be turned into vector layers in designs (Convert to vectors).

## Building UI

Build panels, dialogs and menus with `api.ui.kit`, and color them only with the app's semantic tokens (`bg-surface`, `text-muted-foreground`, `border-border`, `bg-primary`, …, or `var(--surface)` in inline styles). Then a plugin's UI follows whatever theme the user picks, dark ones included, with no code of its own. Never hard-code chrome colors. Colors that are document content (an element's fill) are data and stay as they are.

| Component                                                    | For                                                                                                                               |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `IconButton`                                                 | a square icon button with its label (and shortcut) in a tooltip; `active` for toggles; sizes `xs` (panel rows) to `lg` (toolbars) |
| `SegmentedControl`                                           | one choice out of a few, as joined buttons (text or `iconOnly`)                                                                   |
| `Field`                                                      | a labelled control with a hint or an error; `layout: "inline"` for settings rows                                                  |
| `SelectField`, `CheckboxField`, `SwitchField`                | a labelled select (`layout` `bare`, `inline` or `stacked`), checkbox or switch row of a panel                                     |
| `FieldBox`                                                   | the compact muted box of panel fields                                                                                             |
| `SearchInput`                                                | a search box (Escape clears it)                                                                                                   |
| `Section`                                                    | a titled block of a side panel, optionally `collapsible`, with header `actions`                                                   |
| `ListRow`                                                    | a row of a list or tree: icon, label, meta, actions on hover, `selected`, `depth`                                                 |
| `SelectableCard`                                             | a card picked out of a set (a picture, title, description, a tick)                                                                |
| `AppDialog`                                                  | a dialog: title, description, body and footer buttons, in four widths                                                             |
| `MenuItemContent`                                            | an icon, a label and a shortcut or tick inside a menu item                                                                        |
| `EmptyState`, `Toolbar`/`ToolbarGroup`, `Checkbox`, `Swatch` | the rest                                                                                                                          |

The shadcn primitives they're built on (`Button`, `Input`, `Select…`, `DropdownMenu…`, `Popover…`, `Tooltip…`, `Dialog…`, `Tabs…`, `Switch`, `Badge`, `Kbd`, …) and `cn` are in `api.ui.kit` too. Controls size themselves with the density (`h-control`, `h-control-sm`, `h-row`, …), so they match the user's choice.

## Translations

The app is in English or Spanish (the OS's language, or the user's choice in Settings › Language).
Give your plugin the same: put `locales/en.json` and `locales/es.json` in its folder, strings grouped
in nested objects, and make a translator in `activate`:

```js
export default async function activate(api) {
  const read = async (lang) => JSON.parse(await api.plugin.readText(`locales/${lang}.json`));
  const t = api.core.defineMessages({ en: await read("en"), es: await read("es") });
  t("panel.title"); // the dot path to a string
  t("items", { count: 3 }); // items_one / items_other, {count} filled in
  // … return your modules, with t() for their labels
}
```

`examples/plugins/callout/` does this for its name, description, colors and panel. A string missing in Spanish shows the English one; a missing key shows the key itself. Keys aren't
type-checked for plugins, so test both languages. `api.core.getLocale()` gives the locale for `Intl`
formatters.

## Themes

`api.themes.register(theme)` adds a theme to Settings › Appearance (and the theme menus). A theme lists only what it changes over the one it `extends` (Cloudy Light when unset; `cloudy-dark` and `jetbrains-dark` are the built-in dark ones):

```js
api.themes.register({
  id: "theme-nord", // unique among every theme: name it after the plugin
  label: "Nord",
  appearance: "dark", // which slot of "Match system" it's offered for
  extends: "cloudy-dark",
  tokens: { background: "#2e3440", surface: "#3b4252", primary: "#88c0d0" /* … */ },
  products: { design: { "canvas-background": "#323846" } }, // inside one editor only
  fonts: { mono: '"Fira Code", monospace' }, // a font stack the system has
  density: "compact", // compact, default or comfortable
  corners: { control: 4, card: 6, max: 6 }, // px, at most 8
  preview: { background: "#2e3440", surface: "#3b4252", primary: "#88c0d0", foreground: "#eceff4" },
});
```

- `api.themes.tokens` lists every token a theme can set: surfaces and text, the canvas (`canvas-*`: background, grid, selection, snap guides, rulers), code (`syntax-*`), lines, roles and `shadow-color` (an `H S% L%` triple). Unknown names are left out with a warning in the console; values are CSS values (colors, `var(--seal-900)`).
- `preview` is the card's picture; left out, it's taken from the tokens.
- Exports and file previews keep the base theme's colors, so files look the same whoever made them.
- A plugin that only adds themes can have `"products": []` and return nothing from `activate`. What it registers is added once `activate` returns and dropped if the plugin fails. When the user's theme comes from a plugin that's later removed, the app falls back to a built-in theme of the same appearance.
- For drawing that reads tokens itself (a canvas, a chart), `api.themes.useActiveTheme()` gives the theme shown (`resolved.appearance`, `resolved.tokens`), and `api.themes.onThemeChange(listener)` says when it changes.

`examples/plugins/theme-nord/` is a complete theme plugin.

## ER standards

A standard is the textbook or paper an ER diagram follows (`Diagram [standard: …]`): how it's drawn, which constructs it has and its own Check diagram rules. The board's five (Cloudy Canvas, Chen, Elmasri & Navathe, Silberschatz, de Miguel & Piattini) are written the same way a plugin writes one:

```js
host.contribute(
  api.board.boardErStandards,
  api.board.defineErStandard({
    id: "myschool",
    label: "My school's notation",
    citation: "Course notes, Databases I, 2026.",
    url: "https://example.edu/notes.pdf", // or null
    approximate: false,
    summary: "(min,max) on the lines, the d / o circle, no crow's feet.",
    settings: {
      cardinality: "minmax",
      ratio: "across",
      participation: "numbers",
      isa: "circle",
      crowFeet: false,
    },
    // Construct ids it leaves out (see ER constructs below); unset allows everything.
    forbids: ["constraints", "unions", "associative-entities"],
    // Optional: findings of its own, after the shared rules.
    check: (shapes) =>
      shapes.entities
        .filter((e) => e.name !== e.name.toUpperCase())
        .map((e) => ({
          rule: "myschool-upper",
          severity: "info",
          shapeId: e.id,
          message: `${e.name} should be in capitals.`,
        })),
  }),
);
```

It then shows in the ER panel's Standard picker, in the text's completions, and in drawing and the Check diagram, with nothing else to register. An id that's taken throws, naming both modules. A board that names a standard that isn't installed keeps the id, is drawn with the default and gets a "not installed" finding, so installing the plugin again brings it back.

### ER constructs

A construct is something a diagram can use that a standard may leave out. The built-ins are `hierarchies`, `aggregations`, `constraints`, `unions`, `weak-entities`, `associative-entities`, `identifying-relations`, `dependency-marks`, `nary-relations`, `self-relations`, `relation-attributes`, `multivalued-attributes`, `derived-attributes`, `composite-attributes`, `alternate-keys`, `optional-attributes` and `join-attributes`. A plugin adds one with `detect`, which returns the ids of the shapes that use it:

```js
api.board.defineErConstruct({
  id: "long-names",
  label: "Names longer than 30 characters",
  detect: (shapes) => shapes.entities.filter((e) => e.name.length > 30).map((e) => e.id),
});
```

Contribute it to `api.board.boardErConstructs`; any standard that lists its id in `forbids` then reports each shape it detects as an error ("Names longer than 30 characters aren't part of My school's notation."). Ids in `forbids` that aren't installed are ignored, and a construct no standard forbids changes nothing.

## Design plugins

Designs are built from modules the same way, on their own points. `api.design` is `@design` and
`@design/ui`; the main names:

| What                 | Names in `api.design`                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| canvas points        | `designCanvas`: the board's, plus `view`, `drawOrder`, `clips`, `selectTarget`, `editElement`, `onMoved` (`scopes` and `guides` are the pages module's, `rulerFrame` and `frames` the core module's; a page's ruler guides are read with `engine.guides()`)                                                                                                                                                                                                                                      |
| editor points        | `designEditor`: the shared ones (`tools`, `toolPanels`, `overlays`, `sessionHooks`, `contextMenu`, `toolbars`, `mainMenu`, …) plus `leftTabs`, `propertySections` (shown `when` the selection fits), `toolSidebars`, `layerIcons`                                                                                                                                                                                                                                                                |
| kind bases and tools | `DesignNodeKind` (every design element: name, parent, visibility, opacity, fills, strokes; a container overrides `contentClip(el)`), `BoxShapeKind` (`createNode`, `clickSize`), `PointsShapeKind` (outlined by `points(el)`), `NodeDrawTool` (the drawing gesture), `BoxDrawTool` (`new BoxDrawTool(ctx, kind)`)                                                                                                                                                                                |
| node helpers         | `createNodeBase`, `isDesignNode`, `solidPaint`, `imagePaint`, `gradientPaint`, `isGradientPaint`, `drawPaints`, `traceBox`, `NODE_DEFAULTS`, `containerAt`, `parentFor`, `pointsInBox`, `pointInPolygon`, `distanceToOutline`                                                                                                                                                                                                                                                                    |
| vector networks      | `polylineNetwork`, `polygonNetwork`, `rectNetwork`, `ellipseNetwork`, `placeNetwork`, `scaleNetwork`, `networkBounds`, `hitSegment`, `vertexAt`, `insideRegion`, `traceStrokes`, `traceRegions`, the edits (`splitSegment`, `connect`, `addVertex`, `moveVertices`, `setTangent`, `removeParts`, `cutSegment`, `bendSegment`, `toggleSmooth`), `VectorEditTool`, `VECTOR_EDIT`, `VECTOR_TOOLS`. A shape converts to a vector on double-click when its `BoxShapeKind` gives a `vectorNetwork(el)` |
| services             | `DESIGN_TREE` (`api.canvasUi.useService(api.design.DESIGN_TREE).layers(engine.scope)`: the page on screen; `null` for every page), `DESIGN_PAGES` (`pages()`, `add`, `rename`, `duplicate`, `remove`, `reorder`, `moveNodes`; the page on screen is `engine.scope`, shown with `engine.setScope(id)`)                                                                                                                                                                                            |
| panel blocks         | `PanelSection`, `PanelIconButton`, `PanelAddButton`, `PropertyGrid`, `FieldBox`, `NumberField`, `HexInput`, `PercentInput`, `PaintField`, `BindSlot`, `BindableNumberField`, and fields bound to the selection: `NodeNumberField`, `NodeSelectField`, `NodeCheckbox`, `NodeOptionButtons` (`read(node)` and `patch(value)`, "Mixed" when nodes differ, one undo step), `sharedValue`                                                                                                             |
| section filters      | `ofType(...types)`, `allKinds((kind) => …)`, `someNodes`, `noNodes`                                                                                                                                                                                                                                                                                                                                                                                                                              |
| hooks                | `useSelectedNodes`, `useEditNodes` (patches as one undo step), `useMoveNodes`, `useDesignEngine`, `useDesignState`                                                                                                                                                                                                                                                                                                                                                                               |
| agents               | `designMcpTools`, `requireDesign`, `setEffectReader`                                                                                                                                                                                                                                                                                                                                                                                                                                             |

Every design element extends `DesignNodeKind`, so the built-in sections (Position, Layout, Appearance, Fills, Strokes, Export) and the Layers tab work with it without extra code. Nodes carry the page they're on (`pageId`); `createNodeBase` leaves it empty and the canvas puts a node on the page on screen when it's added, so kinds and tools never set it. A shape outlined by corners only gives its points; `BoxDrawTool` draws it from the kind, so there's no tool to write. A star, for example:

```js
export default function activate(api) {
  const { PointsShapeKind, BoxDrawTool, createNodeBase, solidPaint, pointsInBox } = api.design;

  class StarKind extends PointsShapeKind {
    type = "my-star.star";
    label = "Star"; // also the base of its layers' names: "Star 1", "Star 2", …
    description = "A five-pointed star.";
    tool = "my-star.star";
    defaults = { size: { w: 100, h: 100 } }; // what a click places

    createNode(rect, name, index, parentId) {
      return createNodeBase(this.type, rect, index, {
        name,
        parentId,
        fills: [solidPaint("#FFC83D")],
      });
    }

    points(el) {
      return pointsInBox(10, (i) => (i % 2 ? 0.4 : 1), el.w, el.h);
    }
  }

  return api.core.defineModule({
    id: "my-star",
    register(host) {
      const kind = new StarKind();
      host.contribute(api.design.designCanvas.kinds, kind);
      host.contribute(api.design.designCanvas.tools, {
        id: kind.tool,
        create: (ctx) => new BoxDrawTool(ctx, kind),
        keys: [{ key: "s", shift: true }],
      });
      host.contribute(api.design.designEditor.tools, {
        tool: kind.tool,
        element: kind.type,
        icon: { svg: "<svg …>" },
        toolbar: { group: 1, order: 110, menu: "shapes" }, // in the shapes menu
      });
    },
  });
}
```

Tools that don't draw a box (like the line tool, which draws between two ends) extend `NodeDrawTool` and describe their shape: `dragShape`, `clickShape`, `createNode`, `shapePatch`.

Design agent tools are groups contributed to `api.design.designMcpTools`, like the board's (`run(host, args)` gets the design host; `api.design.requireDesign(host)` is the open design, `{ engine, path, … }`). A kind agents may create with `create_nodes` sets `creatable = true`, lists its own fields in `specProperties` and overrides `nodeFromSpec(spec, index, context)` (`BoxShapeKind` already does: `w`/`h` or its click size, named with `context.nameFor(label)`); `update_nodes` checks patches with its `completePatch` (call `super.completePatch` for the shared fields: paints, opacity, parent).

## Modes

A mode (a way of working with its own tools, toolbar and panels, like the Catalog or the ER mode) is
one object, `api.design.defineDesignMode({…})` or `api.board.defineBoardMode({…})`, registered from
your module with `api.design.registerDesignMode(host, mode)` (or `api.board.registerBoardMode`). It gives the canvas
part (`tool`, `tools`, `allowTools`, `isolate`, `faded`, `commands`, `keybindings`), the switcher
entry (`id`, `label`, `description`, `icon`, `order`), `toolbar` (items, `{ useItems }` or
`{ component }`, drawn with `ModeToolbar`), `hostCommands` with `run(engine)`, `overlays` (shown
only while the mode is on), `onEnter`/`onLeave`, `hooks`, and for designs `rail` (the left tabs
while it's on) and `sidebar` (the properties panel). See [Modes](modules.md#modes).

## Rules

- **Name everything after the plugin:** element types, tool ids, option keys and agent tool names, so they don't collide with the app or other plugins. When a plugin collides (a type, tool or command that's already taken, an option given twice), it's turned off with the reason shown in Settings › Plugins, and the board opens without it.
- Elements of a plugin that's off or uninstalled stay in the file untouched; they're just not shown until it's back.
- Plugins load once, when the app starts. Changes apply after a reload.
- Reading a name a group doesn't have (a typo, or a name from before, e.g. `api.board.palette`; see [Moved in version 1](#moved-in-version-1)) throws right away, naming it, and the plugin is marked as failed with that message. What's inside a group (a point, a palette object) is a plain value: a missing key there reads as `undefined`.
- An installed (copied) plugin doesn't change when its source folder does: install it again to update it, or add the folder for development while you work on it.

## Trying one

1. Settings › Plugins › **Add folder for development…** and pick the plugin's folder. It's loaded from there on every start, so edit, then reload.
2. Turn it on (the app asks you to trust it), then press **Reload**.
3. **Install from folder…** copies a plugin into the app data folder (`<appData>/plugins/<id>/`), replacing an older copy.

`examples/plugins/callout/` is a complete plugin in plain JavaScript: an element type (`TextBoxKind`), its tool with the `O` key, a toolbar button with an SVG icon, a color panel, the `create_callout` agent tool, and its text in English and Spanish (`locales/`).
