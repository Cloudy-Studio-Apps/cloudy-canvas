import { encodeCmykJpeg } from "./encode-cmyk-jpeg";
import type { CmykJpegRequest, CmykJpegResponse } from "./cmyk-jpeg.types";

// Encodes CMYK pictures off the UI thread (see `cmykJpeg`): a press-quality page takes seconds.
self.onmessage = ({ data }: MessageEvent<CmykJpegRequest>) => {
  const { id, cmyk, width, height, quality } = data;
  let response: CmykJpegResponse;
  try {
    const jpeg = encodeCmykJpeg(cmyk, width, height, quality);
    response = { id, jpeg };
    self.postMessage(response, { transfer: [jpeg.buffer as ArrayBuffer] });
  } catch (error) {
    response = { id, error: error instanceof Error ? error.message : String(error) };
    self.postMessage(response);
  }
};
