/** How a palette's colors relate on the color wheel. */
export type HarmonyId =
  | "analogous"
  | "monochromatic"
  | "complementary"
  | "split"
  | "triad"
  | "square"
  | "compound"
  | "shades"
  | "custom";

export interface Harmony {
  id: HarmonyId;
  label: string;
  /** Hue turns from the base, repeated with lighter and darker variants; `null` for custom. */
  offsets: readonly number[] | null;
}
