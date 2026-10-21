import type { CanvasElement } from "../element.types";

/** Box elements with a `text` field edited in place (stickies, geo shapes). */
export type TextBoxElement = CanvasElement & { text: string };
