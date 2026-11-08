import type { PrototypeFlowDefaults } from "./flow.types";

/** What a new flow gets (and an older record missing them). */
export const PROTOTYPE_FLOW_DEFAULTS = {
  orientation: "portrait",
  hints: true,
} satisfies PrototypeFlowDefaults;
