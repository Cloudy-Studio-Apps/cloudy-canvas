import type { CanvasPointer, ElementPatch, Point, ToolContext } from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import { NodeDrawTool } from "../../core";
import { createSheet, type SheetFrame } from "../sheet";
import { t } from "../styleguide.i18n";

/** The live element tool's id (Shift+D, in the toolbar's frames menu). */
export const TOKEN_SHEET_TOOL = "token-sheet";

/**
 * Places a live design-system element where it's clicked (dragging moves where it starts, its
 * size follows its content), into the frame under it, then selects it: the properties panel shows
 * what it draws. It starts with `defaultCategory`, the first category with tokens.
 */
export class TokenSheetTool extends NodeDrawTool<SheetFrame, Point> {
  readonly id = TOKEN_SHEET_TOOL;

  constructor(
    ctx: ToolContext<DesignToolOptions>,
    private readonly defaultCategory: () => { id: string; label: string },
  ) {
    super(ctx);
  }

  protected layerName(): string {
    return t("defaults.systemPage");
  }

  protected dragShape(_from: Point, to: CanvasPointer): Point {
    return to.world;
  }

  protected clickShape(at: Point): Point {
    return at;
  }

  protected createNode(at: Point, name: string, index: string): SheetFrame {
    const category = this.defaultCategory();
    return createSheet({ category: category.id }, name, at, index, null);
  }

  protected shapePatch(at: Point): ElementPatch<SheetFrame> {
    return { x: at.x, y: at.y };
  }
}
