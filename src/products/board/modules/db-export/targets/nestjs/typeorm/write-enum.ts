import { CodeWriter, toPascal, uniqueNames } from "../../../code";
import type { CodeEnum } from "../../../model";
import type { CodeFile } from "../../code-target.types";
import { enumPath } from "./typeorm-paths";

/** An enum value's member name: `in_progress` → `InProgress`. */
export function enumMember(value: string): string {
  const name = toPascal(value);
  return /^[A-Za-z_]/.test(name) ? name : `Value${name}`;
}

/** `src/common/enums/<name>.enum.ts`: a string enum. */
export function writeEnum(e: CodeEnum): CodeFile {
  const members = uniqueNames(e.values.map((value) => enumMember(value.name)));
  const w = new CodeWriter("  ");
  w.line(`export enum ${toPascal(e.name)} {`);
  w.indent(() =>
    e.values.forEach((value, i) => w.line(`${members[i]} = '${value.name.replace(/'/g, "\\'")}',`)),
  );
  w.line("}");
  return { path: `${enumPath(e.name)}.ts`, content: w.toString(), language: "ts" };
}
