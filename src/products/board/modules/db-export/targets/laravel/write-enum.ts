import { CodeWriter, toPascal, uniqueNames } from "../../code";
import type { CodeEnum } from "../../model";
import type { CodeFile } from "../code-target.types";
import { phpString } from "./php";

/** `app/Enums/<Class>.php`: a string-backed PHP enum. */
export function writeEnum(e: CodeEnum, enumClass: string): CodeFile {
  const cases = uniqueNames(
    e.values.map((value) => {
      const name = toPascal(value.name);
      return /^[A-Za-z_]/.test(name) ? name : `Value${name}`;
    }),
  );
  const w = new CodeWriter("    ");
  w.line("<?php").line().line("namespace App\\Enums;").line();
  w.line(`enum ${enumClass}: string`).line("{");
  w.indent(() =>
    e.values.forEach((value, i) => w.line(`case ${cases[i]} = ${phpString(value.name)};`)),
  );
  w.line("}");
  return { path: `app/Enums/${enumClass}.php`, content: w.toString(), language: "php" };
}
