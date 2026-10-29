import { CodeWriter, toCamel, toKebab, toPascal, tsImport } from "../../../code";
import type { CodeColumn, CodeTable } from "../../../model";
import type { CodeFile } from "../../code-target.types";
import { nestModel } from "../relation-props";
import { enumPath, featureFolder, relativeImport } from "./typeorm-paths";

const GENERATED = new Set(["created_at", "updated_at", "deleted_at"]);

/** The `class-validator` decorators of a DTO property. */
function validators(column: CodeColumn): string[] {
  const each = column.array ? "{ each: true }" : "";
  if (column.enum) return [`IsEnum(${toPascal(column.enum)}${each ? `, ${each}` : ""})`];
  switch (column.type) {
    case "integer":
    case "smallint":
      return [`IsInt(${each})`];
    case "bigint":
    case "decimal":
      return [`IsNumberString(${each ? `{}, ${each}` : ""})`];
    case "float":
    case "real":
      return [`IsNumber(${each ? `{}, ${each}` : ""})`];
    case "boolean":
      return [`IsBoolean(${each})`];
    case "uuid":
      return [`IsUUID(${each ? `undefined, ${each}` : ""})`];
    case "varchar":
    case "char":
      return [
        `IsString(${each})`,
        ...(column.args[0] ? [`MaxLength(${column.args[0]}${each ? `, ${each}` : ""})`] : []),
      ];
    case "text":
      return [`IsString(${each})`];
    case "date":
    case "time":
    case "timestamp":
    case "timestamptz":
      return [`IsDateString(${each ? `{}, ${each}` : ""})`];
    case "json":
    case "jsonb":
      return ["IsObject()"];
    default:
      return [];
  }
}

const TS: Readonly<Record<string, string>> = {
  integer: "number",
  smallint: "number",
  float: "number",
  real: "number",
  boolean: "boolean",
  json: "Record<string, unknown>",
  jsonb: "Record<string, unknown>",
};

/**
 * `src/<feature>/dto/create-<name>.dto.ts` (every column the client sends, validated with
 * `class-validator`) and `update-<name>.dto.ts` (`PartialType` of it).
 */
export function writeDtos(table: CodeTable): CodeFile[] {
  const model = nestModel(table.name);
  const folder = `src/${featureFolder(table.name)}/dto`;
  const createPath = `${folder}/create-${toKebab(model)}.dto`;
  const columns = table.columns.filter(
    (c) => !GENERATED.has(c.name) && !(c.pk && (c.increment || (c.type === "uuid" && !c.default))),
  );
  const used = new Set<string>();
  const enums = new Set<string>();
  const w = new CodeWriter("  ");
  const body = new CodeWriter("  ");
  body.line(`export class Create${model}Dto {`);
  body.indent(() => {
    for (const column of columns) {
      const optional = (!column.notNull && !column.pk) || column.default !== null;
      const decorators = [
        ...(optional ? ["IsOptional()"] : []),
        ...(column.array ? ["IsArray()"] : []),
        ...validators(column),
      ];
      decorators.forEach((d) => used.add(d.slice(0, d.indexOf("("))));
      if (column.enum) enums.add(column.enum);
      decorators.forEach((d) => body.line(`@${d}`));
      const ts = column.enum ? toPascal(column.enum) : (TS[column.type] ?? "string");
      body
        .line(`${toCamel(column.name)}${optional ? "?" : ""}: ${ts}${column.array ? "[]" : ""};`)
        .line();
    }
  });
  body.line("}");
  if (used.size > 0) w.lines(tsImport([...used].sort(), "class-validator"));
  for (const name of [...enums].sort()) {
    w.line(`import { ${toPascal(name)} } from '${relativeImport(createPath, enumPath(name))}';`);
  }
  const head = used.size > 0 || enums.size > 0 ? `${w.toString()}\n` : "";
  const create: CodeFile = {
    path: `${createPath}.ts`,
    content: head + body.toString(),
    language: "ts",
  };
  const update = new CodeWriter("  ")
    .line("import { PartialType } from '@nestjs/mapped-types';")
    .line(`import { Create${model}Dto } from './create-${toKebab(model)}.dto';`)
    .line()
    .line(`export class Update${model}Dto extends PartialType(Create${model}Dto) {}`);
  return [
    create,
    {
      path: `${folder}/update-${toKebab(model)}.dto.ts`,
      content: update.toString(),
      language: "ts",
    },
  ];
}
