# Services

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

## Services

- **Services** (`canvas/services/`): `defineService(id, (doc) => facade)` is a typed token, and `engine.service(def)` (or `ctx.service(def)` in tools, `useService(def)` in React) creates the facade on first use, once per engine. Facades must need no cleanup (they observe through a `DocumentFeed`). The board's are `DB_SCHEMA` (`DbSchema`) and `ER_MODEL` (`ErModel`).
