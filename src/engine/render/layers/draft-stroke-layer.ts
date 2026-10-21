import { Graphics } from "pixi.js";

import { strokeOutline } from "../../elements/stroke/stroke-outline";

/** The marker stroke being drawn, before it's committed to the document. */
export class DraftStrokeLayer extends Graphics {
  draw(points: number[] | null, color: string, size: number): void {
    this.clear();
    if (!points || points.length < 2) return;
    const outline = strokeOutline(points, size, false);
    if (outline.length >= 6) this.poly(outline).fill({ color });
  }
}
