import type { TextDefaults } from "./text.types";

/** Text label typography, in world units. */
export const TEXT_DEFAULTS = {
  fontSize: 20,
} as const satisfies TextDefaults;
