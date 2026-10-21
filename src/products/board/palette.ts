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

/** Fills for diagram shapes. "transparent" draws no fill. */
export const SHAPE_FILLS = [
  { name: "White", value: "#ffffff" },
  { name: "Seal", value: "#e6e8eb" },
  { name: "Ice", value: "#cfe4f8" },
  { name: "Mint", value: "#cdeed8" },
  { name: "Yellow", value: "#ffe7a1" },
  { name: "Blush", value: "#fbd3c7" },
  { name: "Lilac", value: "#e2d9fa" },
  { name: "None", value: "transparent" },
] as const;

/** Outlines for diagram shapes. */
/** Section backgrounds: soft tints so the elements inside stay readable. */
export const SECTION_COLORS = [
  { name: "Seal", value: "#f1f2f4" },
  { name: "Ice", value: "#e7f1fb" },
  { name: "Mint", value: "#e6f6ec" },
  { name: "Sand", value: "#fbf3e2" },
  { name: "Blush", value: "#fdeae4" },
  { name: "Lilac", value: "#f0ecfc" },
] as const;

export const SHAPE_STROKES = [
  { name: "Ink", value: "#2a2f37" },
  { name: "Gray", value: "#9aa3af" },
  { name: "Blue", value: "#3a83c9" },
  { name: "Red", value: "#e0484d" },
  { name: "Green", value: "#2f9a62" },
  { name: "None", value: "transparent" },
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

/** Body of a database table or enum card. */
export const DB_BODY_COLOR = "#ffffff";

/** Header color of enum cards. */
export const DB_ENUM_COLOR = "#e2d9fa";

/** Background of a table's note bubble. */
export const NOTE_BUBBLE_COLOR = "#fff6d6";

export const TRANSPARENT = "transparent";

export const INK_COLOR = "#2a2f37";

/** Outline of ER entities (rectangles), as in the classic Chen drawings. */
export const ER_ENTITY_COLOR = "#e0484d";
/** Outline of ER relations (diamonds). */
export const ER_RELATION_COLOR = "#3a83c9";
/** Outline of ER attributes (ellipses). */
export const ER_ATTRIBUTE_COLOR = "#2a2f37";
/** Fill of every ER element. */
export const ER_FILL_COLOR = "#ffffff";

/** Muted ink for secondary text such as column types. */
export const MUTED_INK_COLOR = "#6b7280";

/** Tint for the soft paper shadow under sticky notes. */
export const PAPER_SHADOW_COLOR = "#1b2330";

/** Behind images with a white background. */
export const IMAGE_BACKGROUND_COLOR = "#ffffff";
