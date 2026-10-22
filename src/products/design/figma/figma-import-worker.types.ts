import type { FigmaImport, FigmaImportCount } from "./figma-import.types";

/** What the import worker is sent: the `.fig` file's bytes. */
export interface FigmaWorkerRequest {
  bytes: Uint8Array;
}

/** What the import worker answers: progress while it works, then the import or the error. */
export type FigmaWorkerResponse =
  | { type: "progress"; stage: string; count?: FigmaImportCount }
  | { type: "done"; result: FigmaImport }
  | { type: "error"; message: string };

/** The part of a dedicated worker's global scope the import worker uses. */
export interface FigmaWorkerScope {
  onmessage: ((event: MessageEvent<FigmaWorkerRequest>) => void) | null;
  postMessage(message: FigmaWorkerResponse, transfer?: Transferable[]): void;
}
