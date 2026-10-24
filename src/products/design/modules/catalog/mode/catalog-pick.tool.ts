import {
  rectFromPoints,
  type CanvasPointer,
  type Point,
  type ResizeMode,
  type Tool,
  type ToolContext,
} from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import { DESIGN_BROCHURE } from "../model";
import { CATALOG_PICK_TOOL, CATALOG_TOOL } from "./catalog-mode.constants";

/**
 * Ticks the frames the brochure uses, as the selection: it starts with the pages already in it, a
 * click ticks or unticks a frame and a marquee ticks what it touches. The banner applies the ticks
 * (`applyPick`); Esc goes back to the Catalog tool without them.
 */
export class CatalogPickTool implements Tool {
  readonly id = CATALOG_PICK_TOOL;
  readonly cursor = "default";
  readonly resizeMode: ResizeMode = "none";
  private marquee: { start: Point; base: ReadonlySet<string> } | null = null;

  constructor(private readonly ctx: ToolContext<DesignToolOptions>) {}

  onActivate(): void {
    const printed = this.ctx
      .service(DESIGN_BROCHURE)
      .pages()
      .map((page) => page.frame.id);
    this.ctx.setSelection(printed.filter((id) => this.ctx.getElement(id)));
  }

  onPointerDown(p: CanvasPointer): void {
    const hit = this.ctx.elementAt(p.world);
    const ticked = new Set(this.ctx.getSelection());
    if (!hit) {
      this.marquee = { start: p.world, base: ticked };
      return;
    }
    if (ticked.has(hit.id)) ticked.delete(hit.id);
    else ticked.add(hit.id);
    this.ctx.setSelection(ticked);
  }

  onPointerMove(p: CanvasPointer): void {
    if (!this.marquee) return;
    const rect = rectFromPoints(this.marquee.start, p.world);
    this.ctx.setMarquee(rect);
    const hits = this.ctx.elementsInRect(rect).map((el) => el.id);
    this.ctx.setSelection(new Set([...this.marquee.base, ...hits]));
  }

  onPointerUp(): void {
    this.onCancel();
  }

  onHover(p: CanvasPointer): void {
    this.ctx.setHover(this.ctx.elementAt(p.world)?.id ?? null);
  }

  onCancel(): void {
    this.marquee = null;
    this.ctx.setMarquee(null);
  }

  /** Esc leaves picking without changing the brochure; Delete never deletes a frame here. */
  onCommand(command: string): boolean {
    if (command === "cancel") {
      this.ctx.setSelection([]);
      this.ctx.setTool(CATALOG_TOOL);
      return true;
    }
    return command === "deleteSelection";
  }
}
