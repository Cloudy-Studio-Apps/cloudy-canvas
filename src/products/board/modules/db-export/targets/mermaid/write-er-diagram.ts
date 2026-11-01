import type { CodeColumn, CodeRelation, CodeSchema, CodeTable } from "../../model";

/** Entity names are always quoted: words like `class` or `title` break Mermaid's parser unquoted. */
const quoted = (text: string) => `"${text.replace(/\s+/g, " ").replace(/"/g, "'").trim()}"`;

/** Mermaid's attribute words take no spaces or punctuation and can't start with a digit. */
function word(text: string, allowed: RegExp): string {
  const clean = text.replace(allowed, "_");
  return /^\p{L}/u.test(clean) ? clean : `x_${clean}`;
}

/** The tables' columns, then the relations between what's shown, without tables left out. */
export function writeErDiagram(schema: CodeSchema, tables: readonly CodeTable[]): string {
  const lines = ["erDiagram"];
  const names = new Set(tables.map((table) => table.name));
  for (const table of tables) lines.push(...tableLines(schema, table));
  const relations = [
    ...tables.flatMap((t) => [...t.outgoing, ...t.incoming]),
    ...schema.manyToMany,
  ];
  const written = new Set<string>();
  for (const relation of relations) {
    if (relation.external) continue;
    if (!names.has(relation.from.table) && !names.has(relation.to.table)) continue;
    const line = relationLine(relation, schema);
    if (written.has(line)) continue;
    written.add(line);
    lines.push(`  ${line}`);
  }
  return lines.join("\n");
}

function tableLines(schema: CodeSchema, table: CodeTable): string[] {
  const foreign = new Set(table.outgoing.map((relation) => relation.from.column));
  return [
    `  ${quoted(table.name)} {`,
    ...table.columns.map((column) => {
      return `    ${columnLine(column, schema, foreign.has(column.name))}`;
    }),
    "  }",
  ];
}

function columnLine(column: CodeColumn, schema: CodeSchema, foreign: boolean): string {
  const args = column.args.length > 0 ? `(${column.args.join(",")})` : "";
  const type = word(column.type, /[^\p{L}\p{N}_-]/gu) + args + (column.array ? "[]" : "");
  const keys = [column.pk && "PK", foreign && "FK", column.unique && !column.pk && "UK"]
    .filter(Boolean)
    .join(", ");
  const values = schema.enums.find((each) => each.name === column.enum)?.values;
  const comment = [column.note, values?.map((value) => value.name).join(", ")]
    .filter(Boolean)
    .join(" - ");
  return [type, word(column.name, /[^\p{L}\p{N}_]/gu), keys, comment && quoted(comment)]
    .filter(Boolean)
    .join(" ");
}

function relationLine({ from, to, kind }: CodeRelation, schema: CodeSchema): string {
  const label = `${quoted(to.table)} ${cardinality(kind, isOptional(from, schema))} ${quoted(from.table)}`;
  return `${label} : ${quoted(from.column)}`;
}

/** Read from the referenced table: one (or none, for a nullable key) to the foreign key's table. */
function cardinality(kind: CodeRelation["kind"], optional: boolean): string {
  if (kind === "many-to-many") return "}o--o{";
  return `${optional ? "|o" : "||"}--${kind === "one-to-one" ? "o|" : "o{"}`;
}

function isOptional({ table, column }: CodeRelation["from"], schema: CodeSchema): boolean {
  const found = schema.tables.find((t) => t.name === table)?.columns;
  return found?.find((c) => c.name === column)?.notNull === false;
}
