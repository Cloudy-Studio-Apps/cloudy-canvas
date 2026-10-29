import { toCamel } from "../../../code";
import type { CodeColumn, CodeDefault, CodeTable } from "../../../model";
import { warn } from "../../warnings";
import type { CodeWarning } from "../../warnings.types";
import type { NestProvider } from "../nestjs-provider.types";
import type { RelationProps } from "../relation-props.types";
import type { PrismaField } from "./prisma-block.types";
import { prismaEnumValue } from "./prisma-enum-value";
import { prismaType } from "./prisma-type-map";

const quote = (text: string) => JSON.stringify(text);

/** A model's scalar fields (camelCase, `@map` to the column) then its relation fields. */
export function prismaFields(
  table: CodeTable,
  props: readonly RelationProps[],
  model: (table: string) => string,
  enumType: (name: string) => string,
  provider: NestProvider,
  warnings: CodeWarning[],
): PrismaField[] {
  const single = table.primaryKey.length === 1;
  const oneToOne = new Set(
    table.outgoing.filter((r) => r.kind === "one-to-one").map((r) => r.from.column),
  );
  const scalars = table.columns.map((column): PrismaField => {
    const at = { table: table.name, column: column.name };
    let type = column.enum ? enumType(column.enum) : (prismaType(column, provider)?.type ?? null);
    let native = column.enum ? "" : (prismaType(column, provider)?.native ?? "");
    if (type === null) {
      warnings.push(
        warn(
          "unknown-type",
          { ...at, type: column.type, target: "Prisma", fallback: "String" },
          at,
        ),
      );
      type = "String";
      native = "";
    }
    if (column.array && provider === "mysql") {
      warnings.push(
        warn(
          "unknown-type",
          { ...at, type: `${column.type}[]`, target: "Prisma (MySQL)", fallback: "Json" },
          at,
        ),
      );
      type = "Json";
      native = "";
    } else if (column.array) type = `${type}[]`;
    const optional = !column.notNull && !column.pk && !column.array;
    const attributes = [
      ...(column.pk && single ? ["@id"] : []),
      ...defaultAttribute(column, single),
      // Prisma needs the foreign key of a one to one to be unique.
      ...((column.unique || oneToOne.has(column.name)) && !column.pk ? ["@unique"] : []),
      ...(toCamel(column.name) !== column.name ? [`@map(${quote(column.name)})`] : []),
      ...(native ? [native] : []),
    ];
    return [toCamel(column.name), optional ? `${type}?` : type, attributes.join(" ")];
  });

  const relations = props.flatMap((p): PrismaField[] => {
    const { relation } = p;
    const named = p.name ? `${quote(p.name)}` : "";
    const fields: PrismaField[] = [];
    if (relation.from.table === table.name) {
      if (relation.kind === "many-to-many") {
        fields.push([p.from, `${model(relation.to.table)}[]`, named ? `@relation(${named})` : ""]);
      } else {
        const fkColumn = table.columns.find((c) => c.name === relation.from.column);
        const optional = fkColumn ? !fkColumn.notNull : true;
        const args = [
          ...(named ? [named] : []),
          `fields: [${toCamel(relation.from.column)}]`,
          `references: [${toCamel(relation.to.column)}]`,
        ];
        const type = `${model(relation.to.table)}${optional ? "?" : ""}`;
        fields.push([p.from, type, `@relation(${args.join(", ")})`]);
      }
    }
    if (relation.to.table === table.name) {
      const back =
        relation.kind === "one-to-one"
          ? `${model(relation.from.table)}?`
          : `${model(relation.from.table)}[]`;
      fields.push([p.to, back, named ? `@relation(${named})` : ""]);
    }
    return fields;
  });
  return [...scalars, ...relations];
}

function defaultAttribute(column: CodeColumn, singleKey: boolean): string[] {
  if (column.increment) return ["@default(autoincrement())"];
  const value: CodeDefault | null = column.default;
  if (!value) return column.pk && singleKey && column.type === "uuid" ? ["@default(uuid())"] : [];
  switch (value.kind) {
    case "number":
    case "boolean":
      return [`@default(${value.value})`];
    case "string":
      if (column.enum) return [`@default(${prismaEnumValue(value.value)})`];
      return [`@default(${quote(value.value)})`];
    case "null":
      return [];
    case "expr":
      if (/^(now\(\)|current_timestamp(\(\))?)$/i.test(value.value)) return ["@default(now())"];
      if (/^(gen_random_uuid|uuid_generate_v4)\(\)$/i.test(value.value))
        return ["@default(uuid())"];
      return [`@default(dbgenerated(${quote(value.value)}))`];
  }
}
