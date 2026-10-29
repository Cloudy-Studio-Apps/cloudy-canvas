import { CodeWriter, toCamel, toPascal, tsImport } from "../../../code";
import type { CodeTable } from "../../../model";
import type { CodeFile } from "../../code-target.types";
import type { CodeWarning } from "../../warnings.types";
import type { NestProvider } from "../nestjs-provider.types";
import { nestModel } from "../relation-props";
import type { RelationProps } from "../relation-props.types";
import { typeormColumn } from "./typeorm-column";
import { entityPath, enumPath, relativeImport } from "./typeorm-paths";

/** `src/<feature>/entities/<name>.entity.ts`: the table's TypeORM entity. */
export function writeEntity(
  table: CodeTable,
  props: readonly RelationProps[],
  provider: NestProvider,
  warnings: CodeWarning[],
): CodeFile {
  const path = entityPath(table.name);
  const decorators = new Set(["Entity"]);
  const imports = new Map<string, string>();
  const members: string[][] = [];

  for (const column of table.columns) {
    const { decorator, property, uses } = typeormColumn(column, table, provider, warnings);
    decorators.add(uses);
    if (column.enum)
      imports.set(toPascal(column.enum), relativeImport(path, enumPath(column.enum)));
    members.push([decorator, property]);
  }

  for (const p of props) {
    const { relation } = p;
    const fromHere = relation.from.table === table.name;
    const other = fromHere ? relation.to.table : relation.from.table;
    const model = nestModel(other);
    if (other !== table.name) imports.set(model, relativeImport(path, entityPath(other)));
    const inverse = (side: string) => `(${toCamel(model)}) => ${toCamel(model)}.${side}`;
    if (relation.kind === "many-to-many") {
      decorators.add("ManyToMany");
      if (fromHere) {
        decorators.add("JoinTable");
        members.push([
          `@ManyToMany(() => ${model}, ${inverse(p.to)})`,
          "@JoinTable()",
          `${p.from}: ${model}[];`,
        ]);
      }
      if (relation.to.table === table.name) {
        members.push([
          `@ManyToMany(() => ${model}, ${inverse(p.from)})`,
          `${p.to}: ${nestModel(relation.from.table)}[];`,
        ]);
      }
      continue;
    }
    const one = relation.kind === "one-to-one";
    if (fromHere) {
      const decorator = one ? "OneToOne" : "ManyToOne";
      decorators.add(decorator).add("JoinColumn");
      const fk = table.columns.find((c) => c.name === relation.from.column);
      const nullable = fk && !fk.notNull ? ", { nullable: true }" : "";
      const join = [`name: '${relation.from.column}'`];
      if (relation.to.column !== "id")
        join.push(`referencedColumnName: '${toCamel(relation.to.column)}'`);
      members.push([
        `@${decorator}(() => ${model}, ${inverse(p.to)}${nullable})`,
        `@JoinColumn({ ${join.join(", ")} })`,
        `${p.from}: ${model}${nullable ? " | null" : ""};`,
      ]);
    }
    if (relation.to.table === table.name) {
      const fromModel = nestModel(relation.from.table);
      const decorator = one ? "OneToOne" : "OneToMany";
      decorators.add(decorator);
      members.push([
        `@${decorator}(() => ${fromModel}, (${toCamel(fromModel)}) => ${toCamel(fromModel)}.${p.from})`,
        `${p.to}: ${fromModel}${one ? "" : "[]"};`,
      ]);
    }
  }

  const indexLines = table.indexes
    .filter((index) => index.exprs.length === 0)
    .map((index) => {
      decorators.add("Index");
      const name = index.name ? `'${index.name}', ` : "";
      const unique = index.unique ? ", { unique: true }" : "";
      return `@Index(${name}[${index.columns.map((c) => `'${toCamel(c)}'`).join(", ")}]${unique})`;
    });

  const w = new CodeWriter("  ");
  w.lines(tsImport([...decorators].sort(), "typeorm"));
  for (const [name, from] of [...imports].sort(([a], [b]) => a.localeCompare(b))) {
    w.line(`import { ${name} } from '${from}';`);
  }
  w.line().line(`@Entity('${table.name}')`);
  indexLines.forEach((line) => w.line(line));
  w.line(`export class ${nestModel(table.name)} {`);
  w.indent(() =>
    members.forEach((lines) => {
      lines.forEach((line) => w.line(line));
      w.line();
    }),
  );
  w.line("}");
  return { path: `${path}.ts`, content: w.toString(), language: "ts" };
}
