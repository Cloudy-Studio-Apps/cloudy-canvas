import { readFigFile, type FigmaImportProgress } from "@canvas/figma";

import { convertFigma } from "./convert/convert-figma";
import type { FigmaImport } from "./figma-import.types";

/** Reads a `.fig` file's bytes and converts them, in the import worker or on the main thread. */
export function readAndConvertFigma(
  bytes: Uint8Array,
  onProgress?: FigmaImportProgress,
): FigmaImport {
  return convertFigma(readFigFile(bytes, onProgress), onProgress);
}
