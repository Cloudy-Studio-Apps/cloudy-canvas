import { CodeWriter } from "../../code";
import type { CodeTable } from "../../model";
import type { CodeFile } from "../code-target.types";
import type { JavaField } from "./java-fields.types";
import type { JavaNames } from "./java-names.types";

/** `<Model>.java`: the table as a plain class of private fields. */
export function writeJavaClass(
  table: CodeTable,
  fields: readonly JavaField[],
  names: JavaNames,
): CodeFile {
  const model = names.model(table.name);
  const w = new CodeWriter("    ");
  if (table.note) w.line(`/** ${table.note} */`);
  w.line(`public class ${model} {`);
  w.indent(() =>
    fields.forEach((field) =>
      w.line(
        `private ${field.type} ${field.name}${field.init};${field.comment ? ` // ${field.comment}` : ""}`,
      ),
    ),
  );
  w.line("}");
  return { path: `${model}.java`, content: w.toString(), language: "java" };
}
