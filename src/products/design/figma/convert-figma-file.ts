import { readFigFile } from "./container";
import { convertFigma } from "./convert/convert-figma";
import type { FigmaImport, FigmaImportProgress } from "./figma-import.types";
import type { FigmaWorkerRequest, FigmaWorkerResponse } from "./figma-import-worker.types";

/**
 * Reads and converts a `.fig` file's bytes in a worker, so the UI stays responsive. Where workers
 * aren't available, or the worker can't start, it runs here instead. Rejects for files it can't
 * read (FigJam, Slides, other files).
 */
export async function convertFigmaFile(
  bytes: Uint8Array,
  onProgress?: FigmaImportProgress,
): Promise<FigmaImport> {
  if (typeof Worker !== "undefined") {
    const result = await convertInWorker(bytes, onProgress);
    if (result) return result;
  }
  return convertFigma(readFigFile(bytes, onProgress), onProgress);
}

/** The import done by the worker, or `null` when the worker itself failed (not the file). */
function convertInWorker(
  bytes: Uint8Array,
  onProgress?: FigmaImportProgress,
): Promise<FigmaImport | null> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./figma-import.worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = ({ data }: MessageEvent<FigmaWorkerResponse>) => {
      if (data.type === "progress") return onProgress?.(data.stage, data.count);
      worker.terminate();
      if (data.type === "done") resolve(data.result);
      else reject(new Error(data.message));
    };
    worker.onerror = (event) => {
      worker.terminate();
      console.warn("[figma] The import worker failed; importing on the main thread.", event);
      resolve(null);
    };
    // Copied, not handed over, so the main thread can still import them if the worker fails.
    const request: FigmaWorkerRequest = { bytes };
    worker.postMessage(request);
  });
}
