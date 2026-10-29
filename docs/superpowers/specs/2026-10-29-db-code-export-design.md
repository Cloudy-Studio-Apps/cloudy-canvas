# Database schema code export — design

Date: 2026-10-29. Status: design, awaiting approval.

## Intent

A board's database schema (tables and enums, edited as DBML) is usually the plan of a real app's
data layer. Today the only way to take it into code is to copy the DBML and rewrite it by hand as
migrations, models or entities, for every framework the project uses. The board needs a **code
export**: pick a framework and its version, and get the files that framework expects, written the
way that framework writes them, ready to drop into a project.

This is **not** the existing Export (PNG, JPG, PDF, CSV, HTML): that exports a picture of the board.
This exports the schema as source code, so it's a separate button and a separate dialog.

The design must also be a **pattern**: every framework is a pluggable target, every version of it a
small profile, so adding Laravel 14 or a new ORM is adding data or one folder, not editing a switch.

## Goals

- An **Export code** action for the board's database schema.
- **What's exported depends on the selection:**
  - **one table selected → one file, its model** (Laravel `app/Models/OrderItem.php`, Angular
    `order-item.model.ts`, a TypeORM entity, …);
  - **nothing selected / the whole schema → the framework's whole structure** (Laravel: migrations
    - models + enum classes, in Laravel's folders; others: their own layout, see Targets);
  - several tables selected → the whole-structure export limited to those tables (see Selection).
- **Targets and versions for the first release:**

  | Target     | Profiles (versions)                     | Output                                  |
  | ---------- | --------------------------------------- | --------------------------------------- |
  | Laravel    | 11, 12, 13                              | models, migrations, PHP enums           |
  | Angular    | 20, 21, 22                              | model interfaces, enum types, barrel    |
  | NestJS     | 11, with ORM option: Prisma, TypeORM    | `schema.prisma`, or entities + DTOs     |
  | MySQL      | latest (8.4 LTS; confirm 9.x LTS state) | one DDL script                          |
  | PostgreSQL | latest (18; 19 when GA)                 | one DDL script                          |
  | MongoDB    | latest (8.x)                            | one `mongosh` script with `$jsonSchema` |

  Version support as of 2026-10-29: Laravel 13 is current (2026-03-17), 12 has security fixes to
  2027-02-24, 11 is EOL since 2026-03-12 but kept because many projects still run it; Angular 22 is
  current (2026-06-03), 21 supported, 20 is LTS to 2026-11-28; PostgreSQL 19 was at RC1 on
  2026-10-15. The builder re-checks these before shipping.

- **Definitions only, the basics needed to work with the model** (see Targets for each): the class
  or type, its fields typed from the columns, casts, keys, relations, enums. Nothing else.
- **Each framework's own naming conventions** (see Naming).
- A **preview** of every file before saving, then Copy (one file) or Save.
- Plugins can add targets and profiles through an extension point, like ER standards.
- An agent (MCP) tool that returns the same files.

## Non-goals (for now)

- **Exporting from ER diagrams.** Only the database schema exports. (Later, ER → tables in memory
  via `erToTables` with `preview` could feed the same pipeline, so nothing here may assume the input
  came from DB cards; the generators read a neutral model, see Architecture.)
- Services, controllers, repositories, HTTP clients, forms, factories, seeders, policies, tests.
- Custom accessors/mutators beyond casts; business logic of any kind.
- Converting JSON between snake_case APIs and camelCase frontends (Angular interceptors etc.).
- Round-trip import (reading migrations or models back into a schema).
- Writing into a project with merge/diff against existing files; the Design product.

## Anti-goals (a failure even if it technically works)

- Code that doesn't compile, run or migrate in the chosen version, or uses an API that version
  doesn't have.
- Code that ignores the framework's conventions (snake_case Angular fields, camelCase Eloquent
  attributes, a `$table` that Laravel would infer anyway): it must read like a senior in that
  framework wrote it.
- Silently dropping something (a type, an index, a default) the target can't express: it's always
  a **warning** shown in the dialog, and a comment in the file when it fits.
- One generator per version (copy-pasted Laravel 11/12/13): versions are profiles.
- Framework knowledge outside the target's folder (no `if (target === "laravel")` in the dialog).
- Migrations that fail because a foreign key comes before its table.

## Selection

