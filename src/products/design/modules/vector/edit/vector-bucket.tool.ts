import type { CanvasPointer } from "@canvas";

import { faceAt, placeNetwork, solidPaint, toggleRegion } from "../../core";
import { VectorEditTool } from "./vector-edit.tool";
import { VECTOR_TOOLS } from "./vector-tools";

/** The fill a vector without any gets when an area is filled, so it shows (like new shapes). */
const DEFAULT_FILL = "#D9D9D9";

/**
 * The paint bucket: click an area the segments enclose to fill it, or click a filled one to
 * unfill it (one undo step each).
 */
export class VectorBucketTool extends VectorEditTool {
  readonly id = VECTOR_TOOLS.bucket;
  override readonly cursor = "crosshair";

  onPointerDown(p: CanvasPointer): void {
    const el = this.vector();
    if (!el) return this.leave();
    const face = faceAt(el.network, this.local(el, p.world));
    if (!face) return;
    this.ctx.doc.checkpoint();
    this.ctx.doc.update(el.id, {
      ...placeNetwork(el, toggleRegion(el.network, face.loop)),
      ...(el.fills.length === 0 ? { fills: [solidPaint(DEFAULT_FILL)] } : {}),
    });
    this.select([]);
  }
}
