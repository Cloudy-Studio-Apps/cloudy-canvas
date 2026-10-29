import { toCamel, toPascal } from "../../../code";
import type { CodeSchema, CodeTable } from "../../../model";
import type { CodeFile, CodeRequest } from "../../code-target.types";
import { focusTables } from "../../focus-tables";
import { warn } from "../../warnings";
import type { CodeWarning } from "../../warnings.types";
import type { NestProvider } from "../nestjs-provider.types";
import { nestModel, relationProps } from "../relation-props";
import { prismaBlock } from "./prisma-block";
import { prismaEnumValue } from "./prisma-enum-value";
import { prismaFields } from "./prisma-fields";

const INDEX_TYPES: Readonly<Record<string, string>> = {
  btree: "BTree",
  hash: "Hash",
  gin: "Gin",
  gist: "Gist",
  brin: "Brin",
  spgist: "SpGist",
};

/**
 * `prisma/schema.prisma`: the generator and datasource, the enums, then one model per table
 * (`@@map` / `@map` to the database names, both sides of every relation). Single mode: the table's
 * model and the enums it uses, in `prisma/<table>.prisma`.
 */
export function writePrisma(
  schema: CodeSchema,
  request: CodeRequest,
  provider: NestProvider,
  warnings: CodeWarning[],
): CodeFile {
  const single = request.mode === "single";
  const tables = focusTables(schema, request);
  const props = relationProps(schema, nestModel);
  const enumType = (name: string) => toPascal(name);
  const used = new Set(tables.flatMap((t) => t.columns.map((c) => c.enum)));
  const enums = schema.enums.filter((e) => !single || used.has(e.name));

  const blocks: string[] = [];
  if (!single) {
    blocks.push('generator client {\n  provider = "prisma-client-js"\n}');
    blocks.push(`datasource db {\n  provider = "${provider}"\n  url      = env("DATABASE_URL")\n}`);
  }
  for (const e of enums) {
    const fields = e.values.map((value): [string, string, string] => {
      const name = prismaEnumValue(value.name);
      return [name, "", name !== value.name ? `@map(${JSON.stringify(value.name)})` : ""];
    });
    const map = enumType(e.name) !== e.name ? [`@@map(${JSON.stringify(e.name)})`] : [];
    blocks.push(prismaBlock("enum", enumType(e.name), fields, map).replace(/ {2,}(?=@map)/g, " "));
  }
  for (const table of tables) {
    const own = props.filter(
      (p) => p.relation.from.table === table.name || p.relation.to.table === table.name,
    );
    const fields = prismaFields(table, own, nestModel, enumType, provider, warnings);
    blocks.push(
      prismaBlock(
        "model",
        nestModel(table.name),
        fields,
        blockAttributes(table, provider, warnings),
      ),
    );
  }
  const name = single && tables[0] ? tables[0].name : "schema";
  return { path: `prisma/${name}.prisma`, content: `${blocks.join("\n\n")}\n`, language: "prisma" };
}

function blockAttributes(
  table: CodeTable,
  provider: NestProvider,
  warnings: CodeWarning[],
): string[] {
  const list = (columns: readonly string[]) => `[${columns.map(toCamel).join(", ")}]`;
  const attributes: string[] = [];
  if (table.primaryKey.length > 1) attributes.push(`@@id(${list(table.primaryKey)})`);
  for (const index of table.indexes) {
    if (index.exprs.length > 0) {
      warnings.push(
        warn("unsupported-index", { table: table.name, target: "Prisma" }, { table: table.name }),
      );
      continue;
    }
    const args = [list(index.columns)];
    if (index.name) args.push(`map: ${JSON.stringify(index.name)}`);
    const type = INDEX_TYPES[index.method.toLowerCase()];
    if (type && provider === "postgresql" && !index.unique) args.push(`type: ${type}`);
    attributes.push(`@@${index.unique ? "unique" : "index"}(${args.join(", ")})`);
  }
  if (nestModel(table.name) !== table.name) attributes.push(`@@map(${JSON.stringify(table.name)})`);
  return attributes;
}
