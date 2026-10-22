import { readFigFile, type FigmaImportProgress } from "@canvas/figma";

import { convertFigJam } from "./convert/convert-figjam";
import type { FigJamImport } from "./figjam-import.types";

/** Reads a `.jam` file's bytes and converts them, in the import worker or on the main thread. */
export function readAndConvertFigJam(
  bytes: Uint8Array,
  onProgress?: FigmaImportProgress,
): FigJamImport {
  return convertFigJam(readFigFile(bytes, onProgress), onProgress);
}
