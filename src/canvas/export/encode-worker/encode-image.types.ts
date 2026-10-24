/** What the encode worker is asked: a picture to encode as `type`. */
export interface EncodeImageRequest {
  id: number;
  bitmap: ImageBitmap;
  type: string;
  quality?: number;
}

/** The encode worker's answer: the file, or why it couldn't encode. */
export type EncodeImageResponse = { id: number; blob: Blob } | { id: number; error: string };
