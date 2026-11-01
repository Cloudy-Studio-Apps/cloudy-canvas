import type { WebpEncoder } from "@shared/core";

/** libwebp as WebAssembly, loaded the first time a canvas can't encode WebP itself. */
export const webpEncoder: WebpEncoder = async (image, quality) => {
  const { default: encode } = await import("@jsquash/webp/encode");
  return new Uint8Array(await encode(image, { quality: quality * 100 }));
};
