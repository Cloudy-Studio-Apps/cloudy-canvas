import type {
  ConnectorToolOptions,
  DbToolOptions,
  DrawToolOptions,
  GeoToolOptions,
  ImageToolOptions,
  SectionToolOptions,
  StickerToolOptions,
  StickyToolOptions,
  TableToolOptions,
} from "./modules";

/**
 * What the board's tool options panel picks, for new elements and the selection. Each module
 * declares the options it owns and their defaults; plugins add theirs by augmenting this
 * interface (`declare module "@board" { interface BoardToolOptions extends MyOptions {} }`).
 */
export interface BoardToolOptions
  extends
    DrawToolOptions,
    StickyToolOptions,
    StickerToolOptions,
    GeoToolOptions,
    ConnectorToolOptions,
    SectionToolOptions,
    TableToolOptions,
    ImageToolOptions,
    DbToolOptions {}
