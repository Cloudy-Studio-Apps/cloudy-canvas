# Database code export

The board's database schema (or one table) exported as a framework's code: models, migrations,
entities and DDL scripts, each written the way that framework writes them, for the version the user
picks. Opened from the database panel's Export code button (the shown table, or the whole schema)
or the selection's context menu.

- **Tier:** feature
- **Requires:** db
- **Contributes:** `boardCodeTargets` (the built-in targets); boardCanvas: `hostCommands`
  (`db.exportCode`); boardEditor: `contextMenu`, `overlays` (the dialog), `sessionHooks` (the
  command); db's `dbPanelActions` (the button)
- **Points it owns:** `boardCodeTargets` (`db-export.points.ts`): the frameworks the schema exports
  to; plugins add theirs through `api.board.boardCodeTargets` (see `docs/plugins.md`)
- **MCP tools:** —
- **Files:** `model/` (`CodeSchema`), `code/` (naming and writing helpers), `targets/` (the target
  types, the registry, `exportCode` and one folder per framework), `db-export.commands.ts`,
  `db-export.sections.ts`, `ui/` (the dialog)

## How it works

Four layers, each reading only the ones above it:

1. **`model/`**: `toCodeSchema(source, ids?)` turns the board's `DbSchema` (any `SchemaSource`:
   `tables()`, `enums()`) into `CodeSchema`, the neutral view targets read. Tables come in foreign
   key order (`dependencyOrder`: Kahn's order, self-references ignored; a cycle is broken by
   deferring the foreign key that closes it, `deferred`). Relations are written from the foreign
   key side (`<` refs are flipped), `<>` ones go in `manyToMany`. Column types are canonical
   (`serial`/`bigserial` become `integer`/`bigint` with `increment`), arguments are numbers,
   defaults are typed (`CodeDefault`), enum columns name their enum, a `pk` index is the primary
   key. Relations with a table left out stay foreign keys marked `external`, and that table is in
   `missing` with a warning. The only part that reads the db module.
2. **`code/`**: helpers that know no framework: `words`, `toPascal`/`toCamel`/`toSnake`/`toKebab`/
   `toConstant`, `singular`/`plural` (the last word only, with irregulars and uncountables),
   `className` (`order_items` → `OrderItem`), `collisions` and `uniqueNames` (`OrderItem2`),
   `RESERVED` words per language, `indexName` and `CodeWriter` (lines, blocks, indentation; no blank
   line before a closing bracket).
3. **`targets/`**: `CodeTargetDefinition` (`defineCodeTarget`): an `id`, a `label`, `profiles`
   (versions, newest first, as plain `flags` data the generator reads, e.g. Laravel's
   `castsMethod`), `options` (declared, so the dialog draws them without knowing the target) and
   `generate(schema, request)` → `{ files, warnings }`. A request's `mode` is `single` (only
   `request.table`, read with `focusTables`; the schema still holds every table so relations
   resolve) or `project`. `exportCode(source, target, request)` is what the dialog and agent tools
   call: it builds the schema, fills profile and option defaults and, in single mode, keeps only
   the warnings about that table. Targets are read only through `codeTargets`
   (`CodeTargetRegistry`, pointed at the module host with `useSource`, the built-ins outside an
   editor). A `CodeWarning` is an `id` and `params`; `warningText` gives its text (`warnings.<id>` in
   the locales), agent tools return it raw. A target never imports another; shared logic goes in
   `code/` or its family's folder (`sql/`). Each folder holds `<id>.target.ts`, `profiles.ts` when it
   has several, a type map and one `write-<thing>.ts` per kind of file.
   - `sql/`: `writeDdl` with a `SqlDialect` per database (`mysql.dialect.ts`, `postgres.dialect.ts`:
     quoting, types, increments, enums, defaults, comments, index methods). One `schema.sql` (single
     mode: `<table>.sql`): enum types, tables with inline foreign keys, indexes, comments, then
     `ALTER TABLE` for deferred foreign keys.
   - `laravel/`: models (`write-model.ts`: `$table`/`$primaryKey`/`$keyType`/`$incrementing`/
     `$timestamps` only when Laravel wouldn't guess them, `HasUuids`, `SoftDeletes`, `$fillable`,
     casts, relations from `model-relations.ts` with keys only when not Laravel's defaults and
     `belongsToMany` when Laravel's pivot table is in the schema), one create migration per table
     (`write-migration.ts`, `blueprint-column.ts`: `id()`, `foreignId()->constrained()`, `enum`,
     `timestamps()`, `softDeletes()`, indexes, `rawIndex` for expressions), a last migration for
     deferred foreign keys and string-backed enums in `app/Enums`. Single mode: the model only.
4. **`ui/`**: `CodeExportDialog` (an overlay, open while `useCodeExportStore` holds ids: `[]` for the
   whole schema): with one table, a This table / Whole schema switch; the target, version and
   option fields (`TargetFields`); the file tree (`CodeFileList`, `fileTree`); the warnings; the
   selected file read-only (`CodePreview`, the `CodeEditor` with `readOnly`, no syntax colors yet).
   Copy puts the selected file on the clipboard; Save (`useSaveCode`) writes one file through the
   save dialog and several into a folder (`exportFiles`, asking before replacing files with
   `OverwriteDialog`; a zip in the browser). The last target, version and options are remembered
   while the app is open.
