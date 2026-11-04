import { createId } from "@shared/core";

import type { DataField, FieldType } from "../source";
import { parsePath, readPath, type DataRow, type PathStep } from "../table";
import { decodeImageData, isImageBytes } from "./image-bytes";
import { imageKey } from "./image-key";
import { imagePathIn } from "./image-path";
import type {
  DownloadedImages,
  DownloadImagesContext,
  ImageFailure,
  ImageFailureReason,
} from "./download-images.types";

/** At most this many new pictures are saved by one Update; the rest are reported as failed. */
export const MAX_NEW_IMAGES = 2000;
/** A picture larger than this (25 MB) isn't saved. */
export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
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
    // Base64 holds 3 bytes per 4 characters: one far over the limit isn't even decoded.
    if (job.value.length * 0.75 > MAX_IMAGE_BYTES + 3) throw new TooLarge();
    return decodeImageData(job.value);
  }
  if (job.type === "image-url") {
    if (!/^https?:\/\//i.test(job.value)) return null;
    return abortable(ctx.services.http.getBytes(job.value), ctx.signal);
  }
  const path = ctx.folder ? imagePathIn(ctx.folder, job.value) : null;
  if (!path || (await ctx.services.isPrivatePath(path))) return null;
  return abortable(ctx.services.readFile(path), ctx.signal);
}

/** A base64 picture known to be over the limit before decoding it. */
class TooLarge extends Error {}

/** Why bytes (or their absence) don't make a picture, `null` when they do. */
function rejection(bytes: Uint8Array | null): ImageFailureReason | null {
  if (!bytes || bytes.length === 0) return "unreadable";
  if (bytes.length > MAX_IMAGE_BYTES) return "tooLarge";
  return isImageBytes(bytes) ? null : "notImage";
}

/**
 * Saves the pictures the data names (`image-url`, `image-base64` and `image-file` fields) in the
 * file as document assets, so bound image fills work offline. Values already in `known` (whose
 * asset this device has) are skipped; the rest are fetched 4 at a time, at most
 * `MAX_NEW_IMAGES` of them, and kept only when their bytes are a picture (PNG, JPEG, GIF, WebP,
 * SVG) of at most `MAX_IMAGE_BYTES`. One picture failing never throws: it is in `failed` with
 * why. A file is read only inside the folder and never in the app's own data folder. A cancel (`signal`) throws
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
  const skipped = pending
    .slice(MAX_NEW_IMAGES)
    .map((job): ImageFailure => ({ value: job.value, reason: "overLimit" }));
  const found = new Map<string, Uint8Array>();
  const failed: ImageFailure[] = [];
  let next = 0;
  let done = 0;
  ctx.onProgress?.(0, jobs.length);

  const worker = async () => {
    while (next < jobs.length) {
      ctx.signal.throwIfAborted();
      const job = jobs[next++] as Job;
      let bytes: Uint8Array | null = null;
      let reason: ImageFailureReason | null;
      try {
        bytes = await fetchBytes(job, ctx);
        reason = rejection(bytes);
      } catch (error) {
        ctx.signal.throwIfAborted();
        reason = error instanceof TooLarge ? "tooLarge" : "unreadable";
      }
      if (bytes && reason === null) found.set(job.key, bytes);
      else failed.push({ value: job.value, reason: reason ?? "unreadable" });
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
