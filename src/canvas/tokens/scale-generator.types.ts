import type { TokenScope } from "./token.types";

/** How a scale's steps are named: t-shirt sizes around `md`, or numbers around 100. */
export type ScaleNames = "tshirt" | "numeric";

/** How a scale makes its numbers. */
export interface ScaleSettings {
  /** Each step is the one before times this (1.25: a major third). */
  ratio: number;
  /** How many steps below and above the base. */
  below: number;
  above: number;
  names: ScaleNames;
  /** Round each value to a whole number. */
  round: boolean;
}

/**
 * A number scale kept in the file (spacing, type sizes…): it made the numbers in `group` and keeps
 * them linked to its base (a variable, or a fixed number), so editing the base regenerates them.
 */
export interface ScaleRecord extends ScaleSettings {
  kind: "scale";
  id: string;
  collectionId: string;
  group: string;
  /** The variable the scale follows; `null` uses `baseValue`. */
  baseVar: string | null;
  baseValue: number;
  /** The scopes its numbers get (what they're for). */
  scopes: TokenScope[];
  order: string;
}

/** One step of a scale: its name, value, and whether it's the base. */
export interface ScaleStep {
  name: string;
  value: number;
  base: boolean;
}
