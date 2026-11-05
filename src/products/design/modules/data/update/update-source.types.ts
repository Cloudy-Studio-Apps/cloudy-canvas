import type { DataFormat, DataSourceType } from "../data.points.types";
import type { DataServices } from "../services";
import type { ImageFailure } from "./download-images.types";

/**
 * What an Update is doing: fetching the data, parsing it, saving the pictures it names, saving
 * the snapshot.
 */
export type UpdateStage = "fetching" | "parsing" | "images" | "saving";

export interface UpdateOptions {
  signal?: AbortSignal;
  onStage?(stage: UpdateStage): void;
  /** How many of the pictures the data names are in (during `"images"`). */
  onProgress?(done: number, total: number): void;
  /** The pictures that couldn't be saved, with why, once the Update succeeds. */
  onImageFailures?(failed: ImageFailure[], overLimit: number): void;
  /** What the source type said about the fetch (a link stopped paging early), once it succeeds. */
  onWarnings?(warnings: string[]): void;
}

export interface UpdateResult {
  ok: boolean;
  rowCount: number;
  error?: string;
  /** Whether the data differs from the last snapshot. */
  changed: boolean;
  /** How many pictures the data names couldn't be saved in the file (also the ones past the limit). */
  imagesFailed: number;
  /** How many of `imagesFailed` were past the limit of new pictures one Update saves. */
  imagesOverLimit: number;
  /** How many of `imagesFailed` were over the size limit of one picture (25 MB). */
  imagesTooLarge?: number;
  /** What the source type said about the fetch; the rows it got are kept. */
  warnings?: string[];
  /** The Update was cancelled (its signal aborted): not a failure to report. */
  aborted?: boolean;
}

/** What an Update needs from the editor: the registered types and formats, and the platform. */
export interface DataContext {
  types: DataSourceType[];
  formats: DataFormat[];
  services: DataServices;
}
