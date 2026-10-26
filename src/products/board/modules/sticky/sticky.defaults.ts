import type { StickyDefaults } from "./sticky.types";

/** Sticky note size and typography, in world units. */
export const STICKY_DEFAULTS = {
  size: { w: 200, h: 200 },
  fontSize: 16,
  padding: 16,
  /** Its color field and the option that picks it. */
  colorOptions: { color: "stickyColor" },
} as const satisfies StickyDefaults;
