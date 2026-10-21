export interface ShapeTextOptions {
  fontSize: number;
  color: string;
  /** Defaults to regular (400). */
  fontWeight?: "400" | "600";
  /** Wrap width in world units; omit for unwrapped text. */
  wrapWidth?: number;
}
