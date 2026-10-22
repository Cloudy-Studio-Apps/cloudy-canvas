import type { CanvasPointer, Point, Tool, ToolContext } from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import {
  hitSegment,
  placeNetwork,
  removeParts,
  segmentsAt,
  tangentAt,
  vertexAt,
  type VectorNetwork,
} from "../../core";
import { isVector } from "./edit-vector";
import { activeVertices, drawVectorOverlay, OVERLAY_PX } from "./vector-overlay";
import { VECTOR_EDIT, type VectorEditSession } from "./vector-edit-session";
import { VECTOR_TOOLS } from "./vector-tools";
import type { VectorElement } from "../vector.types";
import type { VectorPart } from "./vector-edit.types";

/** Grab distance around points and segments, in screen pixels. */
const REACH_PX = 6;

/** The mode's tools: switching to any other one ends the editing. */
const EDIT_TOOLS: ReadonlySet<string> = new Set(Object.values(VECTOR_TOOLS));

/**
 * The base of the vector edit tools (template method): it shows the overlay while it's on, finds
 * what a press lands on, writes network edits (re-placing the node around its curves), and takes
 * the mode's commands: Enter (Done) leaves it, Esc lets go of the selected points, V is Move
 * points, Delete removes the selected points and segments, Ctrl+A selects every point. Subclasses handle the pointer.
 */
export abstract class VectorEditTool implements Tool {
  abstract readonly id: string;
  readonly cursor: string = "default";

  constructor(protected readonly ctx: ToolContext<DesignToolOptions>) {}

  protected get session(): VectorEditSession {
    return this.ctx.service(VECTOR_EDIT);
  }

  /** The vector being edited, if it's still there. */
  protected vector(): VectorElement | null {
    const id = this.session.vectorId;
    const el = id ? this.ctx.getElement(id) : undefined;
    return isVector(el) ? el : null;
  }

  /** A world point in the vector's local coordinates. */
  protected local(el: VectorElement, world: Point): Point {
    return { x: world.x - el.x, y: world.y - el.y };
  }

  /** What's under the pointer: a handle of an active vertex, a vertex, a segment, or nothing. */
  protected partAt(el: VectorElement, world: Point): VectorPart {
    const p = this.local(el, world);
    const reach = REACH_PX / this.ctx.camera.zoom;
    const { network } = el;
    for (const vertex of activeVertices(el, this.session.selection)) {
      const at = network.vertices[vertex];
      if (!at) continue;
      for (const segment of segmentsAt(network, vertex)) {
        const t = tangentAt(network.segments[segment]!, vertex);
        if (t.x === 0 && t.y === 0) continue;
        if (Math.hypot(at.x + t.x - p.x, at.y + t.y - p.y) <= reach)
          return { kind: "handle", segment, vertex };
      }
    }
    const vertex = vertexAt(network, p, Math.max(reach, OVERLAY_PX.vertex / this.ctx.camera.zoom));
    if (vertex !== null) return { kind: "vertex", vertex };
    const hit = hitSegment(network, p, reach + el.strokeWeight / 2);
    return hit ? { kind: "segment", ...hit } : { kind: "none" };
  }

  /**
   * Writes a new network for `origin` (the vector as it was when the gesture started, so drags
   * don't drift): the node moves and resizes to wrap its curves.
   */
  protected write(origin: VectorElement, network: VectorNetwork): void {
    this.ctx.doc.update(origin.id, placeNetwork(origin, network));
  }

  /** Starts a new undo step and writes, for one-shot edits (a click). */
  protected commit(origin: VectorElement, network: VectorNetwork): void {
    this.ctx.doc.checkpoint();
    this.write(origin, network);
  }

  /** Selects points and segments of the edited vector (and redraws the overlay). */
  protected select(vertices: Iterable<number>, segments: Iterable<number> = []): void {
    this.session.select(vertices, segments);
    this.ctx.requestRender();
  }

  /** Leaves the edit mode: the select tool, with the vector selected (removed if it's empty). */
  protected leave(): void {
    const el = this.vector();
    this.session.stop();
    this.ctx.setTool("select");
    if (!el) return;
    if (el.network.vertices.length < 2 && el.network.segments.length === 0) {
      this.ctx.doc.remove([el.id]);
      this.ctx.setSelection([]);
    } else {
      this.ctx.setSelection([el.id]);
    }
  }

  onActivate(): void {
    this.ctx.setGuide((g, view) => {
      const el = this.vector();
      if (el) drawVectorOverlay(g, view, el, this.session.selection);
    });
  }

  /** Switching to a tool outside the mode (V, R, …) ends the editing too. */
  onCancel(): void {
    this.ctx.setGuide(null);
    queueMicrotask(() => {
      if (!EDIT_TOOLS.has(this.ctx.getTool())) this.session.stop();
    });
  }

  /**
   * The mode's commands. Only Enter (or Done, which runs it) leaves; Esc lets go of the selected
   * points. V is Move points here, and other tool shortcuts wait until the mode is left.
   */
  onCommand(command: string): boolean {
    const el = this.vector();
    if (!el) return false;
    if (command === "tool.select") {
      this.ctx.setTool(VECTOR_TOOLS.move);
      return true;
    }
    if (command.startsWith("tool.")) return !EDIT_TOOLS.has(command.slice("tool.".length));
    switch (command) {
      case "editSelection":
        this.leave();
        return true;
      case "cancel":
        this.select([]);
        return true;
      case "deleteSelection": {
        const { vertices, segments } = this.session.selection;
        if (vertices.size + segments.size === 0) return true;
        this.commit(el, removeParts(el.network, vertices, segments));
        this.select([]);
        return true;
      }
      case "selectAll":
        this.select(el.network.vertices.keys());
        return true;
      default:
        return false;
    }
  }

  abstract onPointerDown(p: CanvasPointer): void;
}
