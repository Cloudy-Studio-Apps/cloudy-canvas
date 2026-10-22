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

`main.js` exports `activate(api)` by default, returning one module or a list of them:

```js
export default function activate(api) {
  return api.core.defineModule({
    id: "my-plugin",
    register(host) {
      host.contribute(api.board.canvas.kinds, new MyKind());
      host.contribute(api.board.editor.toolbar, {
        tool: "my-tool",
        element: "my-type",
        icon: { svg: "<svg…>" },
        group: 1,
        order: 200,
      });
    },
  });
}
```

## The API

| `api.…`  | What it holds                                                                                                                                                                                                                                                                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `plugin` | `id`, `manifest`, `readAsset(path)`, `readText(path)` (files in the plugin's folder)                                                                                                                                                                                                                                                           |
| `core`   | `defineModule`, `definePoint` (points other plugins can extend), `createId`                                                                                                                                                                                                                                                                    |
| `canvas` | the kind bases `ElementKind`, `BoxKind`, `TextBoxKind`, `LineKind`; `ELEMENT_DEFAULTS`, `createElementBase`, `defineService`, `selectAndEdit`; for agent tools `asUndoStep`, `buildElement`, `summarizeElement` and the argument readers (`stringArg`, `optionalNumber`, …)                                                                    |
| `ui`     | `React` (the app's own), `toast`, `notifyError`, `FloatingPanel`, `PanelDivider`, `ToolButton`, `OptionButton`, `ColorSwatch`, `ColorPalette`, `ExtensionIconView`, `useEngine`, `useEngineState`, `useService`, `useEngineElement`                                                                                                            |
| `board`  | the points: `canvas` (kinds, tools, hostCommands, keybindings, options, links, resolveElements, withMembers, onRemove, prepareCopies, pasteText, pasteImage), `editor` (toolbar, toolPanels, selectionPanels, sidePanels, topBar, overlays, sessionHooks, contextMenu), `agentTools`, `library`; plus `toolItem`, `requireBoard` and `palette` |

What each point takes is described in CLAUDE.md (Modules, Canvas engine, Elements) and in the types in `src/canvas/modules/canvas-points.types.ts` and `src/canvas-ui/modules/editor-points.types.ts`.

Agent tools are groups contributed to `api.board.agentTools`: `{ id, tools: ({ kinds }) => [{ name, description, inputSchema, run(host, args) }] }`. They're listed by the app's MCP server like the built-in ones, and `list_plugins` tells agents which plugin adds what. Tool names must be unique; a tool whose name is taken is left out.

## Rules

- **Name everything after the plugin:** element types, tool ids, option keys and agent tool names, so they don't collide with the app or other plugins. When a plugin collides (a type, tool or command that's already taken, an option given twice), it's turned off with the reason shown in Settings › Plugins, and the board opens without it.
- Elements of a plugin that's off or uninstalled stay in the file untouched; they're just not shown until it's back.
- Plugins load once, when the app starts. Changes apply after a reload.

## Trying one

1. Settings › Plugins › **Add folder for development…** and pick the plugin's folder. It's loaded from there on every start, so edit, then reload.
2. Turn it on (the app asks you to trust it), then press **Reload**.
3. **Install from folder…** copies a plugin into the app data folder (`<appData>/plugins/<id>/`), replacing an older copy.

`examples/plugins/callout/` is a complete plugin in plain JavaScript: an element type (`TextBoxKind`), its tool with the `O` key, a toolbar button with an SVG icon, a color panel and the `create_callout` agent tool.
