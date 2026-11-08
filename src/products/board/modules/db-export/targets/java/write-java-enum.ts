import { CodeWriter, uniqueNames } from "../../code";
import type { CodeEnum } from "../../model";
import type { CodeFile } from "../code-target.types";
import { enumConstant } from "./java-enum-constant";
import type { JavaNames } from "./java-names.types";

/**
 * `<Name>.java`: the enum, one constant per value with its note. `keepValues` (JPA) keeps the
 * database values as the constants, and notes the database value of a constant that can't be it.
 */
export function writeJavaEnum(e: CodeEnum, names: JavaNames, keepValues: boolean): CodeFile {
  const constants = uniqueNames(e.values.map((value) => enumConstant(value.name, keepValues)));
  const name = names.enumType(e.name);
  const w = new CodeWriter("    ");
  w.line(`public enum ${name} {`);
  w.indent(() =>
    e.values.forEach((value, i) => {
      const constant = constants[i] ?? value.name;
      const notes = [
        ...(keepValues && constant !== value.name ? [`database value "${value.name}"`] : []),
        ...(value.note ? [value.note] : []),
      ];
      const comma = i < e.values.length - 1 ? "," : "";
      w.line(`${constant}${comma}${notes.length > 0 ? ` // ${notes.join("; ")}` : ""}`);
    }),
  );
  w.line("}");
  return { path: `${name}.java`, content: w.toString(), language: "java" };
}
