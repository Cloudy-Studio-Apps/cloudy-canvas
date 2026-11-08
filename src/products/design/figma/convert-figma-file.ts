import { runFigmaWorker, type FigmaImportReport } from "@canvas/figma";

import { t } from "./figma-import.i18n";
import type { FigmaImport } from "./figma-import.types";
import { readAndConvertFigma } from "./read-and-convert-figma";

/**
 * Reads and converts a `.fig` file's bytes in a worker, so the UI stays responsive (on the main
 * thread where the worker can't run). `onProgress` hears each step, worded in the user's
 * language. Rejects for files it can't read (FigJam, Slides, others).
 */
export function convertFigmaFile(
  bytes: Uint8Array,
  onProgress?: FigmaImportReport,
): Promise<FigmaImport> {
  return runFigmaWorker(
    () => new Worker(new URL("./figma-import.worker.ts", import.meta.url), { type: "module" }),
    readAndConvertFigma,
    bytes,
    (stage, count) => onProgress?.(t(`stages.${stage}`), count),
  );
}
