# Database code export

The board's database schema (or one table) exported as a framework's code: models, migrations,
entities, DDL scripts, each written the way that framework writes them, for the version the user
picks.

- **Tier:** feature
- **Requires:** db
- **Contributes:** `boardCodeTargets` (the built-in targets)
- **Points it owns:** `boardCodeTargets` (`db-export.points.ts`): the frameworks the schema exports
  to; plugins add theirs through `api.board.boardCodeTargets` (see `docs/plugins.md`)
- **MCP tools:** —
- **Files:** `model/` (`CodeSchema`), `code/` (naming and writing helpers), `targets/` (the target
  types, the registry and one folder per framework)

## How it works

Four layers, each reading only the ones above it:

1. **`model/`**: `CodeSchema`, the neutral view of the exported tables and enums that targets
   read. The only part that reads the db module.
2. **`code/`**: helpers that know no framework.
3. **`targets/`**: `CodeTargetDefinition` (`defineCodeTarget`): an `id`, a `label`, `profiles`
   (versions, newest first, as plain `flags` data the generator reads), `options` (declared, so the
   dialog draws them without knowing the target) and `generate(schema, request)` → `{ files,
warnings }`. Targets are read only through `codeTargets` (`CodeTargetRegistry`, pointed at the
   module host with `useSource`, the built-ins outside an editor). A `CodeWarning` is an `id` and
   `params`; `warningText` gives its text (`warnings.<id>` in the locales), agent tools return it
   raw.
