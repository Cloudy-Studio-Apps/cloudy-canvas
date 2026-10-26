import type { CanvasElement } from "@canvas";

/** What a click on `hitId` selects instead, or `null` to leave it to the layer tree's rules. */
export type SelectRedirect = (hitId: string, elements: readonly CanvasElement[]) => string | null;
