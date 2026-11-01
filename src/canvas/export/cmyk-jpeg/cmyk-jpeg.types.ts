export interface CmykJpegRequest {
  id: number;
  cmyk: Uint8Array;
  width: number;
  height: number;
  quality: number;
}

export type CmykJpegResponse = { id: number; jpeg: Uint8Array } | { id: number; error: string };

/** A request waiting for the worker. */
export interface CmykJpegPending {
  resolve(jpeg: Uint8Array): void;
  reject(error: Error): void;
}
