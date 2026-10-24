import { canvasBlob } from "../canvas-blob";
import type { EncodeImageRequest, EncodeImageResponse } from "./encode-image.types";

/** The one encode worker, made on first use; `null` once it failed (encoding stays here then). */
let worker: Worker | null | undefined;
let nextId = 1;
const pending = new Map<number, { resolve: (blob: Blob) => void; reject: (e: Error) => void }>();

/**
 * Encodes a canvas as an image file of `type` in a worker, so the UI thread only copies its
 * pixels (`createImageBitmap`); where workers, `OffscreenCanvas` or the worker itself aren't
 * there, it's encoded here (`canvasBlob`).
 */
export async function encodeImage(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  const encoder = encodeWorker();
  if (!encoder) return canvasBlob(canvas, type, quality);
  const bitmap = await createImageBitmap(canvas);
  const id = nextId++;
  const encoded = new Promise<Blob>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    const request: EncodeImageRequest = { id, bitmap, type, quality };
    encoder.postMessage(request, [bitmap]);
  });
  // The canvas is still here: if the worker can't, it's encoded on this thread.
  return encoded.catch(() => canvasBlob(canvas, type, quality));
}

function encodeWorker(): Worker | null {
  if (worker !== undefined) return worker;
  if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") {
    return (worker = null);
  }
  try {
    worker = new Worker(new URL("./encode-image.worker.ts", import.meta.url), { type: "module" });
  } catch {
    return (worker = null);
  }
  worker.onmessage = ({ data }: MessageEvent<EncodeImageResponse>) => {
    const request = pending.get(data.id);
    pending.delete(data.id);
    if (!request) return;
    if ("blob" in data) request.resolve(data.blob);
    else request.reject(new Error(data.error));
  };
  worker.onerror = (event) => {
    console.warn("[export] The encode worker failed; encoding on the main thread.", event);
    worker?.terminate();
    worker = null;
    for (const request of pending.values()) request.reject(new Error("The encode worker failed."));
    pending.clear();
  };
  return worker;
}
