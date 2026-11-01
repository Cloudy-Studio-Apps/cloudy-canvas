import type { CmykJpegPending, CmykJpegRequest, CmykJpegResponse } from "./cmyk-jpeg.types";
import { encodeCmykJpeg } from "./encode-cmyk-jpeg";

/** The one encode worker, made on first use; `null` once it failed (encoding stays here then). */
let worker: Worker | null | undefined;
let nextId = 1;
const pending = new Map<number, CmykJpegPending>();

/** `encodeCmykJpeg` in a worker, or here where there's no worker to be had. */
export async function cmykJpeg(
  cmyk: Uint8Array,
  width: number,
  height: number,
  quality: number,
): Promise<Uint8Array> {
  const encoder = encodeWorker();
  if (!encoder) return encodeCmykJpeg(cmyk, width, height, quality);
  const id = nextId++;
  const request: CmykJpegRequest = { id, cmyk, width, height, quality };
  return new Promise<Uint8Array>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    encoder.postMessage(request);
  }).catch(() => encodeCmykJpeg(cmyk, width, height, quality));
}

function encodeWorker(): Worker | null {
  if (worker !== undefined) return worker;
  if (typeof Worker === "undefined") return (worker = null);
  try {
    worker = new Worker(new URL("./cmyk-jpeg.worker.ts", import.meta.url), { type: "module" });
  } catch {
    return (worker = null);
  }
  worker.onmessage = ({ data }: MessageEvent<CmykJpegResponse>) => {
    const request = pending.get(data.id);
    pending.delete(data.id);
    if (!request) return;
    if ("jpeg" in data) request.resolve(data.jpeg);
    else request.reject(new Error(data.error));
  };
  worker.onerror = (event) => {
    console.warn("[export] The CMYK JPEG worker failed; encoding on the main thread.", event);
    worker = null;
    for (const request of pending.values()) request.reject(new Error("The worker failed."));
    pending.clear();
  };
  return worker;
}
