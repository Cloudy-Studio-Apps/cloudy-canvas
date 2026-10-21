/** What the board's tool options panel picks, for new elements and the selection. */
export interface BoardToolOptions {
  markerColor: string;
  markerSize: number;
  stickyColor: string;
  /** Geo variant id. */
  shapeKind: string;
  shapeFill: string;
  shapeStroke: string;
}
