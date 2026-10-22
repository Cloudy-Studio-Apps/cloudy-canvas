# Plugins

A plugin adds to Cloudy Canvas without changing its source: element types, tools, toolbar buttons, options panels, side panels, overlays, library items and **agent (MCP) tools**. It's a [module](../CLAUDE.md#modules), the same as the built-in features, loaded from disk when the app starts.

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
- `main`: **one ES module with no imports.** Everything comes from `api`. If you write it in TypeScript or JSX, bundle it into one file and use `api.ui.React.createElement` as the JSX factory. Never bundle your own React.

- `products`: `["board"]`, `["design"]` or both.

`main.js` exports `activate(api)` by default, returning one module or a list of them (for the one product in `products`), or `{ board: [...], design: [...] }` for a plugin of both:

```js
export default function activate(api) {
  return api.core.defineModule({
    id: "my-plugin",
    register(host) {
      host.contribute(api.board.canvas.kinds, new MyKind());
      host.contribute(api.board.editor.tools, {
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

Each tool is one entry on `api.board.editor.tools`:

| Field                  | What it does                                                                                                                                                                                                                                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tool`                 | The tool's id (the one given to `api.board.canvas.tools`).                                                                                                                                                                                                                                                                                         |
| `icon`                 | A Lucide icon or `{ svg: "<svg…>" }` (drawn at the text's color with `currentColor`).                                                                                                                                                                                                                                                              |
| `element`              | For a tool that adds an element: its type. The name and description come from the element kind's `label` and `description`.                                                                                                                                                                                                                        |
| `label`, `description` | For other tools, instead of `element`.                                                                                                                                                                                                                                                                                                             |
| `toolbar`              | `{ group, order, menu }`: its button on the main toolbar; tools with the same `menu` (e.g. `"shapes"` in designs) share one button with a chevron listing them. Group 0 holds select and hand, group 1 the tools that add elements (built-ins use orders 10 to 100, so 110 and up come after them). Leave it out to keep the tool off the toolbar. |
| `library`              | Its card in the library (Shift+I). Tools with an `element` are listed by default; `{ section, order, keywords }` changes where and how, and `false` keeps one out. Other tools are only listed with a placement.                                                                                                                                   |
| `subTools`             | `[{ id, label }]`: tools picked from this tool's panel, which keep its button active.                                                                                                                                                                                                                                                              |

So a plugin that adds an element always shows it in the library, with the icon, name and description it gave. Whether it also gets a toolbar button is its choice.

## The API

| `api.…`  | What it holds                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `plugin` | `id`, `manifest`, `readAsset(path)`, `readText(path)` (files in the plugin's folder)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `core`   | `defineModule`, `definePoint` (points other plugins can extend), `createId`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `canvas` | the kind bases `ElementKind` (set `rotatable` for elements that turn; the engine draws and hits them turned and your kind works unturned), `BoxKind`, `TextBoxKind`, `LineKind`; `elementBounds`, `rotatePoint`, `toUnrotated`; `ELEMENT_DEFAULTS`, `createElementBase`, `defineService`, `selectAndEdit`; helpers `clamp`, `roundPoint`, `fitInView`, `pastThreshold` with `DRAW_THRESHOLD_PX`/`MOVE_THRESHOLD_PX`, `FreehandTool` (a freehand drawing tool's base), `smoothPoints`, and for text `textFont`, `measureTextBlock`, `fontFamilyList` (a kind's `fonts(el)` asks the engine to load the faces its text uses); for agent tools `asUndoStep`, `buildElement`, `summarizeElement` and the argument readers (`stringArg`, `optionalNumber`, …) |
| `ui`     | `React` (the app's own), `toast`, `notifyError`, `FloatingPanel`, `PanelDivider`, `ToolButton`, `OptionButton`, `ColorSwatch`, `ColorPalette`, `ExtensionIconView`, `useEngine`, `useEngineState`, `useService`, `useEngineElement`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `design` | see [Design plugins](#design-plugins)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `board`  | the points: `canvas` (kinds, tools, hostCommands, keybindings, options, links, resolveElements, withMembers, alignTarget, onRemove, prepareCopies, pasteText, pasteImage), `editor` (tools, toolPanels, selectionPanels, sidePanels, topBar, overlays, sessionHooks, contextMenu), `agentTools`, `library`; plus `toolItem`, `requireBoard` and `palette`                                                                                                                                                                                                                                                                                                                                                                                                |

What each point takes is described in CLAUDE.md (Modules, Canvas engine, Elements) and in the types in `src/canvas/modules/canvas-points.types.ts` and `src/canvas-ui/modules/editor-points.types.ts`.

Agent tools are groups contributed to `api.board.agentTools`: `{ id, tools: ({ kinds }) => [{ name, description, inputSchema, run(host, args) }] }`. They're listed by the app's MCP server like the built-in ones, and `list_plugins` tells agents which plugin adds what. Tool names must be unique; a tool whose name is taken is left out.

## Design plugins

Designs are built from modules the same way, on their own points (`api.design`):

| `api.design.…` | What it holds                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `canvas`       | the design's canvas points (same as the board's, plus `view`, `drawOrder`, `clips`, `selectTarget`, `editElement`, `onMoved`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `editor`       | the editor points shared with the board (`tools`, `toolPanels`, `overlays`, `sessionHooks`, `contextMenu`, …) plus `leftTabs` (a tab of the left panel, with its rail button), `propertySections` (a section of the properties panel, shown `when` the selection fits), `toolSidebars` (what the properties panel shows while a tool is on, like the frame presets), `layerIcons` (layer icons for types no tool creates); the shared editor points include `toolbars` (a toolbar shown instead of the main one while its tools are on, like the vector edit mode) and `mainMenu` (groups in the logo's menu: engine commands or `run({ engine, navigate })`)                          |
| `nodes`        | the kind bases: `DesignNodeKind` (every design element: name, parent, visibility, opacity, fills, strokes; a container overrides `contentClip(el)` to clip its children), `BoxShapeKind` (a box-drawn shape: `createNode`, `clickSize`) and `PointsShapeKind` (a shape outlined by `points(el)`: drawing and hit testing come with it); the tools: `NodeDrawTool` (the drawing gesture, template method) and `BoxDrawTool` (draws any `BoxShapeKind`: `new BoxDrawTool(ctx, kind)`); helpers `createNodeBase`, `isDesignNode`, `solidPaint`, `imagePaint`, `drawPaints`, `traceBox`, `NODE_DEFAULTS`, `containerAt`, `parentFor`, `pointsInBox`, `pointInPolygon`, `distanceToOutline` |
| `network`      | vector networks: `polylineNetwork`, `polygonNetwork`, `rectNetwork`, `ellipseNetwork`, `placeNetwork`, `scaleNetwork`, `networkBounds`, `hitSegment`, `vertexAt`, `insideRegion`, `traceStrokes`, `traceRegions`, the edits (`splitSegment`, `connect`, `addVertex`, `moveVertices`, `setTangent`, `removeParts`, `cutSegment`, `bendSegment`, `toggleSmooth`), and the edit mode's `VectorEditTool`, `VECTOR_EDIT`, `VECTOR_TOOLS`. A shape converts to a vector on double-click when its `BoxShapeKind` gives a `vectorNetwork(el)`.                                                                                                                                                 |
| `tree`         | `DESIGN_TREE`, the layer tree service (`api.ui.useService(api.design.tree).layers(engine.scope)`: the page on screen; `null` for every page)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `pages`        | `DESIGN_PAGES`, the pages service (`pages()`, `add`, `rename`, `duplicate`, `remove`, `reorder`, `moveNodes`); the page on screen is `engine.scope`, shown with `engine.setScope(id)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `panel`        | `PanelSection`, `PanelIconButton`, `PanelAddButton`, `PropertyGrid`, `FieldBox`, `NumberField`, `HexInput`, `PercentInput`, `PaintField`, and fields bound to the selection: `NodeNumberField`, `NodeSelectField`, `NodeCheckbox` (`read(node)` and `patch(value)`, "Mixed" when nodes differ, one undo step), `sharedValue`                                                                                                                                                                                                                                                                                                                                                           |
| `sections`     | filters for `propertySections`' `when`: `ofType(...types)`, `allKinds((kind) => …)`, `someNodes`, `noNodes`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `hooks`        | `useSelectedNodes`, `useEditNodes` (patches as one undo step), `useMoveNodes`, `useDesignEngine`, `useDesignState`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

Every design element extends `DesignNodeKind`, so the built-in sections (Position, Layout, Appearance, Fills, Strokes, Export) and the Layers tab work with it without extra code. Nodes carry the page they're on (`pageId`); `createNodeBase` leaves it empty and the canvas puts a node on the page on screen when it's added, so kinds and tools never set it. A shape outlined by corners only gives its points; `BoxDrawTool` draws it from the kind, so there's no tool to write. A star, for example:

```js
export default function activate(api) {
  const { PointsShapeKind, BoxDrawTool, createNodeBase, solidPaint, pointsInBox } =
    api.design.nodes;

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
      host.contribute(api.design.canvas.kinds, kind);
      host.contribute(api.design.canvas.tools, {
        id: kind.tool,
        create: (ctx) => new BoxDrawTool(ctx, kind),
        keys: [{ key: "s", shift: true }],
      });
      host.contribute(api.design.editor.tools, {
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

Design agent tools are groups contributed to `api.design.agentTools`, like the board's (`run(host, args)` gets the design host; `api.design.requireDesign(host)` is the open design, `{ engine, path, … }`). A kind agents may create with `create_nodes` sets `creatable = true`, lists its own fields in `specProperties` and overrides `nodeFromSpec(spec, index, context)` (`BoxShapeKind` already does: `w`/`h` or its click size, named with `context.nameFor(label)`); `update_nodes` checks patches with its `completePatch` (call `super.completePatch` for the shared fields: paints, opacity, parent).

## Rules

- **Name everything after the plugin:** element types, tool ids, option keys and agent tool names, so they don't collide with the app or other plugins. When a plugin collides (a type, tool or command that's already taken, an option given twice), it's turned off with the reason shown in Settings › Plugins, and the board opens without it.
- Elements of a plugin that's off or uninstalled stay in the file untouched; they're just not shown until it's back.
- Plugins load once, when the app starts. Changes apply after a reload.
- Reading something that isn't in the API (a typo, or a name from another version, e.g. `api.board.editor.toolbar`) throws right away, naming it, and the plugin is marked as failed with that message.
- An installed (copied) plugin doesn't change when its source folder does: install it again to update it, or add the folder for development while you work on it.

## Trying one

1. Settings › Plugins › **Add folder for development…** and pick the plugin's folder. It's loaded from there on every start, so edit, then reload.
2. Turn it on (the app asks you to trust it), then press **Reload**.
3. **Install from folder…** copies a plugin into the app data folder (`<appData>/plugins/<id>/`), replacing an older copy.

`examples/plugins/callout/` is a complete plugin in plain JavaScript: an element type (`TextBoxKind`), its tool with the `O` key, a toolbar button with an SVG icon, a color panel and the `create_callout` agent tool.
