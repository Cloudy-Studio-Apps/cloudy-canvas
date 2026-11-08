import { CodeWriter } from "../../code";
import type { CodeTable } from "../../model";
import type { CodeFile } from "../code-target.types";
import { warn } from "../warnings";
import type { CodeWarning } from "../warnings.types";
import type { JavaField } from "./java-fields.types";
import { springPhysicalName } from "./java-identifier";
import type { JavaNames } from "./java-names.types";
import { springAnnotations } from "./spring-annotations";

/**
 * `<Model>.java`: the table as a JPA entity. `@Table` only when its name isn't Spring Boot's guess
 * or it has indexes; expression indexes can't be written and are warned about.
 */
export function writeSpringEntity(
  table: CodeTable,
  fields: readonly JavaField[],
  names: JavaNames,
  warnings: CodeWarning[],
): CodeFile {
  const model = names.model(table.name);
  const at = { table: table.name };
  if (table.primaryKey.length === 0) warnings.push(warn("no-primary-key", at, at));
  if (table.primaryKey.length > 1) warnings.push(warn("composite-key-class", at, at));

  const indexes: string[] = [];
  for (const index of table.indexes) {
    if (index.pk) continue;
    if (index.exprs.length > 0) {
      warnings.push(warn("unsupported-index", { table: table.name, target: "JPA" }, at));
      continue;
    }
    const options = [
      ...(index.name ? [`name = ${JSON.stringify(index.name)}`] : []),
      `columnList = ${JSON.stringify(index.columns.join(", "))}`,
      ...(index.unique ? ["unique = true"] : []),
    ];
    indexes.push(`@Index(${options.join(", ")})`);
  }

  const w = new CodeWriter("    ");
  if (table.note) w.line(`/** ${table.note} */`);
  w.line("@Entity");
  const name =
    springPhysicalName(model) !== table.name ? `name = ${JSON.stringify(table.name)}` : "";
  if (indexes.length > 0) {
    w.line("@Table(");
    w.indent(() => {
      if (name) w.line(`${name},`);
      w.line("indexes = {");
      w.indent(() =>
        indexes.forEach((index, i) => w.line(`${index}${i < indexes.length - 1 ? "," : ""}`)),
      );
      w.line("}");
    });
    w.line(")");
  } else if (name) {
    w.line(`@Table(${name})`);
  }
  w.line(`public class ${model} {`);
  w.indent(() =>
    fields.forEach((field) => {
      if (field.comment) w.line(`// ${field.comment}`);
      w.lines(springAnnotations(field, table));
      w.line(`private ${field.type} ${field.name}${field.init};`).line();
    }),
  );
  w.line("}");
  return { path: `${model}.java`, content: w.toString(), language: "java" };
}
