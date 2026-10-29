import type { CodeTargetDefinition } from "./code-target.types";
import { mysqlTarget, postgresTarget } from "./sql";

/** The targets the db-export module contributes, in the dialog's order. */
export const BUILT_IN_CODE_TARGETS: readonly CodeTargetDefinition[] = [mysqlTarget, postgresTarget];
