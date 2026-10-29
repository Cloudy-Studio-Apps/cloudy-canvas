import { defineCodeTarget } from "../define-code-target";
import { focusTables } from "../focus-tables";
import type { CodeWarning } from "../warnings.types";
import { angularNames } from "./angular-names";
import { ANGULAR_PROFILES } from "./profiles";
import { writeBarrel } from "./write-barrel";
import { writeEnum } from "./write-enum";
import { writeModel } from "./write-model";

/**
 * Angular: one interface per table (`src/app/models/<name>.model.ts`, camelCase properties typed
 * as the JSON the API sends), the enums as value lists and types, and an `index.ts`. Single mode
 * writes the table's model only.
 */
export const angularTarget = defineCodeTarget({
  id: "angular",
  label: "Angular",
  profiles: ANGULAR_PROFILES,
  options: [],
  generate(schema, request) {
    const names = angularNames(schema, request.profile.flags.modelSuffix !== false);
    const warnings: CodeWarning[] = [];
    const tables = focusTables(schema, request);
    const files = tables.map((table) => writeModel(table, schema, names, warnings));
    if (request.mode === "single") return { files, warnings };
    files.push(...schema.enums.map((e) => writeEnum(e, names)), writeBarrel(schema, names));
    return { files, warnings };
  },
});
