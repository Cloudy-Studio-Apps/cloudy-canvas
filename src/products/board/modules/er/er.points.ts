import { definePoint } from "@shared/core";

import type { ErConstructDefinition } from "./base/constructs";
import type { ErStandardDefinition } from "./base/standards";

/**
 * The standards ER diagrams can follow (textbooks or papers, `defineErStandard`), keyed by id: the
 * er module's built-ins and plugins'. Read through `erStandards`.
 */
export const boardErStandards = definePoint<ErStandardDefinition>("board.erStandards", {
  keyOf: (standard) => standard.id,
});

/**
 * What ER diagrams can use that a standard may forbid (`defineErConstruct`), keyed by id: the er
 * module's built-ins and plugins'. Read through `erConstructs`.
 */
export const boardErConstructs = definePoint<ErConstructDefinition>("board.erConstructs", {
  keyOf: (construct) => construct.id,
});