- **No table or enum selected**, or the export started from the schema panel / top bar: the whole
  schema, "project" mode.
- **Exactly one table selected:** "single" mode, the target's one model file (Prisma: that model's
  block plus the enums it uses; SQL targets: that table's `CREATE TABLE` plus the enum types it
  uses). The dialog offers a switch to "Whole schema".
- **Several tables (or an enum) selected:** project mode limited to them. A ref to a table outside
  the set stays a foreign key column (and an FK constraint in migrations/DDL), but no relation
  method or nested type is generated for it, and a warning names the missing tables. Enums used by
  the selected tables are always included. _(Builder's call, approved as a default.)_

## Naming

One shared helper (`toPascal`, `toCamel`, `toKebab`, `toSnake`, `singular`, `plural`; English
inflection with the common irregulars) does every conversion; each target only says which it uses.
For `order_items.order_id`:

| Target           | Type / class                        | Fields                                                                                         | DB names                                                                  |
| ---------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Laravel          | `OrderItem`, `OrderItem.php`        | attributes **snake_case** (`order_id`), relation methods camelCase (`order()`, `orderItems()`) | `order_items`, `order_id`; `$table` only if not the inferred plural snake |
| Angular          | `OrderItem`, `order-item.model.ts`  | `orderId`                                                                                      | —                                                                         |
| TypeORM          | `OrderItem`, `order-item.entity.ts` | `orderId`                                                                                      | `@Entity('order_items')`, `@Column({ name: 'order_id' })`                 |
| Prisma           | `model OrderItem`                   | `orderId`                                                                                      | `@map("order_id")`, `@@map("order_items")`                                |
| SQL / PG / Mongo | —                                   | as written in the schema                                                                       | as written                                                                |

Eloquent attributes stay snake_case: that is the Laravel convention (`$fillable`, casts, `toArray()`
all use the column names); only methods are camelCase. Enum classes are Pascal singular
(`order_status` → `OrderStatus`), cases Pascal (`Laravel`) or the value as written (TS string
unions). Names that collide with a target's reserved words get a warning, not a silent rename.

## Targets

What each generator writes. "Profile flags" are what may differ between versions.

### Laravel (11, 12, 13)

- **Model** `app/Models/<Class>.php`: `namespace App\Models`, `HasFactory` not included (no
  factories). `$table`, `$primaryKey`, `$incrementing = false` + `$keyType = 'string'` (uuid/char
  keys, plus `HasUuids` when the key is a uuid), `$timestamps = false` (when `created_at`/
  `updated_at` aren't both there), `SoftDeletes` when `deleted_at` exists — each only when needed.
  `$fillable`: every column except the primary key and timestamps. `casts()` **method** (11+):
  `boolean`, `integer`, `float`, `decimal:<scale>`, `datetime`, `date`, `array` for json, the enum
  class for enum columns. Relations from refs: `belongsTo` on the FK side; `hasMany` / `hasOne`
  (from `-`) on the target side; `<>` → `belongsToMany` with the pivot table name; typed return
  types (`BelongsTo`, `HasMany`, …).
- **Migrations** `database/migrations/<YYYY_MM_DD_HHMMSS>_create_<table>_table.php`: anonymous
  class, `Schema::create`, the Blueprint method per column type (`id()`, `foreignId()->constrained()`
  when the ref matches Laravel's convention, otherwise `foreign()->references()->on()`), `nullable()`,
  `unique()`, `default()`, `comment()` from notes, indexes, `timestamps()` when both columns exist.
  Timestamps increment per file in **foreign-key dependency order** (cycles: tables first, FKs in a
  last `add_foreign_keys` migration, with a warning). `down()` drops.
- **Enums** `app/Enums/<Name>.php`: string-backed PHP enum.
- Single mode: the model only.
- Profile flags: e.g. PHP minimum (comment only), any Blueprint difference found while building.
  11/12/13 are expected to be nearly identical; that is fine, they're still separate profiles.

### Angular (20, 21, 22)

- **Model** `src/app/models/<kebab>.model.ts`: `export interface <Class>` with camelCase fields
  typed from columns (`number`, `string`, `boolean`, `string` for dates with a comment — JSON has no
  dates, `unknown`/`Record<string, unknown>` for json), `| null` for nullable columns, `?` for
  columns with a database default or increment. Relations as optional fields (`order?: Order`,
  `items?: OrderItem[]`) with `import type`.
- **Enums** `src/app/models/<kebab>.enum.ts`: a string union type plus a `const` array of values.
- Project mode adds `src/app/models/index.ts` (barrel).
- Profile flags: mostly none today (plain TypeScript); the profiles exist so a version that changes
  the default file layout or style guide (e.g. 20's file-naming guide) is one flag.

### NestJS (11) — option `orm`: `prisma` | `typeorm`

- **Prisma:** `prisma/schema.prisma` (datasource provider is an option: `postgresql` default,
  `mysql`): `enum` blocks, `model` blocks, `@id`, `@default(autoincrement())` / `uuid()` / `now()`,
  `@unique`, `@relation(fields, references)` with both sides, `@@index`, `@@unique`, `@map`/`@@map`,
  `@db.VarChar(255)` / `@db.Decimal(10, 2)` from type arguments. Single mode: that model block and
  its enums.
- **TypeORM:** `src/<kebab-plural>/entities/<kebab>.entity.ts` per table (`@Entity`, `@Column` with
  type/length/precision/nullable/default/unique, `@PrimaryGeneratedColumn`, `@ManyToOne` +
  `@JoinColumn`, `@OneToMany`, `@Index`, `@CreateDateColumn`/`@UpdateDateColumn`), and a TS `enum`
  per DBML enum. Option `dtos` (default on): `src/<kebab-plural>/dto/create-<kebab>.dto.ts` with
  `class-validator` decorators from the column flags, and `update-<kebab>.dto.ts` as
  `PartialType(Create…)`. Single mode: the entity (plus its DTOs if on).
- Room for more ORMs (MikroORM, Sequelize, Mongoose) as further `orm` values, not new targets.

### MySQL, PostgreSQL (latest)

- One `schema.sql`: enums (PG `CREATE TYPE … AS ENUM`; MySQL inline `ENUM(...)`), `CREATE TABLE` in
  dependency order, column types mapped per dialect (`serial`/`identity` vs `AUTO_INCREMENT`,
  `jsonb` vs `json`, `uuid` vs `char(36)`), defaults, `NOT NULL`, `UNIQUE`, PKs, FKs (inline, or
  `ALTER TABLE` at the end for cycles), indexes (`USING <method>` for PG), comments from notes
  (`COMMENT ON` / `COMMENT '…'`). Identifiers quoted per dialect.
- Single mode: the table's `CREATE TABLE`, its enum types and indexes.

### MongoDB (latest)

- One `schema.mongodb.js` for `mongosh`: `db.createCollection("<table>", { validator: {
$jsonSchema: … } })` per table (`bsonType` from columns, `required` from `notNull`, `enum` from
  DBML enums), `createIndex` for indexes and unique columns. References become a field of the
  target's id type with a comment; no joins. Increments and SQL defaults can't be expressed:
  warnings.

## Type mapping

Every target maps a column through one table of its own, keyed by the **normalized** column type
(`column-type.ts` already normalizes aliases like `int` → `integer`) and reading `typeArgs`
(length, precision/scale). Unknown types map to the target's most general type (`string`/`text`)
with a warning. Enum columns are detected by their type naming a schema enum.

## The dialog

- **Entry points:** an **Export code** button in the database panel (whole schema, or the selected
  table); the same action in the context menu of a table; a command `db.exportCode` (shortcut in the
  product's keybindings only if one is wanted, none by default).
- **Layout:** left column — target picker (`SelectField`), version picker (the target's profiles,
  newest first, default the newest), the target's own options rendered from its declared options
  (`SelectField` / `SwitchField`), and a Single / Whole schema switch when one table is selected.
  Right — the file tree and a read-only code preview of the selected file (the existing
  `SourceEditor` read-only, with a language per file extension where one exists), and the warnings
  list above it.
- **Actions:** **Copy** (the selected file to the clipboard); **Save**: one file → the native save
  dialog; several → the native folder picker, then the files are written under it with their paths
  (asks before overwriting files that already exist). Browser build: several files download as one
  `.zip`.
- The last target, version and options are remembered per board as view state (not an undo step) or
  in an app UI store; builder's call.
- User-facing text goes through the module's `t` (en + es). Generated code, file names and comments
  inside the code stay English.

## Architecture (the pattern)

```
DbSchema ──▶ toCodeSchema() ──▶ CodeSchema (neutral, plain data)
                                   │
          target.generate(schema, { mode, profile, options, naming }) ──▶ CodeFile[] + warnings
                                   │
                  dialog (preview, copy, save)  /  MCP tool
```

- **New feature module** `src/products/board/modules/db-export/` (`db-export.module.ts`, tier
  `feature`, `requires: ["db"]`), with `README.md`, `index.ts`, `ui/`, `db-export.i18n.ts` and
  `locales/`. It owns the point **`boardCodeTargets`** (`db-export.points.ts`, `definePoint`, keyed
  by id, like `boardErStandards`); built-in targets are contributed by the module itself, plugins
  add theirs through `api.board.boardCodeTargets` (documented in `docs/plugins.md`).
- **`CodeSchema`** (`model/`): a neutral, framework-free view built from `DbSchema`: tables with
  columns (normalized type, args, flags, default, note), resolved relations both ways (by name, not
  ids: `from table.column`, `to table.column`, kind), indexes, enums, notes, and the dependency
  order. Targets never touch the document, kinds or `DbSchema`. (This is also where an ER source
  plugs in later.)
- **`CodeTarget`** (`defineCodeTarget`): `id`, `label`, `language`/icon hint, `profiles:
CodeProfile[]` (`id`, `label` like "Laravel 12", plus the target's own flags as plain data),
  `options: CodeOption[]` (declared select/switch options with defaults, so the dialog renders them
  without knowing the target), and `generate(schema, request) → { files: CodeFile[], warnings:
CodeWarning[] }`. `CodeFile` is `{ path, content, language }`; `CodeWarning` is `{ message,
table?, column? }` (messages are user-facing: through `t`).
- **One folder per target** (`targets/laravel/`, `targets/angular/`, `targets/nestjs/` with
  `prisma/` and `typeorm/`, `targets/sql/` with the `mysql` and `postgres` dialects sharing one DDL
  writer, `targets/mongodb/`): `<id>.target.ts`, `profiles.ts`, a type map, and one small file per
  thing it writes (`model.ts`, `migration.ts`, `enum.ts`, …). Generators are **Strategy** objects;
  version differences are **profile data** read by the strategy, never subclasses per version.
- **Shared helpers** (`code/`): naming (inflection), a tiny code writer (indentation, blocks,
  imports collected and sorted), dependency ordering (topological sort with cycle detection), PHP/TS
  string escaping.
- **Saving**: a `saveCodeFiles(files)` interface in `shared/core` implemented in `platform/` (native
  save / folder picker + writes; browser: zip download), reusing the existing dialog helpers
  (`plugin-folder-dialog.ts`'s folder picker, `file-dialog.ts`). Any Tauri capability change for
  writing into a picked folder is part of the change.
- **MCP:** `export_schema_code` in `db-export.mcp.ts` (read-only, no undo step): `target`,
  `version`, `options`, optional `tables` (names) → the files and warnings, so an agent can write
  them into a project itself. `list_code_targets` returns the targets, profiles and options.
- Engine-side code (`model/`, `code/`, `targets/`) is plain TypeScript (rule 4): no React, no
  platform.

## Done when

- Every target/profile produces the files above for the shop starter schema (`databaseSchemaStarter`)
  and a schema with every column type, enums, all four ref kinds, composite and expression indexes,
  notes and a FK cycle; the builder checks the output by eye (and, where practical, by running it
  once in a scratch project — only if the user asks, per the verification rules).
- Single, selection and whole-schema modes behave as described; warnings show for everything a
  target can't express.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check` pass; READMEs (`db-export/`, the board modules
  list), `docs/plugins.md`, the changelog (en + es, under New) and the locales are updated.

## Left to the builder

- Exact Blueprint/Prisma/TypeORM type tables, and any real per-version differences found while
  writing them (encode as profile flags).
- Where the dialog's last choice is remembered; the file tree component (reuse before writing).
- Whether MySQL "latest" is 8.4 LTS or a 9.x LTS by the time it ships.
- Whether to split the first release (e.g. Laravel + SQL + PostgreSQL first, then Angular, NestJS,
  MongoDB) in the plan; the architecture and the point land in the first step either way.
