/** How far a step of an import has got, when it can count. */
export interface FigmaImportCount {
  done: number;
  total: number;
}

/**
 * A step of an import, as a code: the worker has no locale, so the product words it
 * (`FigmaImportReport`).
 */
export type FigmaImportStage = "unpacking" | "decoding" | "converting";

/** Tells the caller which step the import is on, and how far. */
export type FigmaImportProgress = (stage: FigmaImportStage, count?: FigmaImportCount) => void;

/** The same with the step worded for the user (e.g. "Converting layers"): a product reports it. */
export type FigmaImportReport = (stage: string, count?: FigmaImportCount) => void;
