import { runFigmaWorker, type FigmaImportReport } from "@canvas/figma";

import { t } from "./figjam-import.i18n";
import type { FigJamImport } from "./figjam-import.types";
import { readAndConvertFigJam } from "./read-and-convert-figjam";

/**
 * Reads and converts a `.jam` file's bytes in a worker, so the UI stays responsive (on the main
 * thread where the worker can't run). `onProgress` hears each step, worded in the user's
 * language. Rejects for files it can't read (Figma designs, others).
 */
export function convertFigJamFile(
  bytes: Uint8Array,
  onProgress?: FigmaImportReport,
): Promise<FigJamImport> {
  return runFigmaWorker(
    () => new Worker(new URL("./figjam-import.worker.ts", import.meta.url), { type: "module" }),
    readAndConvertFigJam,
    bytes,
    (stage, count) => onProgress?.(t(`stages.${stage}`), count),
  );
}
