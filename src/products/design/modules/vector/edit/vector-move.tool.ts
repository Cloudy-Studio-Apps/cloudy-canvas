import {
  MOVE_THRESHOLD_PX,
  pastThreshold,
  rectContainsPoint,
  rectFromPoints,
  type CanvasPointer,
  type Point,
} from "@canvas";

import { moveVertices, segmentsAt, setTangent, type VectorNetwork } from "../../core";
import type { VectorElement } from "../vector.types";
import type { MoveGesture } from "./vector-edit.types";
import { VectorEditTool } from "./vector-edit.tool";
import { VECTOR_TOOLS } from "./vector-tools";

/**
 * Picks and drags points (Shift adds or removes), segments (their two points) and tangent handles
 * (Alt breaks a smooth point's mirror), or marquee-selects points (a click away lets go of them).
 */
export class VectorMoveTool extends VectorEditTool {
  readonly id = VECTOR_TOOLS.move;
  private gesture: MoveGesture | null = null;

  onPointerDown(p: CanvasPointer): void {
    const el = this.vector();
    if (!el) return this.leave();
    const part = this.partAt(el, p.world);
    const { vertices, segments } = this.session.selection;

    if (part.kind === "handle") {
      const mirror = !p.altKey && segmentsAt(el.network, part.vertex).length === 2;
      this.gesture = {
        kind: "handle",
        origin: el,
        segment: part.segment,
        vertex: part.vertex,
        mirror,
        started: false,
      };
      return;
    }
    if (part.kind === "vertex" || part.kind === "segment") {
      const picked =
        part.kind === "vertex"
          ? [part.vertex]
          : [el.network.segments[part.segment]!.start, el.network.segments[part.segment]!.end];
      const already = picked.every((v) => vertices.has(v));
      let next = new Set(vertices);
      if (p.shiftKey) for (const v of picked) next[already ? "delete" : "add"](v);
      else if (!already) next = new Set(picked);
      this.select(
        next,
        part.kind === "segment" && !p.shiftKey ? [part.segment] : p.shiftKey ? segments : [],
      );
      this.gesture = { kind: "points", start: p, origin: el, vertices: next, started: false };
      return;
    }
    this.gesture = {
      kind: "marquee",
      start: p,
      origin: el,
      base: p.shiftKey ? new Set(vertices) : new Set(),
    };
    if (!p.shiftKey) this.select([]);
  }

  onPointerMove(p: CanvasPointer): void {
    const g = this.gesture;
    if (!g) return;
    if (g.kind === "marquee") {
      const rect = rectFromPoints(g.start.world, p.world);
      this.ctx.setMarquee(rect);
      const inside = [...g.origin.network.vertices.keys()].filter((i) =>
        rectContainsPoint(rect, this.world(g.origin, g.origin.network.vertices[i]!)),
      );
      this.select([...g.base, ...inside]);
      return;
    }
    if (g.kind === "points" && !g.started && !pastThreshold(g.start, p, MOVE_THRESHOLD_PX)) return;
    if (!g.started) {
      g.started = true;
      this.ctx.doc.checkpoint();
    }
    this.write(g.origin, this.dragged(g, p));
  }

  onPointerUp(): void {
    this.gesture = null;
    this.ctx.setMarquee(null);
  }

  override onCancel(): void {
    this.gesture = null;
    this.ctx.setMarquee(null);
    super.onCancel();
  }

  private dragged(g: Exclude<MoveGesture, { kind: "marquee" }>, p: CanvasPointer): VectorNetwork {
    const { network } = g.origin;
    if (g.kind === "points") {
      const dx = Math.round(p.world.x - g.start.world.x);
      const dy = Math.round(p.world.y - g.start.world.y);
      return moveVertices(network, g.vertices, dx, dy);
    }
    const at = network.vertices[g.vertex]!;
    const local = this.local(g.origin, p.world);
    return setTangent(
      network,
      g.segment,
      g.vertex,
      { x: local.x - at.x, y: local.y - at.y },
      g.mirror,
    );
  }

  private world(el: VectorElement, p: Point): Point {
    return { x: el.x + p.x, y: el.y + p.y };
  }
}
