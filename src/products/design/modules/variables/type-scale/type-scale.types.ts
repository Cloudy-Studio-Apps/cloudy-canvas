import type { FontWeight, ScaleSettings } from "@canvas";

/** Where a type scale's font comes from: a font-family variable (followed), or a family name. */
export type TypeScaleFont = { variable: string } | { name: string };

/** How a type scale makes its text styles. */
export interface TypeScaleSettings extends ScaleSettings {
  /** The body size, at `md` (px). */
  base: number;
  /** The collection its size variables go in (id). */
  collection: string;
  /** Its group: the size variables are `group/<step>`, the styles `Group/<step>`. */
  group: string;
  font: TypeScaleFont;
  /** The weight of the steps above `md` (headings) and of the rest (body). */
  headingWeight: FontWeight;
  bodyWeight: FontWeight;
  /** Line heights, as multiples of the size. */
  lineHeight: { heading: number; body: number };
}

/** One step of a type scale. */
export interface TypeScaleStep {
  name: string;
  size: number;
  weight: FontWeight;
  lineHeight: number;
  heading: boolean;
}

/** What `createTypeScale` made. */
export interface CreatedTypeScale {
  scale: string;
  styles: string[];
}
