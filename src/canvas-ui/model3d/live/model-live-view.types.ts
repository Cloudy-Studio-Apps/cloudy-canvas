import type { CanvasEngine, ModelData, ModelSource } from "@canvas";

import type { OverlayFrame } from "../../overlay";
import type { ModelDraft, ModelEditResult } from "./model-edit-store.types";

export interface ModelLiveViewProps {
  /** The editor the model is live in (it must be the store's). */
  engine: CanvasEngine<object>;
  /** The element's box (world units), where the 3D view is drawn. */
  frame: OverlayFrame;
  /** The model's data (its textures are taken from the draft). */
  data: ModelData;
  /** Reads what to build the model from; by default `modelSource(engine.doc, data)`. */
  source?: (data: ModelData) => ModelSource | null;
  /** The edit finished from the view (Esc); the store has already finished it. */
  onFinish?: (result: ModelEditResult) => void;
}

export interface ModelLiveBodyProps extends ModelLiveViewProps {
  id: string;
  draft: ModelDraft;
}
