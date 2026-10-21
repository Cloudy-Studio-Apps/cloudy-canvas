import type { ArrowHead, ConnectorStyle, ImageBackground } from "./elements";

/** What the board's tool options panel picks, for new elements and the selection. */
export interface BoardToolOptions {
  markerColor: string;
  markerSize: number;
  stickyColor: string;
  /** Geo variant id. */
  shapeKind: string;
  shapeFill: string;
  shapeStroke: string;
  sectionColor: string;
  connectorStyle: ConnectorStyle;
  connectorColor: string;
  connectorStartHead: ArrowHead;
  connectorEndHead: ArrowHead;
  /** What the Database tool places. */
  dbKind: "table" | "enum";
  /** The selected images' look (pasted images start from `IMAGE_DEFAULTS`). */
  imageBackground: ImageBackground;
  imagePadding: number;
}
