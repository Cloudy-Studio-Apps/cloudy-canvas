import type { FigmaImportCount, FigmaImportProgress } from "../figma-progress.types";

/** What an import worker is sent: the file's bytes. */
export interface FigmaWorkerRequest {
  bytes: Uint8Array;
}

/** What an import worker answers: progress while it works, then the import or the error. */
export type FigmaWorkerResponse<R> =
  | { type: "progress"; stage: string; count?: FigmaImportCount }
  | { type: "done"; result: R }
  | { type: "error"; message: string };

/** What an import worker returns: anything holding the image files it read, sent without copying. */
export interface FigmaWorkerResult {
  assets: ReadonlyMap<string, Uint8Array>;
}

/** Reads and converts a file's bytes, reporting its progress. */
export type FigmaWorkerConvert<R> = (bytes: Uint8Array, onProgress: FigmaImportProgress) => R;

/** The part of a dedicated worker's global scope an import worker uses. */
export interface FigmaWorkerScope<R> {
  onmessage: ((event: MessageEvent<FigmaWorkerRequest>) => void) | null;
  postMessage(message: FigmaWorkerResponse<R>, transfer?: Transferable[]): void;
}
