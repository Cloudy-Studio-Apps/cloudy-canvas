import { CATALOG_MODE_ID } from "../../mode/catalog-mode.constants";
import { useDesignState } from "@design/ui/design-engine-context";
import { BrochureCanvasLayer } from "./brochure-canvas-layer";

/** The Catalog mode's layer over the canvas (an `overlays` entry), only while the mode is on. */
export function BrochureOverlay() {
  const inMode = useDesignState((state) => state.mode === CATALOG_MODE_ID);
  return inMode ? <BrochureCanvasLayer /> : null;
}
