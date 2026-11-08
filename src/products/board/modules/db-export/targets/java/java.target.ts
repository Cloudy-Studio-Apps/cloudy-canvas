import { relationProps } from "../../code";
import { defineCodeTarget } from "../define-code-target";
import { focusTables } from "../focus-tables";
import type { CodeWarning } from "../warnings.types";
import { javaFields } from "./java-fields";
import { javaNames } from "./java-names";
import { objectInit } from "./object-init";
import { writeJavaClass } from "./write-java-class";
import { writeJavaEnum } from "./write-java-enum";

/**
 * Plain Java: one class of private fields per table, a guide to copy from (no package or
 * imports). References are the objects they point at, started as `new Other()` when that doesn't
 * loop; relations pointing back are lists. Enums are Java enums. Single mode: the table's class.
 */
export const javaTarget = defineCodeTarget({
  id: "java",
  label: "Java",
  profiles: [{ id: "25", label: "Java 25", flags: {} }],
  options: [],
  generate(schema, request) {
    const warnings: CodeWarning[] = [];
    const names = javaNames(schema);
    const props = relationProps(schema, names.model);
    const init = objectInit(props);
    const options = { initObjects: true, keepEnumValues: false, target: "Java" };
    const files = focusTables(schema, request).map((table) =>
      writeJavaClass(table, javaFields(table, props, names, init, options, warnings), names),
    );
    if (request.mode !== "single") {
      files.push(...schema.enums.map((e) => writeJavaEnum(e, names, false)));
    }
    return { files, warnings };
  },
});
