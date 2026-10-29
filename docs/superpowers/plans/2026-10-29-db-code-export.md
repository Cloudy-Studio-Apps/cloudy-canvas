# Database schema code export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An "Export code" action that turns the board's database schema (or one selected table)
into framework files: Laravel 11/12/13, Angular 20/21/22, NestJS 11 (Prisma or TypeORM), MySQL,
PostgreSQL and MongoDB.

**Architecture:** A new board feature module `db-export` (requires `db`) converts `DbSchema` into
a neutral `CodeSchema`, then hands it to a **target** from the `boardCodeTargets` point (a
Strategy object per framework; versions are `CodeProfile` data, never subclasses). Targets return
`{ files, warnings }`; the dialog previews, copies or saves them, and an MCP tool returns them.

**Tech Stack:** TypeScript (strict, `noUncheckedIndexedAccess`), React 19, Zustand, shadcn kit,
CodeMirror (existing `CodeEditor`), Tauri dialog + fs plugins, `fflate` (already a dependency) for
the browser zip.

**Spec:** `docs/superpowers/specs/2026-10-29-db-code-export-design.md`

## Global Constraints

- **No test framework.** Every task's verification is `pnpm lint`, `pnpm typecheck` and
  `pnpm format:check` (all three must pass). Never run `tauri dev`, cargo, builds or browser checks.
  Where a task lists "expected output", the implementer checks it by reading the generator, not by
  running it.
- Follow `CLAUDE.md` rules; in particular: engine code (`model/`, `code/`, `targets/`) is plain TS
  (no React, no `@platform`, no `@shared/ui`); types in sibling `*.types.ts`; files ≲ 200 lines; UI
  text through the module's `t` with `en.json` + `es.json`; generated code, file paths and code
  comments stay English; MCP text English.
- Read `src/products/board/README.md`, `src/products/board/modules/db/README.md`,
  `docs/modules.md` and `docs/plugins.md` before Task 1.
- `db-export` imports `db` only through `../db` (its `index.ts`) and `../db/ui` (its `ui/index.ts`);
  `scripts/check-modules.mjs` and `scripts/check-public-api.mjs` must pass.
- Never branch on `el.type` in `db-export`: use `isDbTable` / `isDbEnum` from the db barrel.
- Version support (re-check before shipping): Laravel 13 current, 12 security to 2027-02-24, 11 EOL
  2026-03-12 but kept; Angular 22 current, 21 supported, 20 LTS to 2026-11-28; NestJS 11; MySQL
  latest (8.4 LTS unless a 9.x LTS has shipped); PostgreSQL 18 (19 once GA); MongoDB 8.x.
- Commits: conventional style (`feat(db-export): …`), **no** `Co-Authored-By: Claude` line (user rule).
- Naming per target exactly as the spec's Naming table; Eloquent attributes stay snake_case.
- Anything a target can't express produces a `CodeWarning`, never a silent drop.

## Review Focus

1. **Reserved words and quoting:** a table `order`/`user`/`group` or a column `class`/`default`
   must be quoted in SQL (`"order"` PG, `` `order` `` MySQL) and warned about where it is a
   reserved word of PHP/TS (class names) — owned by Tasks 2 (reserved lists) and 4/5/8/9.
