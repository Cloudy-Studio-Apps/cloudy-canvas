import type { CodeTargetDefinition } from "./code-target.types";
import { angularTarget } from "./angular";
import { laravelTarget } from "./laravel";
import { mysqlTarget, postgresTarget } from "./sql";

/** The targets the db-export module contributes, in the dialog's order. */
export const BUILT_IN_CODE_TARGETS: readonly CodeTargetDefinition[] = [
  laravelTarget,
  angularTarget,
  mysqlTarget,
  postgresTarget,
];
