/** The image fill being cropped on the canvas: a node's fill, by position. */
export interface ImageCropTarget {
  nodeId: string;
  index: number;
}

export interface ImageCropState {
  /** The fill in crop mode (its crop box shows on the canvas), `null` when none is. */
  target: ImageCropTarget | null;
  start: (target: ImageCropTarget) => void;
  stop: () => void;
}
