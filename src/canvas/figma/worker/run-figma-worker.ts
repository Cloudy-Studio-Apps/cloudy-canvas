import type { FigmaImportProgress } from "../figma-progress.types";
import type {
  FigmaWorkerConvert,
  FigmaWorkerRequest,
  FigmaWorkerResponse,
} from "./figma-worker.types";

/**
 * Reads and converts a file's bytes in an import worker (one running `serveFigmaWorker`), so the
 * UI stays responsive. `createWorker` makes the worker (each product's own, as Vite needs its
 * `new Worker(new URL(…))` written out); where workers aren't available, or the worker can't
 * start, `convert` runs here instead. Rejects for files the worker couldn't read.
 */
export async function runFigmaWorker<R>(
  createWorker: () => Worker,
  convert: FigmaWorkerConvert<R>,
  bytes: Uint8Array,
  onProgress: FigmaImportProgress = () => undefined,
): Promise<R> {
  if (typeof Worker !== "undefined") {
    const result = await convertInWorker<R>(createWorker, bytes, onProgress);
    if (result) return result.value;
  }
  return convert(bytes, onProgress);
}

/** The import done by the worker, or `null` when the worker itself failed (not the file). */
function convertInWorker<R>(
  createWorker: () => Worker,
  bytes: Uint8Array,
  onProgress: FigmaImportProgress,
): Promise<{ value: R } | null> {
  return new Promise((resolve, reject) => {
    const worker = createWorker();
    worker.onmessage = ({ data }: MessageEvent<FigmaWorkerResponse<R>>) => {
      if (data.type === "progress") return onProgress(data.stage, data.count);
      worker.terminate();
      if (data.type === "done") resolve({ value: data.result });
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
