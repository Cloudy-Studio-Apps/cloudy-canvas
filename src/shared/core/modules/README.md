# Modules

_How it works. The rules are in the root [CLAUDE.md](../../../../CLAUDE.md)._

A feature is **one folder with one register file**: `products/<product>/modules/<name>/` holds its engine code (plain TS, the element folder's files, its tool, options type, agent tools), a `ui/` folder (React) and `<name>.module.ts`, which plugs it into every place it needs. Built-ins and plugins use the same API; only the module file and `ui/` may use React (ESLint).

## The API

- **The API** (`shared/core/modules/`): `definePoint<T>(id, { keyOf? })` is an `ExtensionPoint<T>`, a typed token exported next to the code that reads it (keyed points throw on a duplicate key, naming both modules). `defineModule({ id, tier?, requires?, uses?, after?, exports?, register(host) })` (`tier`: `"core"` or `"feature"` for built-in modules, see `docs/modules.md`; unset for plugins'); `register` calls `host.contribute(point, ...items)`. `createModuleHost(modules)` sorts them (`requires` must be loaded and orders, `uses` must be loaded in any order, `after` only orders; cycles throw), runs every `register` and is read-only afterwards (`host.get(point)`, `host.find(point, key)`).
- **Exports** (`AppModule.exports`, `ModuleExports`): a module's public API, which built-in modules set to their `index.ts` and `ui/index.ts` (`exports: { ...frame, ...frameUi }`). `host.require(id)` returns that object to a module that lists `id` in `requires` or `uses`; it's how a plugin uses another module (built-in or another plugin's), while built-in features keep importing the module's `index.ts`. It throws, naming both modules, when called after registering, for an id that isn't in `requires`/`uses`, or for a module without `exports`.
