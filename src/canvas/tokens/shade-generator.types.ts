/** How many shades and their names (the base always sits at 500). */
export type ShadeSteps = "50-950" | "100-900" | "5";

/** What the other modes of the shades' axis get: the shades in reverse (dark themes), or the same. */
export type ShadeOtherModes = "flip" | "same";

/** How a generator makes its shades. */
export interface ShadeSettings {
  steps: ShadeSteps;
  /** OKLab lightness of the lightest shade (0–1). */
  lightest: number;
  /** OKLab lightness of the darkest shade (0–1). */
  darkest: number;
  /** How much the ends lose saturation (0–1), so the palest and darkest aren't neon. */
  fade: number;
  other: ShadeOtherModes;
}

/**
 * A shade generator kept in the file: it made the shades in `group` of `collectionId` and keeps
 * them linked to its base (a variable, or a fixed color), so editing the base regenerates them.
 */
export interface GeneratorRecord extends ShadeSettings {
  kind: "generator";
  id: string;
  collectionId: string;
  /** The group path the shades are named in (`primary` → `primary/50` …). */
  group: string;
  /** The variable the shades follow; `null` uses `baseColor`. */
  baseVar: string | null;
  /** `#RRGGBBAA`, used without a base variable. */
  baseColor: string;
  /** The axis whose other modes get `other` (the first one with several modes when made). */
  axisId: string | null;
  order: string;
}

/** One shade: its step name and color (`#RRGGBBFF`); `anchor` is the base itself (500). */
export interface Shade {
  name: string;
  color: string;
  anchor: boolean;
}
