import { definePoint } from "@shared/core";

import type { CodeTargetDefinition } from "./targets";

/**
 * The frameworks the database schema exports to (`defineCodeTarget`), keyed by id: the
 * db-export module's built-ins and plugins'. Read through `codeTargets`.
 */
export const boardCodeTargets = definePoint<CodeTargetDefinition>("board.codeTargets", {
  keyOf: (target) => target.id,
});
