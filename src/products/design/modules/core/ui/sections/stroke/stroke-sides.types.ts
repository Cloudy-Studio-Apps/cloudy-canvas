import type { BoxSides } from "@canvas";

/** Which sides a box's stroke is on: all alike, one alone, or each with its own weight. */
export type StrokeSidesMode = "all" | keyof BoxSides | "custom";
