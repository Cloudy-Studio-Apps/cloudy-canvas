import type { CanvasElement } from "@canvas";

/** Whether a text holds a catalog template (`catalogText`): the catalog fills it, not data. */
export function hasCatalogText(el: CanvasElement): boolean {
  return (el as { catalogText?: unknown }).catalogText !== undefined;
}
