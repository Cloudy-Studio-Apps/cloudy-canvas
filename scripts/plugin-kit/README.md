# Plugin kit

Builds a plugin written in TypeScript or JSX, in any folder structure, into the one `main.js` the app
loads ([docs/plugins.md](../../docs/plugins.md)). The format and the API don't change: the build
turns the plugin's imports of the app into reads of the `api` handed to `activate`.

```sh
pnpm plugin:build examples/plugins/my-plugin   # writes examples/plugins/my-plugin/main.js
```

## A plugin's folder

```
my-plugin/
  plugin.json        "main": "main.js"
  main.js            built; don't edit
  src/
    main.ts          (or main.tsx) default-exports what activate returns: a module, a list,
                     or { board: [...], design: [...] }
    …any files and folders, locales/ included
```

`src/` is written like a built-in module ([docs/modules.md](../../docs/modules.md)): it imports the
app by its aliases and its own files relatively. Relative imports must stay inside the plugin's
folder.

## What an import becomes

| Import                                                                                        | Becomes                                                                                   |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `@design/modules/<id>`, `@design/modules/<id>/ui` (board)                                     | the name from `api.design` when the barrel has it, else `host.require(id)`                |
| `@design`, `@design/…`                                                                        | `api.design` (`@design/ui` too)                                                           |
| `@board`, `@board/…`                                                                          | `api.board`                                                                               |
| `@canvas`, `@canvas/…`                                                                        | `api.canvas`                                                                              |
| `@canvas-ui`, `@canvas-ui/…`                                                                  | `api.canvasUi`                                                                            |
| `@shared/core`                                                                                | `api.core`                                                                                |
| `@shared/ui/kit`                                                                              | `api.ui.kit`                                                                              |
| other `@shared/…`, `@platform`                                                                | `api.ui`, else `api.platform` (`CodeEditor`, `toast`, `exportFile`, …)                    |
| `react`, `react-dom`, `lucide-react`, `zustand`, `zustand/middleware`, `@codemirror/language` | `api.libs` (`React`, `createPortal`, `icons`, `createStore`, `persist`, `StreamLanguage`) |
| JSX                                                                                           | `api.libs.React.createElement`                                                            |
| any other npm package                                                                         | bundled into `main.js`                                                                    |
| an image (`.svg`, `.png`, `.jpg`, `.gif`, `.webp`)                                            | its data URL, inside `main.js` (as Vite gives its URL)                                    |

The build fails, one line per import, for `@app/…` and `@pages/…` (not part of the API), a path
inside a module (`@design/modules/frame/frame-presets`: use its `index.ts` or `ui/index.ts`), a
namespace import of the app (`import * as design from "@design"`: name what you use), a library
name `api.libs` doesn't share, and a relative import out of the plugin's folder. A name the api
doesn't have throws when the plugin starts, naming it.

## Rules

- **Import types with `import type`** (or `type X` in the braces). Any other imported name is read
  from `api` when the plugin starts, and a type isn't there.
- **Names from `host.require` are read inside functions, never at a file's top level.** They
  arrive when the plugin's first module registers, after the files have run. That module lists
  the modules they come from in `requires` or `uses` (core modules don't need listing).

## Files

- `build-plugin.mjs`: the command; bundles `src/main` with rolldown (as an IIFE inside
  `activate(__api)`) and wraps each module's `register` to fill the `host.require` names first.
- `imported-names.mjs`: the first pass, the value names each import brings in and the imports a
  plugin can't make.
- `api-imports.mjs`: the import table and the virtual modules that hand out the names.

The kit lives here while the API settles; once version 1 is stable it can become an npm package
(with the API's types) for plugins outside this repo. Until then a plugin in `examples/plugins/`
gets its types from a `tsconfig.json` there that extends the root one (`"extends":
"../../tsconfig.json", "include": ["*/src", "../../src/vite-env.d.ts"]`), added to `pnpm typecheck`
with the first such plugin.
