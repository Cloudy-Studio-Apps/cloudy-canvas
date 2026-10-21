import type { ErDefaults } from "./er.types";

/** Typography and strokes shared by every ER element, in world units. */
export const ER_DEFAULTS = {
  fontSize: 14,
  strokeWidth: 1.5,
  doubleGap: 4,
  aggregateTitleHeight: 20,
} as const satisfies ErDefaults;
