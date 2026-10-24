import type { EncodeImageRequest, EncodeImageResponse } from "./encode-image.types";

// Encodes pictures off the UI thread (see `encodeImage`): drawn into an OffscreenCanvas and
// written as a file, so JPEG and PNG encoding never holds up a frame.
self.onmessage = async ({ data }: MessageEvent<EncodeImageRequest>) => {
  const { id, bitmap, type, quality } = data;
  let response: EncodeImageResponse;
  try {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No 2D context.");
    context.drawImage(bitmap, 0, 0);
    response = { id, blob: await canvas.convertToBlob({ type, quality }) };
  } catch (error) {
    response = { id, error: error instanceof Error ? error.message : String(error) };
  } finally {
    bitmap.close();
  }
  self.postMessage(response);
};
