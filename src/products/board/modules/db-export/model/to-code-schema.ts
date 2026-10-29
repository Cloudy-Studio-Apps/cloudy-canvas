import {
  canonicalTypeName,
  type DbColumn,
  type DbEnumElement,
  type DbTableElement,
} from "../../db";
import { warn } from "../targets/warnings";
import type { CodeWarning } from "../targets/warnings.types";
import type { CodeColumn, CodeIndex, CodeRelation, CodeTable } from "./code-schema.types";
import { codeRelation } from "./code-relations";
import { dependencyOrder } from "./dependency-order";
import { parseArgs } from "./parse-args";
import { parseDefault } from "./parse-default";
import type { CodeSchemaResult, SchemaSource } from "./to-code-schema.types";

/** Serial types are their integer type with an increment. */
const SERIAL: Readonly<Record<string, string>> = { serial: "integer", bigserial: "bigint" };

/**
 * The schema as `CodeSchema`: the tables and enums with these ids (every one when `ids` is
 * omitted), plus the enums the exported tables use. Relations to tables left out stay foreign keys
 * marked `external`, and each missing table is warned about once.
 */
export function toCodeSchema(source: SchemaSource, ids?: readonly string[]): CodeSchemaResult {
  const allTables = source.tables();
  const allEnums = source.enums();
  const wanted = ids ? new Set(ids) : null;
  const tables = wanted ? allTables.filter((table) => wanted.has(table.id)) : allTables;
  const exported = new Set(tables.map((table) => table.id));
  const tableOf = (id: string) => allTables.find((table) => table.id === id);
  const enumNamed = enumLookup(allEnums);
  const warnings: CodeWarning[] = [];

  const relations: CodeRelation[] = [];
  for (const table of allTables) {
    for (const column of table.columns) {
      if (!column.ref) continue;
      const relation = codeRelation(table, column.name, column.ref, tableOf, exported);
      if (!relation) continue;
      const touches = exported.has(table.id) || exported.has(column.ref.tableId);
      if (!touches) continue;
      // An external relation only matters to the exported table holding the foreign key.
      if (relation.external && !tables.some((t) => t.name === relation.from.table)) continue;
      relations.push(relation);
    }
  }

  const codeTables = tables.map((table) => codeTable(table, relations, enumNamed));
  for (const table of codeTables) {
    if (table.primaryKey.length === 0) {
      warnings.push(warn("no-primary-key", { table: table.name }, { table: table.name }));
    }
  }

  const exportedNames = new Set(tables.map((table) => table.name));
  const missing = [
    ...new Set(
      relations
        .filter((relation) => relation.external)
        .flatMap((relation) => [relation.from.table, relation.to.table])
        .filter((name) => !exportedNames.has(name)),
    ),
  ];
  for (const table of missing) warnings.push(warn("missing-table", { table }, { table }));

  const used = new Set(codeTables.flatMap((table) => table.columns.map((c) => c.enum)));
  const wantedEnums = allEnums.filter(
    (e) => used.has(e.name) || (wanted !== null && wanted.has(e.id)),
  );
  const { order, deferred } = dependencyOrder(codeTables);
  return {
    schema: {
      tables: order,
      enums: wantedEnums.map((e) => ({
        name: e.name,
        values: e.values.map((value) => ({ name: value.name, note: value.note })),
      })),
      deferred,
      manyToMany: relations.filter((r) => r.kind === "many-to-many" && !r.external),
      missing,
    },
    warnings,
  };
}

function enumLookup(enums: readonly DbEnumElement[]): (type: string) => string | null {
  const exact = new Map(enums.map((e) => [e.name, e.name]));
  const folded = new Map(enums.map((e) => [e.name.toLowerCase(), e.name]));
  return (type) => exact.get(type) ?? folded.get(type.toLowerCase()) ?? null;
}

function codeTable(
  table: DbTableElement,
  relations: readonly CodeRelation[],
  enumNamed: (type: string) => string | null,
): CodeTable {
  const nameOf = (id: string) => table.columns.find((c) => c.id === id)?.name;
  const pkIndex = table.indexes.find((index) => index.pk);
  const pkFromIndex = pkIndex
    ? pkIndex.parts.flatMap((part) => (part.kind === "column" ? (nameOf(part.columnId) ?? []) : []))
    : [];
  const primaryKey =
    pkFromIndex.length > 0 ? pkFromIndex : table.columns.filter((c) => c.pk).map((c) => c.name);
  const indexes: CodeIndex[] = table.indexes
    .filter((index) => !index.pk)
    .map((index) => ({
      name: index.name,
      columns: index.parts.flatMap((p) => (p.kind === "column" ? (nameOf(p.columnId) ?? []) : [])),
      exprs: index.parts.flatMap((p) => (p.kind === "expr" ? [p.expr] : [])),
      unique: index.unique,
      pk: false,
      method: index.type,
    }));
  const isOneToMany = (r: CodeRelation) => r.kind !== "many-to-many";
  return {
    name: table.name,
    note: table.note,
    columns: table.columns.map((c) => codeColumn(c, primaryKey.includes(c.name), enumNamed)),
    indexes,
    primaryKey,
    outgoing: relations.filter((r) => isOneToMany(r) && r.from.table === table.name),
    incoming: relations.filter((r) => isOneToMany(r) && r.to.table === table.name),
  };
}

function codeColumn(
  column: DbColumn,
  pk: boolean,
  enumNamed: (type: string) => string | null,
): CodeColumn {
  const canonical = canonicalTypeName(column.type);
  const array = canonical.endsWith("[]");
  const base = array ? canonical.slice(0, -2) : canonical;
  const serial = SERIAL[base];
  return {
    name: column.name,
    type: serial ?? base,
    array,
    args: parseArgs(column.typeArgs),
    pk,
    increment: column.increment || serial !== undefined,
    notNull: column.notNull || pk,
    unique: column.unique,
    default: parseDefault(column.default),
    note: column.note,
    enum: enumNamed(base),
  };
}
