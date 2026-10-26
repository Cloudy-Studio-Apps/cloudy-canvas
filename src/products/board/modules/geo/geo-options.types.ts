/** The shape tool's options, for new shapes and the selected ones. */
export interface GeoToolOptions {
  /** Geo variant id. */
  shapeKind: string;
  shapeFill: string;
  shapeStroke: string;
  /** The color variable the fill is bound to (`null`: the color as picked). */
  shapeFillToken: string | null;
  /** The color variable the outline is bound to (`null`: the color as picked). */
  shapeStrokeToken: string | null;
}
