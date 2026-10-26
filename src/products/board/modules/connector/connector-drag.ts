import { DRAW_THRESHOLD_PX, pastThreshold, TokenStore } from "@canvas";
import type { CanvasPointer, ElementGesture, Point, ToolContext } from "@canvas";

import type { BoardToolOptions } from "../../board-options.types";
import { connectableAt } from "./connectable-at";
import { createConnector } from "./connector.factory";
import type { ConnectorEnd, ConnectorEndName, ConnectorLook } from "./connector.types";
import type { ConnectorDragTarget } from "./connector-drag.types";
import { isConnector } from "./is-connector";
import { newColorBindings } from "../../tokens";
import { CONNECTOR_DEFAULTS } from "./connector.defaults";

/**
 * Drags a connector end. Over a connectable element the end sticks to it (and follows it from
 * then on); elsewhere it stays free. The canvas auto-pans near the edges so far-away elements can
 * be reached.
 */
export class ConnectorDrag implements ElementGesture {
  private id: string | null;
  private readonly which: ConnectorEndName;
  private started = false;
  private screen: Point;

  constructor(
    private readonly ctx: ToolContext<BoardToolOptions>,
    private readonly target: ConnectorDragTarget,
    private readonly origin: CanvasPointer,
  ) {
    this.id = target.kind === "existing" ? target.id : null;
    this.which = target.kind === "existing" ? target.which : "end";
    this.screen = origin.screen;
    ctx.setCursor("crosshair");
  }

  /** Whether a connector was created or changed. */
  get changed(): boolean {
    return this.started && this.id !== null;
  }

  move(p: CanvasPointer): void {
    this.screen = p.screen;
    if (!this.started) {
      if (!pastThreshold(this.origin, p, DRAW_THRESHOLD_PX)) return;
      this.started = true;
      this.ctx.doc.checkpoint();
    }
    this.update();
    this.ctx.autoPan(p.screen, () => this.update());
  }

  onCameraChange(): void {
    this.update();
  }

  finish(): void {
    this.cancel();
    if (this.changed && this.id) this.ctx.setSelection([this.id]);
  }

  cancel(): void {
    this.ctx.autoPan(null);
    this.ctx.setHover(null);
  }

  /** Re-applies the end at the pointer's world position (e.g. after the camera moved). */
  private update(): void {
    if (!this.started) return;
    const { doc } = this.ctx;
    const end = this.endAt(this.ctx.camera.screenToWorld(this.screen));

    if (this.id === null && this.target.kind === "new") {
      const connector = {
        ...createConnector(this.target.start, end, this.look(), doc.nextIndex()),
        ...newColorBindings(
          this.ctx.getOptions(),
          CONNECTOR_DEFAULTS.colorOptions,
          TokenStore.of(this.ctx.doc),
        ),
      };
      doc.add(connector);
      this.id = connector.id;
      return;
    }
    if (this.id) doc.update(this.id, { [this.which]: end });
  }

  private endAt(world: Point): ConnectorEnd {
    const exclude = new Set<string>();
    const other = this.otherEnd();
    if (other?.shapeId) exclude.add(other.shapeId);
    if (this.id) exclude.add(this.id);
    const el = connectableAt(this.ctx, world, exclude);
    this.ctx.setHover(el?.id ?? null);
    return { shapeId: el?.id ?? null, side: null, x: Math.round(world.x), y: Math.round(world.y) };
  }

  private otherEnd(): ConnectorEnd | undefined {
    if (this.target.kind === "new") return this.target.start;
    const connector = this.ctx.doc.get(this.target.id);
    if (!isConnector(connector)) return undefined;
    return this.which === "start" ? connector.end : connector.start;
  }

  private look(): ConnectorLook {
    const o = this.ctx.getOptions();
    return {
      style: o.connectorStyle,
      color: o.connectorColor,
      startHead: o.connectorStartHead,
      endHead: o.connectorEndHead,
    };
  }
}
