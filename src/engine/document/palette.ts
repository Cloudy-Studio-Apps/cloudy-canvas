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
export const SHAPE_STROKES = [
  { name: "Ink", value: "#2a2f37" },
  { name: "Gray", value: "#9aa3af" },
  { name: "Blue", value: "#3a83c9" },
  { name: "Red", value: "#e0484d" },
  { name: "Green", value: "#2f9a62" },
  { name: "None", value: "transparent" },
] as const;

export const TRANSPARENT = "transparent";

export const INK_COLOR = "#2a2f37";

/** Tint for the soft paper shadow under sticky notes. */
export const PAPER_SHADOW_COLOR = "#1b2330";
