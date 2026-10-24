import type { StrokeLook } from "./stroke-dashes.types";

export interface StrokePreviewProps {
  /** The stroke whose dashes, ends and weight the preview shows (a layer's or a style's). */
  node: StrokeLook;
}