2. **Self-references and FK cycles:** `employees.manager_id → employees.id` is *not* a cycle for
   ordering (the FK is in the table's own `CREATE`); a real cycle (`a → b → a`) defers FKs to the
   end (`ALTER TABLE`, a final Laravel migration) with a warning — Task 3 (ordering) and Tasks 4/5.
3. **Composite or missing primary keys:** a `pk` index over two columns → `PRIMARY KEY (a, b)` /
   `$table->primary([...])`, and a Laravel model warning (Eloquent has no composite keys); a table
   with no PK gets a warning in every ORM target — Tasks 3, 4, 5, 9.
4. **Name collisions after conversion:** `order_items` and `order_item` both → `OrderItem`; an
   enum `status` and a table `statuses` both → `Status`. Detected once in `CodeSchema` naming
   checks per target (`collisions(names)` helper, Task 2) and reported as warnings; the second
   file gets a numeric suffix rather than overwriting the first — Tasks 2, 5, 8, 9.
5. **Empty or partial input:** an empty schema disables Save/Copy with an empty-state message; an
   enum-only selection exports just enums; a selection whose refs point outside it keeps the FK
   columns but no relations and lists the missing tables — Tasks 3 and 6.

---

## File structure

The module is split into four layers, and each one reads only the layers above it:

1. **`model/`** turns the board's schema into the neutral `CodeSchema`. It is the only place that
   reads `db`.
2. **`code/`** holds generic helpers that know nothing about frameworks: naming and a code writer.
3. **`targets/`** has one folder per framework. Each one reads `CodeSchema` and returns files. A
   target never imports another target; shared logic goes in `code/`, or in the target family's
   own shared folder (`sql/`).
4. **`ui/`** is the React dialog. It only knows `CodeTargetDefinition`, never a specific target.

Inside every target folder, the files follow the same pattern:

- `<id>.target.ts`: the definition
- `profiles.ts`: the versions
- `type-map.ts`: column type → target type
- `write-<thing>.ts`: one per kind of file the target writes
- `index.ts`

The `(+ .types.ts)` notes mark files that declare types, which go in a sibling file (CLAUDE.md
rule 25).

```
src/products/board/modules/db-export/
├── README.md                         module template: tier, requires, point, MCP tools, files
├── index.ts                          engine barrel (model, code, targets, point): the plugin API
├── db-export.module.ts               wiring only (tier feature, requires ["db"])
├── db-export.points.ts               boardCodeTargets
├── db-export.commands.ts             EXPORT_CODE_COMMAND + its host command
├── db-export.mcp.ts                  list_code_targets, export_schema_code
├── db-export.i18n.ts                 t
├── locales/
│   ├── en.json                       button, dialog, options, save, warnings.*
│   └── es.json
│
├── model/                            ── layer 1: board schema → neutral CodeSchema
│   ├── index.ts
│   ├── code-schema.types.ts          CodeSchema, CodeTable, CodeColumn, CodeRelation, CodeIndex, CodeEnum, CodeDefault
│   ├── to-code-schema.ts             toCodeSchema(schema, ids?)  (+ .types.ts)
│   ├── code-relations.ts             DbRef → CodeRelation (FK side always `from`)
│   ├── dependency-order.ts           Kahn order + deferred cycle FKs  (+ .types.ts)
│   ├── parse-default.ts              raw DBML default → CodeDefault
│   └── parse-args.ts                 "10, 2" → [10, 2]
│
├── code/                             ── layer 2: framework-agnostic helpers
│   ├── index.ts
│   ├── inflect.ts                    singular, plural (irregulars, uncountables)
│   ├── naming.ts                     words, toPascal/Camel/Snake/Kebab, className, collisions, uniqueNames  (+ .types.ts)
│   ├── reserved-words.ts             RESERVED.php / .ts / .mysql / .postgres
│   └── code-writer.ts                CodeWriter (line, block, indent)
│
├── targets/                          ── layer 3: one folder per framework
│   ├── index.ts
│   ├── code-target.types.ts          CodeTargetDefinition, CodeProfile, CodeOption, CodeRequest, CodeOutput, CodeFile
│   ├── define-code-target.ts         defineCodeTarget
│   ├── code-target-registry.ts       CodeTargetRegistry, codeTargets (useSource)
│   ├── built-in-targets.ts           BUILT_IN_CODE_TARGETS
│   ├── warnings.ts                   warn, warningText
│   ├── warnings.types.ts             CodeWarning, CodeWarningId
│   │
│   ├── sql/                          MySQL + PostgreSQL share one DDL writer
│   │   ├── index.ts
│   │   ├── sql-dialect.types.ts      SqlDialect
│   │   ├── mysql.dialect.ts
│   │   ├── postgres.dialect.ts
│   │   ├── mysql.target.ts
│   │   ├── postgres.target.ts
│   │   ├── write-ddl.ts              file order: enums, tables, indexes, deferred FKs, comments
│   │   └── write-table.ts            one CREATE TABLE
│   │
│   ├── laravel/
│   │   ├── index.ts
│   │   ├── laravel.target.ts
│   │   ├── profiles.ts               13, 12, 11
│   │   ├── type-map.ts               column → Blueprint method / cast
│   │   ├── write-model.ts            app/Models/<Class>.php
│   │   ├── model-casts.ts            casts() body
│   │   ├── model-relations.ts        belongsTo / hasMany / hasOne / belongsToMany methods
│   │   ├── write-migration.ts        database/migrations/<ts>_create_<table>_table.php (+ add_foreign_keys)
│   │   ├── blueprint-column.ts       one $table->… line
│   │   └── write-enum.ts             app/Enums/<Class>.php
│   │
│   ├── angular/
│   │   ├── index.ts
│   │   ├── angular.target.ts
│   │   ├── profiles.ts               22, 21, 20
│   │   ├── type-map.ts               column → TS type
│   │   ├── write-model.ts            src/app/models/<kebab>.model.ts
│   │   ├── write-enum.ts             src/app/models/<kebab>.enum.ts
│   │   └── write-barrel.ts           src/app/models/index.ts
│   │
│   ├── nestjs/
│   │   ├── index.ts
│   │   ├── nestjs.target.ts          options: orm, provider, dtos → prisma/ or typeorm/
│   │   ├── profiles.ts               11
│   │   ├── prisma/
│   │   │   ├── write-prisma.ts       prisma/schema.prisma
│   │   │   ├── prisma-type-map.ts
│   │   │   └── prisma-relations.ts   both sides of @relation
│   │   └── typeorm/
│   │       ├── write-entity.ts       src/<plural>/entities/<kebab>.entity.ts
│   │       ├── typeorm-column.ts     one @Column / @PrimaryGeneratedColumn / …
│   │       ├── write-dto.ts          src/<plural>/dto/create-… and update-….dto.ts
│   │       └── write-enum.ts         src/common/enums/<kebab>.enum.ts
│   │
│   └── mongodb/
│       ├── index.ts
│       ├── mongodb.target.ts
│       ├── bson-type-map.ts
│       └── write-script.ts           schema.mongodb.js (createCollection + $jsonSchema, createIndex)
│
└── ui/                               ── layer 4: React, knows only CodeTargetDefinition
    ├── index.ts
    ├── code-export-store.ts          useCodeExportStore  (+ .types.ts)
    ├── use-export-code-command.ts    handles db.exportCode
    ├── use-code-output.ts            toCodeSchema + generate, memoized  (+ .types.ts)
    ├── export-code-button.tsx        db panel header action  (+ .types.ts)
    ├── code-export-dialog.tsx        layout, footer (Copy / Save)
    ├── target-fields.tsx             target, version, options  (+ .types.ts)
    ├── code-file-list.tsx            file tree grouped by folder  (+ .types.ts)
    ├── code-preview.tsx              read-only CodeEditor  (+ .types.ts)
    └── code-warnings.tsx             warning list  (+ .types.ts)
```

To add a new framework, create a new folder in `targets/` and add one line to
`built-in-targets.ts`. To add a new version, add one entry to that target's `profiles.ts`. A
plugin does the same through `api.board.boardCodeTargets`.

Modified elsewhere:
- `src/products/board/modules/index.ts` — `export * from "./db-export";`
- `src/products/board/ui/modules/board-modules.ts` — add `dbExportModule` after `dbModule`
- `src/products/board/modules/db/db.points.ts` (new) + `db/db.module.ts`, `db/index.ts`,
  `db/ui/db-panel/db-panel.tsx`, `db/README.md` — `dbPanelActions` point
- `src/shared/ui/components/code-editor/code-editor.tsx` + `.types.ts` — `readOnly`
- `src/platform/export-files.ts` (+ `.types.ts`), `src/platform/index.ts`
- `docs/plugins.md`, `src/products/board/README.md`, `CHANGELOG.md`, `CHANGELOG.es.md`

---

### Task 1: Module skeleton, `CodeSchema` types, targets point and registry

**Files:**
- Create: `db-export.module.ts`, `db-export.points.ts`, `db-export.i18n.ts`, `locales/en.json`,
  `locales/es.json`, `index.ts`, `README.md`, `model/code-schema.types.ts`, `model/index.ts`,
  `targets/code-target.types.ts`, `targets/define-code-target.ts`,
  `targets/code-target-registry.ts`, `targets/built-in-targets.ts` (empty array for now),
  `targets/warnings.ts`, `targets/warnings.types.ts`, `targets/index.ts`
- Modify: `src/products/board/modules/index.ts`, `src/products/board/ui/modules/board-modules.ts`,
  `src/products/board/README.md` (modules list), `docs/plugins.md` (new point)

**Interfaces:**
- Produces (`model/code-schema.types.ts`):

```ts
export type CodeDefault =
  | { kind: "number" | "string" | "boolean" | "null"; value: string }
  | { kind: "expr"; value: string }; // DBML `backtick` expression, e.g. now()

export interface CodeColumn {
  name: string;
  /** Canonical type name (`canonicalTypeName`), without `[]`. */
  type: string;
  array: boolean;
  /** Parsed `typeArgs`: `varchar(255)` → [255]; `decimal(10, 2)` → [10, 2]; non-numeric → []. */
  args: number[];
  pk: boolean; // true also when part of a composite pk index
  increment: boolean;
  notNull: boolean; // pk columns count as notNull
  unique: boolean;
  default: CodeDefault | null;
  note: string;
  /** Name of the schema enum this column's type names, or null. */
  enum: string | null;
}

/** Always written from the FK side: `from` holds the foreign key column. */
export interface CodeRelation {
  from: { table: string; column: string };
  to: { table: string; column: string };
  kind: "many-to-one" | "one-to-one" | "many-to-many";
  /** The other end is outside the exported tables. */
  external: boolean;
}

export interface CodeIndex {
  name: string; // "" when unnamed
  columns: string[];
  exprs: string[];
  unique: boolean;
  pk: boolean;
  method: string; // "" = database default
}

export interface CodeTable {
  name: string;
  note: string;
  columns: CodeColumn[];
  indexes: CodeIndex[];
  primaryKey: string[]; // [] when none
  /** Relations whose `from.table` is this table (many-to-one, one-to-one). */
  outgoing: CodeRelation[];
  /** Relations whose `to.table` is this table. */
  incoming: CodeRelation[];
}

export interface CodeEnum { name: string; values: { name: string; note: string }[] }

export interface CodeSchema {
  /** In FK dependency order (a table after the tables it references; self-refs ignored). */
  tables: CodeTable[];
  enums: CodeEnum[];
  /** FKs that close a cycle: written after every table (ALTER / final migration). */
  deferred: CodeRelation[];
  manyToMany: CodeRelation[];
  /** Tables named by relations but not exported. */
  missing: string[];
}
```

- Produces (`targets/code-target.types.ts`):

```ts
export type CodeLanguage = "php" | "ts" | "sql" | "prisma" | "js";
export interface CodeFile { path: string; content: string; language: CodeLanguage }
export type CodeOptionValue = string | boolean;
export type CodeOption =
  | { id: string; kind: "select"; label: () => string; default: string;
      choices: { value: string; label: () => string }[] }
  | { id: string; kind: "switch"; label: () => string; default: boolean };
export interface CodeProfile {
  id: string;            // "13", "22", "latest"
  label: string;         // "Laravel 13" — a product name, not translated
  flags: Readonly<Record<string, string | number | boolean>>;
}
export interface CodeRequest {
  mode: "single" | "project";
  profile: CodeProfile;
  options: Readonly<Record<string, CodeOptionValue>>;
  /** Export time, for Laravel migration names; passed in so output is deterministic per call. */
  now: Date;
}
export interface CodeOutput { files: CodeFile[]; warnings: CodeWarning[] }
export interface CodeTargetDefinition {
  id: string;            // "laravel", "angular", "nestjs", "mysql", "postgres", "mongodb"
  label: string;         // "Laravel"
  /** Newest first; the first is the default. */
  profiles: readonly CodeProfile[];
  options: readonly CodeOption[];
  generate(schema: CodeSchema, request: CodeRequest): CodeOutput;
}
```

- Produces (`targets/warnings.types.ts`): `CodeWarning { id: CodeWarningId; params: Record<string,
  string>; table?: string; column?: string }` with `CodeWarningId` a string union that grows per
  task (start with `"missing-table" | "unknown-type" | "reserved-word" | "name-collision" |
  "no-primary-key" | "composite-key" | "fk-cycle" | "unsupported"`). `targets/warnings.ts`:
  `warn(id, params, at?: { table?: string; column?: string }): CodeWarning` and
  `warningText(w: CodeWarning): string` = `t(\`warnings.${w.id}\`, w.params)` (UI only). The MCP
  returns `id`/`params` raw, so it stays English.
- Produces: `defineCodeTarget(def: CodeTargetDefinition): CodeTargetDefinition` (identity, for
  typing, like `defineErStandard`); `CodeTargetRegistry` with `useSource`, `list()`, `get(id)` —
  copy the shape of `er/base/standards/er-standard-registry.ts`; `export const codeTargets`.
- Produces (`db-export.points.ts`): `export const boardCodeTargets =
  definePoint<CodeTargetDefinition>("board.codeTargets", { keyOf: (t) => t.id });`
- `dbExportModule`: `defineModule({ id: "db-export", tier: "feature", requires: ["db"], exports:
  { ...api, ...ui }, register(host) { host.contribute(boardCodeTargets, ...BUILT_IN_CODE_TARGETS);
  codeTargets.useSource(() => host.get(boardCodeTargets)); } })`.

- [ ] **Step 1:** Create the files above; README in the module template (Tier, Requires,
  Contributes, Points it owns: `boardCodeTargets`, MCP tools: none yet, Files, How it works).
  Locale files start with `warnings.*` keys for every `CodeWarningId` (en + es).
- [ ] **Step 2:** Register the module in `board-modules.ts` after `dbModule`; export the engine
  side from `modules/index.ts`; document `boardCodeTargets` in `docs/plugins.md` next to
  `boardErStandards` (`api.board.boardCodeTargets`, `defineCodeTarget`).
- [ ] **Step 3:** Run `pnpm lint && pnpm typecheck && pnpm format:check` — all pass.
- [ ] **Step 4:** Commit `feat(db-export): module skeleton and code targets point`.

### Task 2: Naming and code-writing helpers

**Files:**
- Create: `code/inflect.ts`, `code/naming.ts`, `code/naming.types.ts`, `code/reserved-words.ts`,
  `code/code-writer.ts`, `code/index.ts`

**Interfaces:**
- Produces:
  - `words(name: string): string[]` (splits snake, kebab, camel, Pascal, spaces; lowercases)
  - `toPascal`, `toCamel`, `toSnake`, `toKebab` `(name: string) => string`
  - `singular(word: string): string`, `plural(word: string): string` — inflect only the **last**
    word (`order_items` → `order_item`). Rules: irregulars (`person/people`, `child/children`,
    `man/men`, `woman/women`, `mouse/mice`, `datum/data`, `index/indices`), uncountables (`data`,
    `information`, `equipment`, `series`, `species`, `news`, `metadata`), `-ies/-y`, `-ses/-s`,
    `-xes`, `-ches`, `-shes`, `-ves/-f(e)`, default `-s`.
  - `className(table: string): string` = `toPascal(singular(table))` (`order_items` → `OrderItem`)
  - `RESERVED: { php: ReadonlySet<string>; ts: ReadonlySet<string>; mysql: ReadonlySet<string>;
    postgres: ReadonlySet<string> }` (lowercase; PHP class-name reserved words incl. `class`,
    `list`, `match`, `enum`, `object`, `string`, `int`, `float`, `bool`, `array`, `parent`, `self`;
    the usual SQL keyword lists incl. `order`, `user` (PG), `group`, `select`, `table`, `key`)
  - `collisions(names: { source: string; converted: string }[]): { converted: string; sources:
    string[] }[]` and `uniqueNames(names: string[]): string[]` (second `OrderItem` → `OrderItem2`)
  - `class CodeWriter { line(text?: string): this; block(open: string, close: string, body: () =>
    void): this; indent(body: () => void): this; toString(): string }` — 4 spaces for PHP, 2 for
    TS/Prisma/SQL/JS: constructor `new CodeWriter(indent: string)`; output ends with one `\n`.

- [ ] **Step 1:** Implement the helpers (no dependencies).
- [ ] **Step 2:** Expected (check by reading): `className("people") = "Person"`,
  `className("categories") = "Category"`, `className("order_status") = "OrderStatus"`,
  `toCamel("order_id") = "orderId"`, `toKebab("OrderItem") = "order-item"`,
  `plural("category") = "categories"`.
- [ ] **Step 3:** Verify lint/typecheck/format pass. Commit `feat(db-export): naming and code writer`.

### Task 3: `toCodeSchema`

**Files:**
- Create: `model/to-code-schema.ts`, `model/code-relations.ts`, `model/dependency-order.ts`,
  `model/parse-default.ts`, `model/parse-args.ts` (+ `.types.ts` where they declare types)

**Interfaces:**
- Consumes: `DbSchema` (`tables()`, `enums()`), `DbTableElement`, `DbColumn`, `DbIndex`, `DbRef`,
  `canonicalTypeName` from `../db`.
- Produces: `toCodeSchema(schema: DbSchema, ids?: readonly string[]): { schema: CodeSchema;
  warnings: CodeWarning[] }` — `ids` are table/enum element ids; omitted = everything. Enums used by
  an exported table are always included.
- Produces: `dependencyOrder(tables: CodeTable[]): { order: CodeTable[]; deferred: CodeRelation[] }`
  — Kahn's algorithm on outgoing non-self, non-external relations; ties keep the board order
  (`DbSchema.tables()` order); when a cycle remains, defer the relation whose `from` table comes
  last in board order and continue.

Relation normalization (`code-relations.ts`), from the owning column `c` of table `T` with
`ref { tableId, columnId, kind }` pointing at `U.d`:
- `">"` → `{ from: T.c, to: U.d, kind: "many-to-one" }`
- `"<"` → `{ from: U.d, to: T.c, kind: "many-to-one" }` (the FK is on the other side)
- `"-"` → `{ from: T.c, to: U.d, kind: "one-to-one" }`
- `"<>"` → `{ from: T.c, to: U.d, kind: "many-to-many" }`, listed only in `manyToMany`
- `external` when the other table is not exported; such a relation stays in `outgoing` (FK
  column + constraint) but targets must not generate relation members for it; its table name goes
  in `missing` and a `missing-table` warning is emitted once per missing table.

Defaults (`parse-default.ts`): DBML raw `default` → number (`0`, `1.5`), string (`'draft'`),
boolean (`true`/`false`), `null`, or expression (`` `now()` ``) → `{ kind: "expr", value: "now()" }`.
Composite pk: a `DbIndex` with `pk: true` sets `primaryKey` to its columns and marks them `pk`.

- [ ] **Step 1:** Implement. A table with no pk adds a `no-primary-key` warning here (once, so
  targets don't repeat it).
- [ ] **Step 2:** Verify lint/typecheck/format. Commit `feat(db-export): neutral code schema`.

### Task 4: SQL targets (MySQL, PostgreSQL)

**Files:**
- Create: `targets/sql/sql-dialect.types.ts`, `targets/sql/mysql.dialect.ts`,
  `targets/sql/postgres.dialect.ts`, `targets/sql/write-ddl.ts`, `targets/sql/write-table.ts`,
  `targets/sql/mysql.target.ts`, `targets/sql/postgres.target.ts`, `targets/sql/index.ts`
- Modify: `targets/built-in-targets.ts`

**Interfaces:**
- `SqlDialect { quote(name: string): string; columnType(c: CodeColumn): string | null (null =
  unknown → `text` + warning); autoIncrement(c: CodeColumn): string; enumType(e: CodeEnum):
  string | null (PG: a `CREATE TYPE`; MySQL: null, enum inline); inlineEnum(e: CodeEnum): string;
  comment(table: CodeTable): string[]; columnComment(c: CodeColumn): string; reserved:
  ReadonlySet<string> }`
- `writeDdl(schema: CodeSchema, dialect: SqlDialect, mode: "single" | "project"): CodeOutput` —
  one file `schema.sql` (single mode: `<table>.sql` with that table, its enum types and indexes).
- Targets: `mysqlTarget` (`id: "mysql"`, `label: "MySQL"`, profiles `[{ id: "latest", label:
  "MySQL 8.4", flags: {} }]`, no options), `postgresTarget` (`id: "postgres"`, `label:
  "PostgreSQL"`, profiles `[{ id: "latest", label: "PostgreSQL 18", flags: {} }]`).

Order of the file: header comment (`-- Generated by Cloudy Canvas`), enum types (PG), tables in
`schema.tables` order (columns, `PRIMARY KEY (...)`, inline `FOREIGN KEY ... REFERENCES ...` for
every non-deferred relation, external ones included), then indexes
(`CREATE [UNIQUE] INDEX name ON t [USING method] (...)`; generated name `<table>_<cols>_idx` when
unnamed), then `ALTER TABLE ... ADD FOREIGN KEY` for `deferred` (plus an `fk-cycle` warning), then
comments (`COMMENT ON TABLE/COLUMN` for PG; MySQL inline `COMMENT '…'`). Many-to-many relations
generate nothing extra (they need a pivot table drawn on the board) + an `unsupported` warning.
PG increment: `integer`/`bigint` + increment → `GENERATED BY DEFAULT AS IDENTITY`; MySQL:
`AUTO_INCREMENT`. Quote every identifier that is reserved or not `[a-z_][a-z0-9_]*`.

- [ ] **Step 1:** Implement dialects, writer and both targets; add them to `BUILT_IN_CODE_TARGETS`.
- [ ] **Step 2:** Expected PG for `orders(id int pk increment, status order_status, user_id int >
  users.id)`:

```sql
CREATE TYPE order_status AS ENUM ('pending', 'paid');

CREATE TABLE orders (
  id integer GENERATED BY DEFAULT AS IDENTITY,
  status order_status,
  user_id integer,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

- [ ] **Step 3:** Verify lint/typecheck/format. Commit `feat(db-export): MySQL and PostgreSQL targets`.

### Task 5: Laravel target (11, 12, 13)

**Files:**
- Create: `targets/laravel/laravel.target.ts`, `targets/laravel/profiles.ts`,
  `targets/laravel/type-map.ts`, `targets/laravel/write-model.ts`,
  `targets/laravel/model-relations.ts`, `targets/laravel/model-casts.ts`,
  `targets/laravel/write-migration.ts`, `targets/laravel/blueprint-column.ts`,
  `targets/laravel/write-enum.ts`, `targets/laravel/index.ts`
- Modify: `targets/built-in-targets.ts`

**Interfaces:**
- `laravelTarget`: `id: "laravel"`, `label: "Laravel"`, profiles (newest first)
  `{ id: "13", label: "Laravel 13", flags: { php: "8.3" } }`, `{ id: "12", …, php: "8.2" }`,
  `{ id: "11", …, php: "8.2" }`; no options.
- `writeModel(table: CodeTable, schema: CodeSchema, profile: CodeProfile): { file: CodeFile;
  warnings: CodeWarning[] }`, `writeMigration(table, schema, at: Date, index: number): CodeFile`,
  `writeEnum(e: CodeEnum): CodeFile`, `blueprintColumn(c: CodeColumn, table: CodeTable): string`.

Rules (from the spec, Targets → Laravel): `$table` only if `table !== toSnake(plural(className))`;
`$primaryKey` only if not `id`; uuid/char/varchar pk → `use HasUuids` (uuid only), `$incrementing
= false`, `$keyType = 'string'`; `$timestamps = false` unless both `created_at` and `updated_at`
exist; `use SoftDeletes` when `deleted_at` exists; `$fillable` = every column except pk,
`created_at`, `updated_at`, `deleted_at`; `casts()` method (protected, `@return array<string,
string>`) for boolean, integer types (non-pk), float/double/real, `decimal:<scale>`, datetime/
timestamp → `datetime`, date → `date`, json/jsonb → `array`, enum columns → `<Enum>::class`;
relation methods with return types and imports (`BelongsTo`, `HasMany`, `HasOne`,
`BelongsToMany`); method names: `belongsTo` → `toCamel(singular(fk without _id))`, `hasMany` →
`toCamel(plural(className(from)))`, `hasOne` → singular. Non-conventional keys pass foreign/owner
key arguments. Composite pk → `composite-key` warning, model keeps `$primaryKey` unset.
Migrations: `database/migrations/<Y_m_d_His>_create_<table>_table.php`, seconds `= now + index`
in dependency order; `foreignId('user_id')->constrained()` when `to` is `<plural>.id` and the
column is `<singular>_id`, else `->constrained('<table>', '<column>')`; external FKs keep the
constraint; deferred FKs go into one last
`<ts>_add_foreign_keys_to_tables.php` (`Schema::table`). Enums: `app/Enums/<Class>.php`, `enum
OrderStatus: string { case Pending = 'pending'; … }`. Single mode = the model only.

- [ ] **Step 1:** Implement; add to built-ins.
- [ ] **Step 2:** Expected model for `order_items(id pk increment, order_id > orders.id, quantity
  int, price decimal(10,2), created_at, updated_at)`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'quantity',
        'price',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'price' => 'decimal:2',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
```

- [ ] **Step 3:** Verify lint/typecheck/format. Commit `feat(db-export): Laravel target`.

### Task 6: Dialog, saving and entry points (first shippable release)

**Files:**
- Create: `src/platform/export-files.ts`, `src/platform/export-files.types.ts`
- Modify: `src/platform/index.ts`; `src/shared/ui/components/code-editor/code-editor.tsx` +
  `code-editor.types.ts` (`readOnly?: boolean` → `EditorState.readOnly.of(true)` and
  `EditorView.editable.of(false)`); `src/shared/ui/README.md` if it documents the editor's props
- Create (db): `db/db.points.ts` — `dbPanelActions = definePoint<DbPanelAction>("board.dbPanelActions",
  { keyOf: (a) => a.id })` with `DbPanelAction { id: string; order: number; component:
  ComponentType<{ tableId: string | null }> }` (types in `db/db.points.types.ts`)
- Modify (db): `db/db.module.ts` (nothing to contribute; the point is read by the panel),
  `db/ui/db-panel/db-panel.tsx` (render `host.get(dbPanelActions)` sorted by `order` in the header,
  passing the selected table id or null; read through the module host the way other editor points
  are read in board UI), `db/index.ts` (export the point and its type), `db/README.md`
- Create (db-export): `db-export.commands.ts`, `ui/code-export-store.ts` (+ `.types.ts`),
  `ui/code-export-dialog.tsx`, `ui/target-fields.tsx`, `ui/code-file-list.tsx`,
  `ui/code-preview.tsx`, `ui/code-warnings.tsx`, `ui/export-code-button.tsx`,
  `ui/use-export-code-command.ts`, `ui/use-code-output.ts`, `ui/index.ts` (+ `.types.ts` per
  component)
- Modify: `db-export.module.ts`, locales, README, `CHANGELOG.md`, `CHANGELOG.es.md`

**Interfaces:**
- Platform: `exportFiles(files: { path: string; content: string }[], name: string, confirm:
  (existing: string[]) => Promise<boolean>): Promise<boolean>` — Tauri: `open({ directory: true
  })`; `exists()` each `join(folder, path)`; if any exist and `confirm(existing)` is false → false;
  `mkdir(dirname, { recursive: true })` + `writeTextFile`. Browser: `zipSync` from `fflate`, download
  `<name>.zip`. Single files use the existing `exportFile(blob, name, { extension, label })`.
- `EXPORT_CODE_COMMAND = "db.exportCode"`, registered with `boardCanvas.hostCommands`
  (label `t("commands.exportCode")`).
- `useCodeExportStore`: `{ ids: string[] | null; open(ids: string[]): void; close(): void;
  last: { target: string; profile: string; options: Record<string, CodeOptionValue> } | null;
  remember(last): void }` — in-memory app UI state (call made: not persisted, not per board).
- `useCodeOutput(ids, target, profile, options, mode): { output: CodeOutput; schemaEmpty: boolean }`
  — memoized `toCodeSchema` + `target.generate` (`now` fixed when the dialog opens).

Behavior:
- Opening: `ExportCodeButton` (contributed to `dbPanelActions`, label `t("button")`, icon
  `FileCode`) opens with the selected table id or `[]` (whole schema). The context menu item
  (`boardEditor.contextMenu`, `menu: "selection"`) runs the command, enabled when the selection
  has a `isDbTable`/`isDbEnum` element; the command opens with the selected db ids.
- Mode: exactly one table id → `single`, with a `SegmentedControl` "This table" / "Whole schema";
  otherwise `project`.
- Left column: target `SelectField` (`codeTargets.list()`), version `SelectField` (profiles),
  one field per `CodeOption` (`SelectField` / `SwitchField`). Right: `CodeWarnings` (each
  `warningText(w)`), `CodeFileList` (paths, grouped by folder, selected file highlighted),
  `CodePreview` (`CodeEditor` with `readOnly`, `language: []` — call made: no syntax colors in v1).
- Footer: Copy (selected file via `clipboard.writeText` from `@platform`, toast "Copied"); Save:
  one file → `exportFile`; several → `exportFiles` with a confirm `Dialog` listing the existing
  paths. Failures → `notifyError(t("save.error"), error)`; success → `toast`. Empty schema →
  empty-state text, both buttons disabled.
- Changelog (New), en: "Export your database schema as code: Laravel models and migrations, SQL
  and PostgreSQL scripts, with the framework version you use. Export one table as a model or the
  whole schema as a ready-to-copy folder." es: equivalent professional Spanish.

- [ ] **Step 1:** Platform `exportFiles` and `CodeEditor` `readOnly`.
- [ ] **Step 2:** `dbPanelActions` point in db and the panel header rendering it.
- [ ] **Step 3:** Store, command, hook, dialog components, button, context menu; wire in
  `db-export.module.ts` (`boardEditor.overlays` for the dialog, `boardEditor.sessionHooks` for the
  command, `dbPanelActions` for the button) — mirror `er/er.sections.ts` and `er/ui/er-to-tables/`.
- [ ] **Step 4:** Locales (en + es), READMEs, changelog entries.
- [ ] **Step 5:** Verify lint/typecheck/format (locale and changelog checks are part of lint).
  Commit `feat(db-export): Export code dialog`.

### Task 7: MCP tools

**Files:** Create `db-export.mcp.ts`; modify `db-export.module.ts`, README.

**Interfaces:**
- `list_code_targets` (no args) → `{ targets: { id, label, profiles: { id, label }[], options: {
  id, kind, default, choices?: string[] }[] }[] }`.
- `export_schema_code` args `{ target: string; version?: string (profile id, default newest);
  options?: object; tables?: string[] (names; omitted = whole schema); mode?: "single" | "project"
  (default: single when exactly one table) }` → `{ files: CodeFile[]; warnings: { id, params,
  table?, column? }[] }`. Read-only: no `asUndoStep`. Unknown target/version/table names throw
  `Error` with the valid ids listed (validate all args before generating).
- Contribute with `host.contribute(boardMcpTools, { id: "db-export", tools: () => dbExportTools })`.

- [ ] **Step 1:** Implement (use `requireBoard(host).engine.service(DB_SCHEMA)`, as `db.mcp.ts`).
- [ ] **Step 2:** Verify; commit `feat(db-export): agent tools`.

### Task 8: Angular target (20, 21, 22)

**Files:** `targets/angular/angular.target.ts`, `profiles.ts`, `type-map.ts`, `write-model.ts`,
`write-enum.ts`, `write-barrel.ts`, `index.ts`; modify built-ins, changelog line (Improved or
extend the New entry if unreleased).

**Interfaces:** `angularTarget`: `id: "angular"`, profiles `22`, `21`, `20` (`label: "Angular
22"`, flags `{}`), no options. Files: `src/app/models/<kebab>.model.ts`, `<kebab>.enum.ts`,
project mode `index.ts`.

Rules: `export interface OrderItem { id: number; orderId: number; price: string; … }` — numbers
for integer/float types; `decimal`/`numeric` → `string` (JSON keeps precision; comment
`// decimal(10, 2)`); dates → `string` with `// ISO 8601 date-time`; json → `unknown`; booleans;
nullable (`!notNull && !pk`) → `| null`; has default or increment → optional `?`; relations
(non-external): `order?: Order`, incoming many-to-one → `orderItems?: OrderItem[]` with
`import type { Order } from './order.model';`. Enums: `export type OrderStatus = 'pending' |
'paid';` and `export const ORDER_STATUS_VALUES = ['pending', 'paid'] as const;`.

- [ ] **Step 1:** Implement; verify; commit `feat(db-export): Angular target`.

### Task 9: NestJS target (Prisma, TypeORM)

**Files:** `targets/nestjs/nestjs.target.ts`, `profiles.ts`, `prisma/write-prisma.ts`,
`prisma/prisma-type-map.ts`, `prisma/prisma-relations.ts`, `typeorm/write-entity.ts`,
`typeorm/typeorm-column.ts`, `typeorm/write-dto.ts`, `typeorm/write-enum.ts`, `index.ts`.

**Interfaces:** `nestjsTarget`: `id: "nestjs"`, profiles `[{ id: "11", label: "NestJS 11" }]`,
options: `orm` select `prisma` | `typeorm` (default `prisma`), `provider` select `postgresql` |
`mysql` (default `postgresql`, Prisma only — ignored for TypeORM), `dtos` switch (default `true`,
TypeORM only). The dialog shows every declared option; call made: no conditional visibility in v1.

Rules from the spec's NestJS section. Prisma: one `prisma/schema.prisma` (generator + datasource
blocks in project mode only); both relation sides (`order Order @relation(fields: [orderId],
references: [id])` / `orderItems OrderItem[]`); `@@map`/`@map` when names differ. TypeORM:
`src/<kebab-plural>/entities/<kebab>.entity.ts`, DTOs `src/<kebab-plural>/dto/create-<kebab>.dto.ts`
(`@IsString()`, `@IsInt()`, `@IsBoolean()`, `@IsOptional()` for nullable/defaulted, `@IsEnum()`,
`@MaxLength(n)` from varchar args; excludes pk/increment and timestamps) and
`update-<kebab>.dto.ts` (`export class UpdateOrderItemDto extends PartialType(CreateOrderItemDto)
{}` from `@nestjs/mapped-types`); enums `src/common/enums/<kebab>.enum.ts`.

- [ ] **Step 1:** Implement; verify; commit `feat(db-export): NestJS target`.

### Task 10: MongoDB target

**Files:** `targets/mongodb/mongodb.target.ts`, `write-script.ts`, `bson-type-map.ts`, `index.ts`.

**Interfaces:** `mongodbTarget`: `id: "mongodb"`, `label: "MongoDB"`, profiles `[{ id: "latest",
label: "MongoDB 8" }]`. One `schema.mongodb.js` (single: `<table>.mongodb.js`):
`db.createCollection("orders", { validator: { $jsonSchema: { bsonType: "object", required: [...],
properties: { … } } } });`, then `db.orders.createIndex({ … }, { unique: true })` for unique columns
and indexes. bsonType map: integers `int`/`long`, decimals `decimal`, floats `double`, strings
`string`, booleans `bool`, dates `date`, json `object`, uuid `string`; enums → `enum: [...]`; a
pk named `id` becomes a comment noting `_id` is the document key. Warnings (`unsupported`) for
increments, SQL defaults and FK constraints (refs become a field of the target's id type with a
`// references <table>.<column>` comment).

- [ ] **Step 1:** Implement; verify; commit `feat(db-export): MongoDB target`.
- [ ] **Step 2:** Final: update the changelog entry (en + es) to list every target, update the
  module README (all targets, the MCP tools), mark the spec's Status "implemented (plan: this
  file)". Verify; commit `docs(db-export): targets in the changelog and README`.
