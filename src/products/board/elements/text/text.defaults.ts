import type { TextDefaults } from "./text.types";

/** Text label typography, in world units. */
export const TEXT_DEFAULTS = {
  fontSize: 20,
  minFontSize: 8,
  maxFontSize: 160,
} as const satisfies TextDefaults;
