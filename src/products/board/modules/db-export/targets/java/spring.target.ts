import { relationProps } from "../../code";
import { defineCodeTarget } from "../define-code-target";
import { focusTables } from "../focus-tables";
import type { CodeWarning } from "../warnings.types";
import { javaFields } from "./java-fields";
import { javaNames } from "./java-names";
import { objectInit } from "./object-init";
import { writeJavaEnum } from "./write-java-enum";
import { writeSpringEntity } from "./write-spring-entity";

/**
 * Spring Boot: the plain Java classes as JPA entities (`jakarta.persistence`), a guide without
 * package or imports. Annotations appear only when they say something Spring Boot wouldn't guess.
 * References aren't started as `new`, since JPA loads them; enums keep the database values, as
 * `EnumType.STRING` stores them. Single mode: the table's entity.
 */
export const springTarget = defineCodeTarget({
  id: "spring",
  label: "Spring Boot",
  profiles: [{ id: "4", label: "Spring Boot 4", flags: {} }],
  options: [],
  generate(schema, request) {
    const warnings: CodeWarning[] = [];
    const names = javaNames(schema);
    const props = relationProps(schema, names.model);
    const init = objectInit(props);
    const options = { initObjects: false, keepEnumValues: true, target: "Java" };
    const files = focusTables(schema, request).map((table) =>
      writeSpringEntity(
        table,
        javaFields(table, props, names, init, options, warnings),
        names,
        warnings,
      ),
    );
    if (request.mode !== "single") {
      files.push(...schema.enums.map((e) => writeJavaEnum(e, names, true)));
    }
    return { files, warnings };
  },
});
