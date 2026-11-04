import { createId } from "@shared/core";

import type { DataField, FieldType } from "../source";
import { parsePath, readPath, type DataRow, type PathStep } from "../table";
import { decodeImageData, isImageBytes } from "./image-bytes";
import { imageKey } from "./image-key";
import { imagePathIn } from "./image-path";
import type { DownloadedImages, DownloadImagesContext } from "./download-images.types";

/** At most this many new pictures are saved by one Update; the rest are reported as failed. */
export const MAX_NEW_IMAGES = 2000;
/** Downloads (or file reads) running at once. */
const PARALLEL = 4;

const IMAGE_TYPES: readonly FieldType[] = ["image-url", "image-base64", "image-file"];

interface Job {
  key: string;
  value: string;
  type: FieldType;
}

function stepsOf(path: string): PathStep[] | null {
  try {
    return parsePath(path);
  } catch {
    return null;
  }
}

/** Every picture value the rows hold in image fields, once each by key, in order. */
function collect(rows: readonly DataRow[], fields: DataField[]): Job[] {
  const jobs = new Map<string, Job>();
  const imageFields = fields.flatMap((field) => {
    const steps = IMAGE_TYPES.includes(field.type) ? stepsOf(field.path) : null;
    return steps ? [{ steps, type: field.type }] : [];
  });
  for (const row of rows) {
    for (const { steps, type } of imageFields) {
      const value = readPath(row, steps);
      if (typeof value !== "string" || !value.trim()) continue;
      const key = imageKey(value);
      if (!jobs.has(key)) jobs.set(key, { key, value: value.trim(), type });
    }
  }
  return [...jobs.values()];
}

/** A promise that rejects as soon as the signal aborts. */
function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(signal.reason ?? new Error("Aborted."));
    if (signal.aborted) return abort();
    signal.addEventListener("abort", abort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
  });
}

/**
 * A picture's bytes: a link downloaded (never with the source's secrets), base64 data decoded,
 * a file name read inside the chosen folder. `null` when it can't be had.
 */
async function fetchBytes(job: Job, ctx: DownloadImagesContext): Promise<Uint8Array | null> {
  if (job.value.startsWith("data:") || job.type === "image-base64") {
    return decodeImageData(job.value);
  }
  if (job.type === "image-url") {
    if (!/^https?:\/\//i.test(job.value)) return null;
    return abortable(ctx.services.http.getBytes(job.value), ctx.signal);
  }
  const path = ctx.folder ? imagePathIn(ctx.folder, job.value) : null;
  return path ? abortable(ctx.services.readFile(path), ctx.signal) : null;
}

/**
 * Saves the pictures the data names (`image-url`, `image-base64` and `image-file` fields) in the
 * file as document assets, so bound image fills work offline. Values already in `known` (whose
 * asset this device has) are skipped; the rest are fetched 4 at a time, at most
 * `MAX_NEW_IMAGES` of them, and kept only when their bytes are a picture (PNG, JPEG, GIF, WebP,
 * SVG). One picture failing never throws: its value is in `failed`. A cancel (`signal`) throws
 * and adds nothing: the assets are added once every picture is in.
 */
export async function downloadImages(
  rows: readonly DataRow[],
  fields: DataField[],
  known: Record<string, string>,
  ctx: DownloadImagesContext,
): Promise<DownloadedImages> {
  const pending = collect(rows, fields).filter((job) => {
    const assetId = known[job.key];
    return !assetId || !ctx.doc.hasAsset(assetId);
  });
  const jobs = pending.slice(0, MAX_NEW_IMAGES);
  const skipped = pending.slice(MAX_NEW_IMAGES).map((job) => job.value);
  const found = new Map<string, Uint8Array>();
  const failed: string[] = [];
  let next = 0;
  let done = 0;
  ctx.onProgress?.(0, jobs.length);

  const worker = async () => {
    while (next < jobs.length) {
      ctx.signal.throwIfAborted();
      const job = jobs[next++] as Job;
      let bytes: Uint8Array | null = null;
      try {
        bytes = await fetchBytes(job, ctx);
      } catch {
        ctx.signal.throwIfAborted();
      }
      if (bytes && bytes.length > 0 && isImageBytes(bytes)) found.set(job.key, bytes);
      else failed.push(job.value);
      ctx.onProgress?.(++done, jobs.length);
    }
  };
  await Promise.all(Array.from({ length: Math.min(PARALLEL, jobs.length) }, worker));
  ctx.signal.throwIfAborted();

  const images = { ...known };
  for (const [key, bytes] of found) {
    const assetId = createId();
    ctx.doc.addAsset(assetId, bytes);
    images[key] = assetId;
  }
  return {
    images,
    failed: [...failed, ...skipped],
    overLimit: skipped.length,
    added: found.size,
  };
}
