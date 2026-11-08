import type { ModelSource } from "@canvas";
import type { PerspectiveCamera, Scene, WebGLRenderer } from "three";

import type { LoadedModel } from "../load";

/** The model on the live view: its loaded object, its lit scene and the textures it was built with. */
export interface LiveScene {
  /** Which element of which editor it is (`liveKey`). */
  key: string;
  /** The texture slots it was loaded with; other textures mean loading it again. */
  texturesKey: string;
  loaded: LoadedModel;
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
}

/** Reads what the model is built from, when it's (re)loaded; `null` when its data is missing. */
export type LiveSourceReader = () => ModelSource | null;
