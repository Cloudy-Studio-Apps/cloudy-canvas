export interface ShapeTextOptions {
  fontSize: number;
  color: string;
  /** Defaults to regular (400). */
  fontWeight?: "400" | "600";
  /** Horizontal alignment of wrapped lines. Defaults to left. */
  align?: "left" | "center";
  /** Wrap width in world units; omit for unwrapped text. */
  wrapWidth?: number;
}
