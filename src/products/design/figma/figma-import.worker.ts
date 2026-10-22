import { readFigFile } from "./container";
import { convertFigma } from "./convert/convert-figma";
import type { FigmaImportCount } from "./figma-import.types";
import type { FigmaWorkerRequest, FigmaWorkerScope } from "./figma-import-worker.types";

// Reads and converts a `.fig` file off the UI thread (see `convertFigmaFile`), so the app keeps
// drawing its loading screen while a large file is decoded.

/** Counted progress is posted at most this often; a new stage is always posted. */
const PROGRESS_INTERVAL_MS = 50;

const scope = self as unknown as FigmaWorkerScope;

scope.onmessage = ({ data }: MessageEvent<FigmaWorkerRequest>) => {
  let lastStage = "";
  let lastPost = 0;
  const progress = (stage: string, count?: FigmaImportCount) => {
    const now = performance.now();
    const last = count !== undefined && count.done === count.total;
    if (stage === lastStage && !last && now - lastPost < PROGRESS_INTERVAL_MS) return;
    lastStage = stage;
    lastPost = now;
    scope.postMessage({ type: "progress", stage, count });
  };
  try {
    const result = convertFigma(readFigFile(data.bytes, progress), progress);
    // The image files go over without copying (several may share one buffer).
    const buffers = new Set<ArrayBuffer>();
    for (const asset of result.assets.values()) {
      if (asset.buffer instanceof ArrayBuffer) buffers.add(asset.buffer);
    }
    scope.postMessage({ type: "done", result }, [...buffers]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The Figma file couldn't be read.";
    scope.postMessage({ type: "error", message });
  }
};
