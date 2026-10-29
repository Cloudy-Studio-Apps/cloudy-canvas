import { CodeWriter, toConstant } from "../../code";
import type { CodeEnum } from "../../model";
import type { CodeFile } from "../code-target.types";
import type { AngularNames } from "./angular-names.types";

/** `src/app/models/<name>.enum.ts`: the values as a constant and the type they form. */
export function writeEnum(e: CodeEnum, names: AngularNames): CodeFile {
  const type = names.enumType(e.name);
  const values = `${toConstant(type)}_VALUES`;
  const w = new CodeWriter("  ");
  w.line(`export const ${values} = [`);
  w.indent(() => e.values.forEach((value) => w.line(`'${value.name.replace(/'/g, "\\'")}',`)));
  w.line("] as const;").line();
  w.line(`export type ${type} = (typeof ${values})[number];`);
  return {
    path: `src/app/models/${names.enumFile(e.name)}.ts`,
    content: w.toString(),
    language: "ts",
  };
}
