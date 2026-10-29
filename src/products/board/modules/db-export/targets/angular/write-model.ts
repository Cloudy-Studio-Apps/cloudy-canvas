import { CodeWriter, RESERVED } from "../../code";
import type { CodeSchema, CodeTable } from "../../model";
import type { CodeFile } from "../code-target.types";
import type { CodeWarning } from "../warnings.types";
import type { AngularNames } from "./angular-names.types";
import { modelProperties } from "./model-properties";

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/** `src/app/models/<name>.model.ts`: the table's row as an interface. */
export function writeModel(
  table: CodeTable,
  schema: CodeSchema,
  names: AngularNames,
  warnings: CodeWarning[],
): CodeFile {
  const { properties, uses } = modelProperties(table, schema, names, warnings);
  const imports = [...uses]
    .map((use) =>
      use.startsWith("enum:")
        ? { name: names.enumType(use.slice(5)), file: names.enumFile(use.slice(5)) }
        : { name: names.model(use), file: names.modelFile(use) },
    )
    .sort((a, b) => a.file.localeCompare(b.file));

  const w = new CodeWriter("  ");
  for (const { name, file } of imports) w.line(`import type { ${name} } from './${file}';`);
  if (imports.length > 0) w.line();
  if (table.note) w.line(`/** ${table.note} */`);
  w.line(`export interface ${names.model(table.name)} {`);
  w.indent(() => {
    for (const property of properties) {
      const key =
        IDENTIFIER.test(property.name) && !RESERVED.ts.has(property.name)
          ? property.name
          : `'${property.name}'`;
      const comment = property.comment ? ` // ${property.comment}` : "";
      w.line(`${key}${property.optional ? "?" : ""}: ${property.type};${comment}`);
    }
  });
  w.line("}");
  return {
    path: `src/app/models/${names.modelFile(table.name)}.ts`,
    content: w.toString(),
    language: "ts",
  };
}
