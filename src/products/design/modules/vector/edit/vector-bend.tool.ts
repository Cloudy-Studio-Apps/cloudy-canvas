import type { CanvasPointer } from "@canvas";

import { bendSegment, toggleSmooth } from "../../core";
import type { BendGesture } from "./vector-edit.types";
import { VectorEditTool } from "./vector-edit.tool";
import { VECTOR_TOOLS } from "./vector-tools";

/** Drag a segment to curve it through the pointer; click a point to make it sharp or smooth. */
export class VectorBendTool extends VectorEditTool {
  readonly id = VECTOR_TOOLS.bend;
  override readonly cursor = "crosshair";
  private bending: BendGesture | null = null;

  onPointerDown(p: CanvasPointer): void {
    const el = this.vector();
    if (!el) return this.leave();
    const part = this.partAt(el, p.world);
    if (part.kind === "vertex") {
      this.commit(el, toggleSmooth(el.network, part.vertex));
      this.select([part.vertex]);
    } else if (part.kind === "segment") {
      this.bending = { origin: el, segment: part.segment, t: part.t, started: false };
      this.select([], [part.segment]);
    }
  }

  onPointerMove(p: CanvasPointer): void {
    const b = this.bending;
    if (!b) return;
    if (!b.started) {
      b.started = true;
      this.ctx.doc.checkpoint();
    }
    const target = this.local(b.origin, p.world);
    this.write(b.origin, bendSegment(b.origin.network, b.segment, b.t, target));
  }

  onPointerUp(): void {
    this.bending = null;
  }

  override onCancel(): void {
    this.bending = null;
    super.onCancel();
  }
}
