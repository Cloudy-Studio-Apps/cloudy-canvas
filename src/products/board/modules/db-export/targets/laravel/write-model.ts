import { CodeWriter, plural, toSnake } from "../../code";
import type { CodeSchema, CodeTable } from "../../model";
import type { CodeFile, CodeProfile } from "../code-target.types";
import { warn } from "../warnings";
import type { CodeWarning } from "../warnings.types";
import type { LaravelNames } from "./laravel-names.types";
import { modelCasts } from "./model-casts";
import { modelRelations } from "./model-relations";
import { phpString } from "./php";
import { isInteger, TIMESTAMP_COLUMNS } from "./type-map";

const RELATION_IMPORT = "Illuminate\\Database\\Eloquent\\Relations\\";

/** `app/Models/<Class>.php`: the table's Eloquent model. */
export function writeModel(
  table: CodeTable,
  schema: CodeSchema,
  profile: CodeProfile,
  names: LaravelNames,
): { file: CodeFile; warnings: CodeWarning[] } {
  const warnings: CodeWarning[] = [];
  const model = names.model(table.name);
  const has = (name: string) => table.columns.some((c) => c.name === name);
  const [key, ...rest] = table.primaryKey;
  const keyColumn = table.columns.find((c) => c.name === key);
  const composite = rest.length > 0;
  if (composite) {
    warnings.push(
      warn("composite-key", { table: table.name, target: "Eloquent" }, { table: table.name }),
    );
  }
  const uuidKey = !composite && keyColumn?.type === "uuid";
  const stringKey = !composite && keyColumn && !uuidKey && !isInteger(keyColumn);

  const traits = [...(uuidKey ? ["HasUuids"] : []), ...(has("deleted_at") ? ["SoftDeletes"] : [])];
  const relations = modelRelations(table, schema, names);
  const casts = modelCasts(table, names.enumClass);
  const imports = new Set(["Illuminate\\Database\\Eloquent\\Model"]);
  if (uuidKey) imports.add("Illuminate\\Database\\Eloquent\\Concerns\\HasUuids");
  if (has("deleted_at")) imports.add("Illuminate\\Database\\Eloquent\\SoftDeletes");
  for (const relation of relations) imports.add(RELATION_IMPORT + relation.type);
  for (const column of table.columns) {
    if (column.enum && casts.some(([name]) => name === column.name)) {
      imports.add(`App\\Enums\\${names.enumClass(column.enum)}`);
    }
  }

  const fillable = table.columns
    .filter((c) => !TIMESTAMP_COLUMNS.has(c.name))
    .filter((c) => !(c.pk && !composite && (c.increment || uuidKey)))
    .map((c) => c.name);

  const w = new CodeWriter("    ");
  w.line("<?php").line().line("namespace App\\Models;").line();
  for (const name of [...imports].sort()) w.line(`use ${name};`);
  w.line();
  w.line(`class ${model} extends Model`).line("{");
  w.indent(() => {
    if (traits.length > 0) w.line(`use ${traits.join(", ")};`).line();
    if (table.name !== toSnake(plural(model))) {
      w.line(`protected $table = ${phpString(table.name)};`).line();
    }
    if (key && !composite && key !== "id") {
      w.line(`protected $primaryKey = ${phpString(key)};`).line();
    }
    if (stringKey) w.line("protected $keyType = 'string';").line();
    if (composite || stringKey || (keyColumn && isInteger(keyColumn) && !keyColumn.increment)) {
      w.line("public $incrementing = false;").line();
    }
    if (!(has("created_at") && has("updated_at"))) w.line("public $timestamps = false;").line();
    w.line("protected $fillable = [");
    w.indent(() => fillable.forEach((name) => w.line(`${phpString(name)},`)));
    w.line("];").line();
    if (casts.length > 0) writeCasts(w, casts, profile.flags.castsMethod === true);
    for (const relation of relations) {
      w.line(`public function ${relation.name}(): ${relation.type}`).line("{");
      w.indent(() => w.line(`return ${relation.call};`));
      w.line("}").line();
    }
  });
  w.line("}");
  const content = w.toString();
  return { file: { path: `app/Models/${model}.php`, content, language: "php" }, warnings };
}

function writeCasts(w: CodeWriter, casts: readonly [string, string][], method: boolean): void {
  const entries = () => casts.forEach(([name, cast]) => w.line(`${phpString(name)} => ${cast},`));
  if (!method) {
    w.line("protected $casts = [");
    w.indent(entries);
    w.line("];").line();
    return;
  }
  w.line("/**").line(" * @return array<string, string>").line(" */");
  w.line("protected function casts(): array").line("{");
  w.indent(() => {
    w.line("return [");
    w.indent(entries);
    w.line("];");
  });
  w.line("}").line();
}
