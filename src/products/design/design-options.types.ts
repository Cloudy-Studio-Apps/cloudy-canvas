import type {
  FrameToolOptions,
  RectangleToolOptions,
  StickerToolOptions,
  TextToolOptions,
} from "./modules";

/**
 * What the design's tool options pick for new elements. Each module declares the options it owns
 * and their defaults; plugins add theirs by augmenting this interface
 * (`declare module "@design" { interface DesignToolOptions extends MyOptions {} }`).
 */
export interface DesignToolOptions
  extends FrameToolOptions, RectangleToolOptions, StickerToolOptions, TextToolOptions {}
