import type { CanvasDocument, CanvasEngine, CanvasProduct } from "@canvas";
import type { FontLoader } from "@shared/core";

export interface ViewerEngineOptions<O extends object> {
  product: CanvasProduct<O>;
  document: CanvasDocument;
  fonts: FontLoader;
}

/** The viewer's engine once mounted, or whether it couldn't start (no WebGL). */
export interface ViewerEngineHost<O extends object> {
  engine: CanvasEngine<O> | null;
  failed: boolean;
}
