/** A WCAG 2 grade for text: AAA (7:1), AA (4.5:1), large text only (3:1), or failing. */
export type ContrastGrade = "AAA" | "AA" | "AA large" | "fail";

/** A text color meant to be read on a surface color (variable ids). */
export interface ContrastPair {
  text: string;
  surface: string;
  /** Declared on a variable (`contrastWith`) rather than found by scope. */
  declared: boolean;
}

/** One combination of modes a pair is checked in. */
export interface ContrastResult {
  /** The modes picked, by axis id (empty: the file's current modes). */
  modes: Record<string, string>;
  /** The modes' names, e.g. "Dark" (empty: the current modes). */
  label: string;
  ratio: number;
  grade: ContrastGrade;
}

/** A pair checked in every mode its colors vary by. */
export interface ContrastCheck extends ContrastPair {
  results: ContrastResult[];
  /** The lowest grade of its results. */
  worst: ContrastGrade;
}
