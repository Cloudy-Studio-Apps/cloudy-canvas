import { indexName } from "../../code";
import type { CodeRelation, CodeSchema, CodeTable } from "../../model";
import type { CodeFile } from "../code-target.types";
import { warn } from "../warnings";
import type { CodeWarning } from "../warnings.types";
import { blueprintColumn, shortForeignKey } from "./blueprint-column";
import { migrationShell } from "./migration-shell";
import { phpList, phpString } from "./php";

/** `database/migrations/<stamp>_create_<table>_table.php`. */
export function writeMigration(
  table: CodeTable,
  schema: CodeSchema,
  stamp: string,
  warnings: CodeWarning[],
): CodeFile {
  const has = (name: string) => table.columns.some((c) => c.name === name);
  const timestamps = has("created_at") && has("updated_at");
  const relationOf = (column: string) => table.outgoing.find((r) => r.from.column === column);
  const deferredOf = (column: string) =>
    schema.deferred.some((r) => r.from.table === table.name && r.from.column === column);
  const usesDb = { value: false };

  const lines: string[] = [];
  for (const column of table.columns) {
    if (timestamps && (column.name === "created_at" || column.name === "updated_at")) continue;
    if (column.name === "deleted_at") continue;
    lines.push(
      blueprintColumn(column, {
        table,
        enums: schema.enums,
        relation: relationOf(column.name),
        deferred: deferredOf(column.name),
        warnings,
        usesDb,
      }),
    );
  }
  if (timestamps) lines.push("$table->timestamps();");
  if (has("deleted_at")) lines.push("$table->softDeletes();");
  if (table.primaryKey.length > 1) lines.push(`$table->primary(${phpList(table.primaryKey)});`);
  // Foreign keys whose column isn't an id or uuid: `foreign()` after the columns.
  for (const relation of table.outgoing) {
    const column = table.columns.find((c) => c.name === relation.from.column);
    if (!column || shortForeignKey(column) || deferredOf(column.name)) continue;
    lines.push(foreignLine(relation));
  }
  lines.push(...indexLines(table, warnings));
  if (table.note) lines.push(`$table->comment(${phpString(table.note)});`);

  const name = phpString(table.name);
  const content = migrationShell(
    (w) => {
      w.line(`Schema::create(${name}, function (Blueprint $table) {`);
      w.indent(() => lines.forEach((line) => w.line(line)));
      w.line("});");
    },
    (w) => w.line(`Schema::dropIfExists(${name});`),
    usesDb.value,
  );
  return {
    path: `database/migrations/${stamp}_create_${table.name}_table.php`,
    content,
    language: "php",
  };
}

/** `$table->foreign('a')->references('b')->on('t');`. */
export function foreignLine(relation: CodeRelation): string {
  const { from, to } = relation;
  return `$table->foreign(${phpString(from.column)})->references(${phpString(to.column)})->on(${phpString(to.table)});`;
}

function indexLines(table: CodeTable, warnings: CodeWarning[]): string[] {
  return table.indexes.map((index, n) => {
    const name = index.name || indexName(table.name, index.columns, index.unique, n);
    const algorithm = index.method ? `->algorithm(${phpString(index.method)})` : "";
    if (index.exprs.length > 0) {
      if (index.columns.length > 0 || index.unique) {
        warnings.push(
          warn(
            "unsupported-index",
            { table: table.name, target: "Laravel" },
            { table: table.name },
          ),
        );
      }
      return `$table->rawIndex(${phpString(index.exprs.join(", "))}, ${phpString(name)});`;
    }
    const fn = index.unique ? "unique" : "index";
    const own = index.name ? `, ${phpString(index.name)}` : "";
    return `$table->${fn}(${phpList(index.columns)}${own})${algorithm};`;
  });
}
