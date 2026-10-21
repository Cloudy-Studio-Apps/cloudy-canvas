// Content colors. These are document data (saved with the file), not UI theme tokens.

export const STICKY_COLORS = [
  { name: "Yellow", value: "#ffe7a1" },
  { name: "Blush", value: "#fbd3c7" },
  { name: "Ice", value: "#cfe4f8" },
  { name: "Mint", value: "#cdeed8" },
  { name: "Lilac", value: "#e2d9fa" },
  { name: "Seal", value: "#e6e8eb" },
] as const;

export const MARKER_COLORS = [
  { name: "Ink", value: "#2a2f37" },
  { name: "Blue", value: "#3a83c9" },
  { name: "Red", value: "#e0484d" },
  { name: "Green", value: "#2f9a62" },
  { name: "Orange", value: "#ee8a36" },
  { name: "Violet", value: "#8761cf" },
] as const;

export const MARKER_SIZES = [
  { name: "Fine", value: 3 },
  { name: "Medium", value: 6 },
  { name: "Bold", value: 12 },
] as const;

/** Header colors for database tables. */
export const DB_HEADER_COLORS = [
  { name: "Ice", value: "#cfe4f8" },
  { name: "Sand", value: "#f3e3c3" },
  { name: "Blush", value: "#fbd3c7" },
  { name: "Mint", value: "#cdeed8" },
  { name: "Lilac", value: "#e2d9fa" },
  { name: "Seal", value: "#e6e8eb" },
] as const;

/** Body of a database table. */
export const DB_BODY_COLOR = "#ffffff";

/** Muted ink for secondary text such as column types. */
export const MUTED_INK_COLOR = "#6b7280";

export const INK_COLOR = "#2a2f37";

/** Tint for the soft paper shadow under sticky notes. */
export const PAPER_SHADOW_COLOR = "#1b2330";
