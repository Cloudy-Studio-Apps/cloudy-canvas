import {
  rectFromPoints,
  type CanvasPointer,
  type Point,
  type Rect,
  type Size,
  type Tool,
  type ToolContext,
} from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import type { DesignNode } from "../node";
import { containerAt } from "../tree";
import { nextLayerName } from "./next-layer-name";

const DRAG_THRESHOLD = 4; // screen px
/** Smallest node a drag draws, in world units (a design's pixels). */
const MIN_SIZE = 1;

/**
 * The base of tools that draw a box-shaped node: drag to draw it (Shift for equal sides), or click
 * to place one of `clickSize()` centered on the pointer. The node goes into the frame under its
 * center, is selected, and the select tool comes back. Subclasses give the `id`, `layerName`,
 * `clickSize` and `createNode`.
 */
export abstract class BoxDrawTool<E extends DesignNode> implements Tool {
  abstract readonly id: string;
  readonly cursor: string = "crosshair";
  /** The base name of its layers ("Rectangle" → "Rectangle 1", "Rectangle 2", …). */
  protected abstract readonly layerName: string;
  private start: CanvasPointer | null = null;
  private nodeId: string | null = null;

  constructor(protected readonly ctx: ToolContext<DesignToolOptions>) {}

  /** A new node with these bounds, name, z-order index and parent. */
  protected abstract createNode(
    rect: Rect,
    name: string,
    index: string,
    parentId: string | null,
  ): E;

  /** Size of a node placed with a click (may follow the tool options). */
  protected abstract clickSize(): Size;

  onPointerDown(p: CanvasPointer): void {
    this.ctx.setSelection([]);
    this.start = p;
    this.nodeId = null;
  }

  onPointerMove(p: CanvasPointer): void {
    const start = this.start;
    if (!start) return;
    const rect = dragRect(start.world, p.world, p.shiftKey);
    if (this.nodeId) return this.ctx.doc.update(this.nodeId, rect);
    const distance = Math.hypot(p.screen.x - start.screen.x, p.screen.y - start.screen.y);
    if (distance >= DRAG_THRESHOLD) this.nodeId = this.add(rect);
  }

  onPointerUp(p: CanvasPointer): void {
    if (!this.start) return;
    const id = this.nodeId ?? this.add(clickRect(p.world, this.clickSize()));
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

  private add(rect: Rect): string {
    const { doc } = this.ctx;
    const name = nextLayerName(doc.all(), this.layerName);
    const node = this.createNode(rect, name, doc.nextIndex(), this.parentAt(rect, null));
    doc.checkpoint();
    doc.add(node);
    return node.id;
  }

  /** Puts the finished node into the frame under its center (in the same undo step). */
  private placeInContainer(id: string): void {
    const node = this.ctx.getElement(id) as E | undefined;
    if (!node) return;
    const parentId = this.parentAt(node, id);
    if (parentId !== node.parentId) this.ctx.doc.update(id, { parentId } as Partial<E>);
  }

  private parentAt(rect: Rect, self: string | null): string | null {
    const probe = { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2, w: 0, h: 0 };
    const under = this.ctx.elementsInRect(probe);
    return containerAt(rect, under, this.ctx.kinds, new Set(self ? [self] : []))?.id ?? null;
  }
}

function clickRect(center: Point, { w, h }: Size): Rect {
  return { x: Math.round(center.x - w / 2), y: Math.round(center.y - h / 2), w, h };
}

function dragRect(a: Point, b: Point, square: boolean): Rect {
  let end = b;
  if (square) {
    const size = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    end = { x: a.x + Math.sign(b.x - a.x || 1) * size, y: a.y + Math.sign(b.y - a.y || 1) * size };
  }
  const rect = rectFromPoints(a, end);
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    w: Math.max(MIN_SIZE, Math.round(rect.w)),
    h: Math.max(MIN_SIZE, Math.round(rect.h)),
  };
}
