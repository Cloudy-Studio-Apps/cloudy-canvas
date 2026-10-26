import type { CanvasElement } from "@canvas";

import { generatedMark } from "./is-sheet";

/**
 * A click on a generated layer selects its sheet (`designSelectRedirects`): what a template made
 * is picked, moved and edited as one element until it's converted.
 */
export function sheetRedirect(hitId: string, elements: readonly CanvasElement[]): string | null {
  const hit = elements.find((el) => el.id === hitId);
  return generatedMark(hit)?.sheet ?? null;
}
