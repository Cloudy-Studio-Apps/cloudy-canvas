import { toCamel, toPascal } from "../../../code";
import type { CodeColumn, CodeDefault, CodeTable } from "../../../model";
import { warn } from "../../warnings";
import type { CodeWarning } from "../../warnings.types";
import type { NestProvider } from "../nestjs-provider.types";
import { enumMember } from "./write-enum";
import type { TypeormColumn } from "./typeorm-column.types";
import { typeormType } from "./typeorm-type-map";

const DATE_COLUMNS: Readonly<Record<string, string>> = {
  created_at: "CreateDateColumn",
  updated_at: "UpdateDateColumn",
  deleted_at: "DeleteDateColumn",
};

const str = (text: string) => `'${text.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;

/** A column's decorator, property line and the decorator name it imports. */
export function typeormColumn(
  column: CodeColumn,
  table: CodeTable,
  provider: NestProvider,
  warnings: CodeWarning[],
): TypeormColumn {
  const prop = toCamel(column.name);
  const options: string[] = prop !== column.name ? [`name: ${str(column.name)}`] : [];
  const at = { table: table.name, column: column.name };
  const dateColumn = DATE_COLUMNS[column.name];
  if (dateColumn) {
    const nullable = column.name === "deleted_at" ? ": Date | null" : ": Date";
    return {
      decorator: `@${dateColumn}(${objectArg(options)})`,
      property: `${prop}${nullable};`,
      uses: dateColumn,
    };
  }

  let ts: string;
  if (column.enum) {
    const enumName = toPascal(column.enum);
    options.push("type: 'enum'", `enum: ${enumName}`);
    ts = enumName;
  } else {
    const type = typeormType(column, provider);
    if (!type) {
      warnings.push(
        warn("unknown-type", { ...at, type: column.type, target: "TypeORM", fallback: "text" }, at),
      );
    }
    options.push(`type: ${str(type?.db ?? "text")}`, ...(type?.extra ?? []));
    ts = type?.ts ?? "string";
  }
  if (column.array) {
    if (provider === "postgresql") options.push("array: true");
    else
      warnings.push(
        warn(
          "unknown-type",
          { ...at, type: `${column.type}[]`, target: "TypeORM (MySQL)", fallback: "json" },
          at,
        ),
      );
    ts = `${ts}[]`;
  }
  const single = table.primaryKey.length === 1;
  if (column.pk && single && column.increment) {
    return {
      decorator: `@PrimaryGeneratedColumn(${objectArg(options.filter((o) => o.startsWith("name:")))})`,
      property: `${prop}: ${ts};`,
      uses: "PrimaryGeneratedColumn",
    };
  }
  if (column.pk && single && column.type === "uuid" && !column.default) {
    const rest = options.filter((o) => o.startsWith("name:"));
    return {
      decorator: `@PrimaryGeneratedColumn('uuid'${rest.length > 0 ? `, ${objectArg(rest)}` : ""})`,
      property: `${prop}: ${ts};`,
      uses: "PrimaryGeneratedColumn",
    };
  }
  const nullable = !column.notNull && !column.pk;
  if (nullable) options.push("nullable: true");
  if (column.unique && !column.pk) options.push("unique: true");
  if (column.default) options.push(`default: ${defaultValue(column.default, column)}`);
  if (column.note) options.push(`comment: ${str(column.note)}`);
  const decorator = column.pk ? "PrimaryColumn" : "Column";
  return {
    decorator: `@${decorator}(${objectArg(options)})`,
    property: `${prop}: ${ts}${nullable ? " | null" : ""};`,
    uses: decorator,
  };
}

function objectArg(options: readonly string[]): string {
  return options.length > 0 ? `{ ${options.join(", ")} }` : "";
}

function defaultValue(value: CodeDefault, column: CodeColumn): string {
  switch (value.kind) {
    case "string":
      return column.enum ? `${toPascal(column.enum)}.${enumMember(value.value)}` : str(value.value);
    case "expr":
      return `() => ${str(value.value)}`;
    default:
      return value.value;
  }
}
