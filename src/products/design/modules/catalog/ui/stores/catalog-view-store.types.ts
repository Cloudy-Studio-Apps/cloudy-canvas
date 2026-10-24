export interface CatalogViewState {
  /** Whether the pages' margins show on the canvas. */
  margins: boolean;
  setMargins: (margins: boolean) => void;
  /** Whether the preview shows the brochure as a 3D booklet whose pages turn (else flat). */
  preview3d: boolean;
  setPreview3d: (preview3d: boolean) => void;
}
