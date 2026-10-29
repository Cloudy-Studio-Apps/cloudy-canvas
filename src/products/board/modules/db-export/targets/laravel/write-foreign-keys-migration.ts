import type { CodeRelation } from "../../model";
import type { CodeFile } from "../code-target.types";
import { migrationShell } from "./migration-shell";
import { phpList, phpString } from "./php";
import { foreignLine } from "./write-migration";

/** The last migration: foreign keys that close a cycle, added once every table exists. */
export function writeForeignKeysMigration(
  deferred: readonly CodeRelation[],
  stamp: string,
): CodeFile {
  const byTable = new Map<string, CodeRelation[]>();
  for (const relation of deferred) {
    byTable.set(relation.from.table, [...(byTable.get(relation.from.table) ?? []), relation]);
  }
  const each =
    (body: (table: string, relations: CodeRelation[]) => string[]) =>
    (w: Parameters<Parameters<typeof migrationShell>[0]>[0]) => {
      for (const [table, relations] of byTable) {
        w.line(`Schema::table(${phpString(table)}, function (Blueprint $table) {`);
        w.indent(() => body(table, relations).forEach((line) => w.line(line)));
        w.line("});");
      }
    };
  const content = migrationShell(
    each((_, relations) => relations.map(foreignLine)),
    each((_, relations) =>
      relations.map((r) => `$table->dropForeign(${phpList([r.from.column])});`),
    ),
    false,
  );
  return {
    path: `database/migrations/${stamp}_add_foreign_keys_to_tables.php`,
    content,
    language: "php",
  };
}
