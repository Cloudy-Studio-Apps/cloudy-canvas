import type { CanvasElement, ModelData } from "@canvas";

import type { OverlayFrame } from "../../overlay";

/** The model an editor has live: what its overlay needs to mount `ModelLiveView`. */
export interface ModelEditSession {
  id: string;
  element: CanvasElement;
  /** The model's data when the edit started. */
  data: ModelData;
  /** The element's box, as the scene has it. */
  frame: OverlayFrame;
}
