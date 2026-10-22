import type { FigmaImportCount } from "../figma-progress.types";
import type {
  FigmaWorkerConvert,
  FigmaWorkerRequest,
  FigmaWorkerResult,
  FigmaWorkerScope,
} from "./figma-worker.types";

/** Counted progress is posted at most this often; a new stage is always posted. */
const PROGRESS_INTERVAL_MS = 50;

/**
 * Runs inside an import worker (see `runFigmaWorker`): converts each file it's sent with
 * `convert`, posting its progress, then the result (its image files handed over, not copied) or
 * the error.
 */
export function serveFigmaWorker<R extends FigmaWorkerResult>(
  convert: FigmaWorkerConvert<R>,
  fallbackError: string,
): void {
  const scope = self as unknown as FigmaWorkerScope<R>;
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
      const result = convert(data.bytes, progress);
      // The image files go over without copying (several may share one buffer).
      const buffers = new Set<ArrayBuffer>();
      for (const asset of result.assets.values()) {
        if (asset.buffer instanceof ArrayBuffer) buffers.add(asset.buffer);
      }
      scope.postMessage({ type: "done", result }, [...buffers]);
    } catch (error) {
      const message = error instanceof Error ? error.message : fallbackError;
      scope.postMessage({ type: "error", message });
    }
  };
}
