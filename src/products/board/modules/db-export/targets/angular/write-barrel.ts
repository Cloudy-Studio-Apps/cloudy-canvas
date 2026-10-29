import { CodeWriter, toConstant } from "../../code";
import type { CodeSchema } from "../../model";
import type { CodeFile } from "../code-target.types";
import type { AngularNames } from "./angular-names.types";

/** `src/app/models/index.ts`: every model and enum. */
export function writeBarrel(schema: CodeSchema, names: AngularNames): CodeFile {
  const w = new CodeWriter("  ");
  for (const e of schema.enums) {
    const type = names.enumType(e.name);
    w.line(
      `export { ${toConstant(type)}_VALUES, type ${type} } from './${names.enumFile(e.name)}';`,
    );
  }
  for (const table of schema.tables) {
    w.line(`export type { ${names.model(table.name)} } from './${names.modelFile(table.name)}';`);
  }
  return { path: "src/app/models/index.ts", content: w.toString(), language: "ts" };
}
