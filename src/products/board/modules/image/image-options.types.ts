import type { ImageBackground } from "./image.types";

/** The selected images' look (pasted images start from `IMAGE_DEFAULTS`). */
export interface ImageToolOptions {
  imageBackground: ImageBackground;
  imagePadding: number;
}
