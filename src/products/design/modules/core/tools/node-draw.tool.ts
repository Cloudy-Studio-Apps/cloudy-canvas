import {
  DRAW_THRESHOLD_PX,
  pastThreshold,
  type CanvasPointer,
  type ElementPatch,
  type Point,
  type Tool,
  type ToolContext,
} from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import type { DesignNode } from "../node";
import { parentFor } from "../tree";
import { nextLayerName } from "./next-layer-name";

/**
 * The base of tools that draw a node (template method): press and drag draws it live, a click
 * places a default one; then it goes into the frame under it, is selected, and the select tool
 * comes back, all in one undo step. Subclasses describe the shape `S` a gesture makes (a box, a
 * line's two ends) and how it becomes a node.
 */
export abstract class NodeDrawTool<E extends DesignNode, S> implements Tool {
  abstract readonly id: string;
  readonly cursor: string = "crosshair";
  private start: CanvasPointer | null = null;
  private nodeId: string | null = null;

  constructor(protected readonly ctx: ToolContext<DesignToolOptions>) {}

  /** The base of its layers' names ("Rectangle" → "Rectangle 1", …). */
  protected abstract layerName(): string;
  /** The shape a drag from `from` to `to` makes (`to.shiftKey`: constrained). */
  protected abstract dragShape(from: Point, to: CanvasPointer): S;
  /** The shape a click at `at` places. */
  protected abstract clickShape(at: Point): S;
  /** A new node of that shape (the tool puts it into its frame). */
  protected abstract createNode(shape: S, name: string, index: string): E;
  /** The patch that gives the node being drawn a new shape. */
  protected abstract shapePatch(shape: S): ElementPatch<E>;

  onPointerDown(p: CanvasPointer): void {
    this.ctx.setSelection([]);
    this.start = p;
    this.nodeId = null;
  }

  onPointerMove(p: CanvasPointer): void {
    const start = this.start;
    if (!start) return;
    const shape = this.dragShape(start.world, p);
    if (this.nodeId) this.ctx.doc.update(this.nodeId, this.shapePatch(shape));
    else if (pastThreshold(start, p, DRAW_THRESHOLD_PX)) this.nodeId = this.add(shape);
  }

  onPointerUp(p: CanvasPointer): void {
    if (!this.start) return;
    const id = this.nodeId ?? this.add(this.clickShape(p.world));
    this.start = null;
    this.nodeId = null;
    this.placeInContainer(id);
    this.ctx.setSelection([id]);
    this.ctx.setTool("select");
  }

  onCancel(): void {
    this.start = null;
    this.nodeId = null;
  }

  private add(shape: S): string {
    const { doc } = this.ctx;
    const name = nextLayerName(doc.all(), this.layerName());
    const node = this.createNode(shape, name, doc.nextIndex());
    doc.checkpoint();
    doc.add({ ...node, parentId: parentFor(this.ctx, node) });
    return node.id;
  }

  /** Puts the finished node into the frame under it (in the same undo step). */
  private placeInContainer(id: string): void {
    const node = this.ctx.getElement(id) as E | undefined;
    if (!node) return;
    const parentId = parentFor(this.ctx, node, new Set([id]));
    if (parentId !== node.parentId) this.ctx.doc.update(id, { parentId } as ElementPatch<E>);
  }
}
