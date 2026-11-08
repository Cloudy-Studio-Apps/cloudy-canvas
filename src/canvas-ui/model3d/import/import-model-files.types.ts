import type { CanvasElement, ModelData, Rect } from "@canvas";

/**
 * Makes a product's model element from the stored data, fit to `rect` at z-order `index`. The
 * model's assets (picture included) are already in the document.
 */
export type PlaceModel = (data: ModelData, rect: Rect, index: string) => CanvasElement;
