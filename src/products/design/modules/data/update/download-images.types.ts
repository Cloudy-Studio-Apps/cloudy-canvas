import type { CanvasDocument } from "@canvas";

import type { DataServices } from "../services";

/** What `downloadImages` needs: the document the pictures go in and where to read them from. */
export interface DownloadImagesContext {
  doc: CanvasDocument;
  services: DataServices;
  /** This device's path of the folder image file names are read in, `null` when it has none. */
  folder: string | null;
  signal: AbortSignal;
  onProgress?(done: number, total: number): void;
}

/**
 * Why a picture wasn't saved: it couldn't be downloaded or read, its bytes aren't a picture, it
 * is over the size limit, or it was past the limit of new pictures one Update saves.
 */
export type ImageFailureReason = "unreadable" | "notImage" | "tooLarge" | "overLimit";

/** A picture the data names that wasn't saved, and why. */
export interface ImageFailure {
  value: string;
  reason: ImageFailureReason;
}

/** The pictures an Update saved. */
export interface DownloadedImages {
  /** Every picture's asset by its `imageKey`: the known ones and the new ones. */
  images: Record<string, string>;
  /** The pictures that couldn't be saved, with why (also the ones past the limit). */
  failed: ImageFailure[];
  /** How many of `failed` were past the limit of new pictures one Update saves. */
  overLimit: number;
  /** How many new pictures were saved. */
  added: number;
}
