import { runFigmaWorker, type FigmaImportProgress } from "@canvas/figma";

import type { FigmaImport } from "./figma-import.types";
import { readAndConvertFigma } from "./read-and-convert-figma";

/**
 * Reads and converts a `.fig` file's bytes in a worker, so the UI stays responsive (on the main
 * thread where the worker can't run). Rejects for files it can't read (FigJam, Slides, others).
 */
export function convertFigmaFile(
  bytes: Uint8Array,
  onProgress?: FigmaImportProgress,
): Promise<FigmaImport> {
  return runFigmaWorker(
    () => new Worker(new URL("./figma-import.worker.ts", import.meta.url), { type: "module" }),
    readAndConvertFigma,
    bytes,
    onProgress,
  );
}
