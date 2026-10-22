import type {
  ArrowHead,
  ConnectorStyle,
  ImageBackground,
  PickedSticker,
  StrokePen,
} from "./elements";
import type { DbToolOptions, StickyToolOptions } from "./modules";

/**
 * What the board's tool options panel picks, for new elements and the selection. Each module
 * declares the options it owns and their defaults; plugins add theirs by augmenting this
 * interface (`declare module "@board" { interface BoardToolOptions extends MyOptions {} }`).
 */
export interface BoardToolOptions extends StickyToolOptions, DbToolOptions {
  /** What the marker tool draws with. Each pen keeps its own color and thickness. */
  drawPen: StrokePen;
  /** Whether new strokes are smoothed when they're finished. */
  drawSmooth: boolean;
  markerColor: string;
  markerSize: number;
  highlighterColor: string;
  highlighterSize: number;
  /** Geo variant id. */
  shapeKind: string;
  shapeFill: string;
  shapeStroke: string;
  sectionColor: string;
  connectorStyle: ConnectorStyle;
  connectorColor: string;
  connectorStartHead: ArrowHead;
  connectorEndHead: ArrowHead;
  /** The selected images' look (pasted images start from `IMAGE_DEFAULTS`). */
  imageBackground: ImageBackground;
  imagePadding: number;
  /** New and selected tables' header tint, and whether their first row is a header. */
  tableColor: string;
  tableHeader: boolean;
  /** What the sticker tool stamps; `null` until one is picked. */
  sticker: PickedSticker | null;
}
