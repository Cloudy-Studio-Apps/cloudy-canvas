export interface BoardImageCropState {
  /** The image being cropped on the canvas, `null` when none is. */
  id: string | null;
  start: (id: string) => void;
  stop: () => void;
}
