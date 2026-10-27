import type { CanvasElement } from "@canvas";

import { generatedMark, isSheet } from "../sheet";

/**
 * What the Design system mode lets be pointed at: the system page's sections and what they
 * generated (or it would be dimmed); clicks on a generated layer still select its section
 * (`sheetRedirect`).
 */
export function styleguideIsolate(el: CanvasElement): boolean {
  return (isSheet(el) && el.parentId === null) || generatedMark(el) !== null;
}
