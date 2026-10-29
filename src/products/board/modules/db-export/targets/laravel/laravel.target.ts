import { defineCodeTarget } from "../define-code-target";
import { focusTables } from "../focus-tables";
import type { CodeFile } from "../code-target.types";
import { warn } from "../warnings";
import type { CodeWarning } from "../warnings.types";
import { laravelNames } from "./laravel-names";
import { migrationStamp } from "./migration-names";
import { pivotName } from "./model-relations";
import { LARAVEL_PROFILES } from "./profiles";
import { writeEnum } from "./write-enum";
import { writeForeignKeysMigration } from "./write-foreign-keys-migration";
import { writeMigration } from "./write-migration";
import { writeModel } from "./write-model";

/**
 * Laravel: Eloquent models (`app/Models`), one create migration per table in foreign key order
 * (plus one for foreign keys that close a cycle) and string-backed enums (`app/Enums`). Single
 * mode writes the table's model only.
 */
export const laravelTarget = defineCodeTarget({
  id: "laravel",
  label: "Laravel",
  profiles: LARAVEL_PROFILES,
  options: [],
  generate(schema, request) {
    const names = laravelNames(schema);
    const warnings: CodeWarning[] = [...names.warnings];
    const tables = request.mode === "single" ? focusTables(schema, request) : schema.tables;
    const models = tables.map((table) => writeModel(table, schema, request.profile, names));
    const files: CodeFile[] = models.map((model) => model.file);
    warnings.push(...models.flatMap((model) => model.warnings));
    if (request.mode === "single") return { files, warnings };

    files.push(...schema.enums.map((e) => writeEnum(e, names.enumClass(e.name))));
    tables.forEach((table, i) => {
      files.push(writeMigration(table, schema, migrationStamp(request.now, i), warnings));
    });
    if (schema.deferred.length > 0) {
      files.push(
        writeForeignKeysMigration(schema.deferred, migrationStamp(request.now, tables.length)),
      );
      for (const relation of schema.deferred) {
        const at = { table: relation.from.table, column: relation.from.column };
        warnings.push(warn("fk-cycle", at, at));
      }
    }
    for (const relation of schema.manyToMany) {
      const pivot = pivotName(relation.from.table, relation.to.table);
      if (!schema.tables.some((table) => table.name === pivot)) {
        warnings.push(warn("many-to-many", { from: relation.from.table, to: relation.to.table }));
      }
    }
    return { files, warnings };
  },
});
