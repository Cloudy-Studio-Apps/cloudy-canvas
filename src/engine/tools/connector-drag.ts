import {
  createConnectorShape,
  isConnector,
  type ConnectorEnd,
  type ConnectorStyleOptions,
} from "../document";
import type { Point } from "../geometry.types";
import type { ConnectorDragTarget } from "./connector-drag.types";
import type { CanvasPointer, ToolContext } from "./tool.types";

const DRAG_THRESHOLD = 4; // screen px

/**
 * Drags a connector end. Over a shape the end sticks to it (and follows it from then on);
 * elsewhere it stays free. The canvas auto-pans near the edges so far-away shapes can be reached.
 */
export class ConnectorDrag {
  private id: string | null;
  private which: "start" | "end";
  private started = false;
  private screen: Point;

  constructor(
    private readonly ctx: ToolContext,
    private readonly target: ConnectorDragTarget,
    private readonly origin: CanvasPointer,
  ) {
    this.id = target.kind === "existing" ? target.id : null;
    this.which = target.kind === "existing" ? target.which : "end";
    this.screen = origin.screen;
    ctx.setCursor("crosshair");
  }

  /** Id of the connector being edited, once it exists. */
  get connectorId(): string | null {
    return this.id;
  }

  move(p: CanvasPointer): void {
    this.screen = p.screen;
    if (!this.started) {
      const distance = Math.hypot(
        p.screen.x - this.origin.screen.x,
        p.screen.y - this.origin.screen.y,
      );
      if (distance < DRAG_THRESHOLD) return;
      this.started = true;
      this.ctx.doc.checkpoint();
    }
    this.update();
    this.ctx.autoPan(p.screen, () => this.update());
  }

  /** Re-applies the end at the pointer's world position (e.g. after the camera moved). */
  update(): void {
    if (!this.started) return;
    const { doc } = this.ctx;
    const world = this.ctx.camera.screenToWorld(this.screen);
    const end = this.endAt(world);

    if (this.id === null && this.target.kind === "new") {
      const connector = createConnectorShape(this.target.start, end, this.style(), doc.nextIndex());
      doc.add(connector);
      this.id = connector.id;
      return;
    }
    if (this.id) doc.update(this.id, { [this.which]: end });
  }

  /** Ends the drag; returns whether a connector was created or changed. */
  finish(): boolean {
    this.cancel();
    if (!this.started || !this.id) return false;
    this.ctx.setSelection([this.id]);
    return true;
  }

  cancel(): void {
    this.ctx.autoPan(null);
    this.ctx.setHover(null);
  }

  private endAt(world: Point): ConnectorEnd {
    const exclude = new Set<string>();
    const other = this.otherEnd();
    if (other?.shapeId) exclude.add(other.shapeId);
    const shape = this.ctx.connectableAt(world, exclude);
    this.ctx.setHover(shape?.id ?? null);
    return {
      shapeId: shape?.id ?? null,
      side: null,
      x: Math.round(world.x),
      y: Math.round(world.y),
    };
  }

  private otherEnd(): ConnectorEnd | undefined {
    if (this.target.kind === "new") return this.target.start;
    const connector = this.ctx.doc.get(this.target.id);
    if (!isConnector(connector)) return undefined;
    return this.which === "start" ? connector.end : connector.start;
  }

  private style(): ConnectorStyleOptions {
    const o = this.ctx.getOptions();
    return {
      style: o.connectorStyle,
      color: o.connectorColor,
      startHead: o.connectorStartHead,
      endHead: o.connectorEndHead,
    };
  }
}
