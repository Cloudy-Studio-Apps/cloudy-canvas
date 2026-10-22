import type { CanvasPointer } from "@canvas";

import { cutSegment } from "../../core";
import { VectorEditTool } from "./vector-edit.tool";
import { VECTOR_TOOLS } from "./vector-tools";

/** Click a segment to cut it there: its two halves no longer share the cut point. */
export class VectorCutTool extends VectorEditTool {
  readonly id = VECTOR_TOOLS.cut;
  override readonly cursor = "crosshair";

  onPointerDown(p: CanvasPointer): void {
    const el = this.vector();
    if (!el) return this.leave();
    const part = this.partAt(el, p.world);
    if (part.kind !== "segment") return;
    this.commit(el, cutSegment(el.network, part.segment, part.t));
    this.select([]);
  }
}
