import { runFigmaWorker, type FigmaImportProgress } from "@canvas/figma";

import type { FigJamImport } from "./figjam-import.types";
import { readAndConvertFigJam } from "./read-and-convert-figjam";

/**
 * Reads and converts a `.jam` file's bytes in a worker, so the UI stays responsive (on the main
 * thread where the worker can't run). Rejects for files it can't read (Figma designs, others).
 */
export function convertFigJamFile(
  bytes: Uint8Array,
  onProgress?: FigmaImportProgress,
): Promise<FigJamImport> {
  return runFigmaWorker(
    () => new Worker(new URL("./figjam-import.worker.ts", import.meta.url), { type: "module" }),
    readAndConvertFigJam,
    bytes,
    onProgress,
  );
}
