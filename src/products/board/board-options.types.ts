import type { ArrowHead, ConnectorStyle, ImageBackground, PickedSticker } from "./elements";

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
  /** New and selected tables' header tint, and whether their first row is a header. */
  tableColor: string;
  tableHeader: boolean;
  /** What the sticker tool stamps; `null` until one is picked. */
  sticker: PickedSticker | null;
}
