import type { SectionDefaults } from "./section.types";

/** Section size and title typography, in world units. */
export const SECTION_DEFAULTS = {
  size: { w: 640, h: 400 },
  fontSize: 14,
  titleHeight: 32,
  titlePadding: 10,
  borderReach: 2,
  minSize: 64,
  /** Its color field and the option that picks it. */
  colorOptions: { color: "sectionColor" },
} as const satisfies SectionDefaults;
