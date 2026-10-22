import {
  pastThreshold,
  DRAW_THRESHOLD_PX,
  roundPoint,
  type CanvasPointer,
  type Point,
} from "@canvas";

import {
  addVertex,
  connect,
  nextLayerName,
  parentFor,
  setTangent,
  splitSegment,
  type VectorNetwork,
} from "../../core";
import { createVector } from "../vector.factory";
import type { VectorElement } from "../vector.types";
import type { PenPull } from "./vector-edit.types";
import { VectorEditTool } from "./vector-edit.tool";
import { VECTOR_TOOLS } from "./vector-tools";

/**
 * The pen (P), on the main toolbar and in the edit mode: outside it, a click starts a new vector
 * and edits it. Then a click adds a point joined to the selected end (dragging pulls out its
 * handles), a click on a segment adds a point there, and a click on another point joins them
 * (closing a loop fills it). Esc lets go of the end.
 */
export class PenTool extends VectorEditTool {
  readonly id = VECTOR_TOOLS.pen;
  override readonly cursor = "crosshair";
  private pull: PenPull | null = null;
  /** The handle the next segment leaves the selected end with (from the last pull). */
  private outgoing: { vertex: number; tangent: Point } | null = null;

  onPointerDown(p: CanvasPointer): void {
    const el = this.vector();
    if (!el) return this.startVector(p);
    const at = this.local(el, roundPoint(p.world));
    const part = this.partAt(el, p.world);
    const selected = [...this.session.selection.vertices];
    const from = selected.length === 1 ? selected[0]! : null;

    if (part.kind === "vertex") {
      if (from === null || from === part.vertex) return this.select([part.vertex]);
      const { network, segment } = connect(el.network, from, part.vertex);
      const closed = network.regions.length > el.network.regions.length;
      this.commit(el, this.withOutgoing(network, segment, from));
      // Closing a loop finishes the path, as in Figma.
      this.select(closed ? [] : [part.vertex]);
      return;
    }
    if (part.kind === "segment") {
      const { network, vertex } = splitSegment(el.network, part.segment, part.t);
      this.commit(el, network);
      this.select([vertex]);
      return;
    }
    const added = addVertex(el.network, at);
    let network = added.network;
    let segment: number | null = null;
    if (from !== null) {
      const joined = connect(network, from, added.vertex);
      network = this.withOutgoing(joined.network, joined.segment, from);
      segment = joined.segment;
    }
    this.commit(el, network);
    this.select([added.vertex]);
    this.pull = { start: p, vertex: added.vertex, segment };
  }

  onPointerMove(p: CanvasPointer): void {
    const pull = this.pull;
    const el = this.vector();
    if (!pull || !el || !pastThreshold(pull.start, p, DRAW_THRESHOLD_PX)) return;
    const at = el.network.vertices[pull.vertex]!;
    const local = this.local(el, p.world);
    const tangent = { x: local.x - at.x, y: local.y - at.y };
    // The handle pulled forward shapes the next segment; the one behind, the segment that arrived.
    this.outgoing = { vertex: pull.vertex, tangent };
    if (pull.segment !== null) {
      const back = { x: -tangent.x, y: -tangent.y };
      this.write(el, setTangent(el.network, pull.segment, pull.vertex, back, false));
    }
    this.ctx.requestRender();
  }

  onPointerUp(): void {
    this.pull = null;
  }

  override onCancel(): void {
    this.pull = null;
    this.outgoing = null;
    super.onCancel();
  }

  /** Esc lets go of the selected end (to start elsewhere), with the handle pulled from it. */
  override onCommand(command: string): boolean {
    if (command === "cancel") this.outgoing = null;
    return super.onCommand(command);
  }

  /** A new vector with one point under the pointer, in the frame there, now being edited. */
  private startVector(p: CanvasPointer): void {
    const at = roundPoint(p.world);
    const { doc } = this.ctx;
    const network: VectorNetwork = { vertices: [at], segments: [], regions: [] };
    const draft = createVector(network, nextLayerName(doc.all(), "Vector"), doc.nextIndex(), null);
    const vector: VectorElement = { ...draft, parentId: parentFor(this.ctx, draft) };
    doc.checkpoint();
    doc.add(vector);
    this.session.start(vector.id);
    this.ctx.setSelection([vector.id]);
    this.select([0]);
    this.pull = { start: p, vertex: 0, segment: null };
  }

  /** Gives a new segment leaving `from` the handle pulled out when `from` was placed. */
  private withOutgoing(network: VectorNetwork, segment: number, from: number): VectorNetwork {
    const out = this.outgoing;
    this.outgoing = null;
    return out && out.vertex === from
      ? setTangent(network, segment, from, out.tangent, false)
      : network;
  }
}
