/** How far a step of an import has got, when it can count. */
export interface FigmaImportCount {
  done: number;
  total: number;
}

/** Tells the caller which step the import is on (e.g. "Converting layers"), and how far. */
export type FigmaImportProgress = (stage: string, count?: FigmaImportCount) => void;
