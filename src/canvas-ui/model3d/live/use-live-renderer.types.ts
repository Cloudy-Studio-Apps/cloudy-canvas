import type { RefObject } from "react";

import type { Size } from "@canvas";

import type { ModelView } from "../bake";
import type { LiveSourceReader } from "./live-model.types";

export interface LiveRendererOptions {
  /** Which element of which editor (`liveKey`). */
  key: string;
  /** The texture slots to build it with (`texturesKeyOf`); a change loads it again. */
  texturesKey: string;
  read: LiveSourceReader;
  /** Where three.js's canvas goes. */
  host: RefObject<HTMLDivElement | null>;
  view: ModelView;
  /** The view's size on screen, in CSS pixels. */
  size: Size;
  /** The model is ready to be shown. */
  onReady: () => void;
  /** It couldn't be loaded. */
  onError: (error: unknown) => void;
}
