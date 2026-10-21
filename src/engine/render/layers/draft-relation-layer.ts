import { Graphics } from "pixi.js";

import type { RelationPath } from "../../db";
import { drawRelationPath } from "./draw-relation-path";
import { LINE_WIDTH_PX } from "./relation-layer";

/** The relation being dragged, drawn above the shapes so it stays visible over the target table. */
export class DraftRelationLayer extends Graphics {
  draw(draft: RelationPath | null, zoom: number, color: number): void {
    this.clear();
    if (!draft) return;
    drawRelationPath(this, draft);
    this.stroke({ color, width: LINE_WIDTH_PX / zoom, alpha: 0.8 });
    this.circle(draft.end.x, draft.end.y, 3 / zoom).fill({ color });
  }
}
