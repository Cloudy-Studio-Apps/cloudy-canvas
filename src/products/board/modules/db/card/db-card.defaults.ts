import type { DbCardDefaults } from "./db-card.types";

/** Typography and row sizes shared by tables and enums, in world units. */
export const DB_CARD_DEFAULTS = {
  fontSize: 13,
  headerHeight: 36,
  rowHeight: 28,
  paddingX: 12,
  badgeFontSize: 10,
} as const satisfies DbCardDefaults;
