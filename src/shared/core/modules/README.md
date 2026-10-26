# Modules

_How it works. The rules are in the root [CLAUDE.md](../../../../CLAUDE.md); names may still follow the pre-refactor conventions until their phase (see its Transition table)._

A feature is **one folder with one register file**: `products/<product>/modules/<name>/` holds its engine code (plain TS, the element folder's files, its tool, options type, agent tools), a `ui/` folder (React) and `<name>.module.ts`, which plugs it into every place it needs. Built-ins and plugins use the same API; only the module file and `ui/` may use React (ESLint).

## The API

- **The API** (`shared/core/modules/`): `definePoint<T>(id, { keyOf? })` is an `ExtensionPoint<T>`, a typed token exported next to the code that reads it (keyed points throw on a duplicate key, naming both modules). `defineModule({ id, tier?, requires?, uses?, after?, register(host) })` (`tier`: `"core"` or `"feature"` for built-in modules, see `docs/modules.md`; unset for plugins'); `register` calls `host.contribute(point, ...items)`. `createModuleHost(modules)` sorts them (`requires` must be loaded and orders, `uses` must be loaded in any order, `after` only orders; cycles throw), runs every `register` and is read-only afterwards (`host.get(point)`, `host.find(point, key)`).
