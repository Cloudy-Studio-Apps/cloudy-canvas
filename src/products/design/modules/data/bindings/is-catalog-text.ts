import type { CanvasElement } from "@canvas";

/** Whether a layer holds a catalog template (`catalogText`): the catalog fills it, not data. */
export function isCatalogText(el: CanvasElement): boolean {
  return (el as { catalogText?: unknown }).catalogText !== undefined;
}
