import type { Rect, Size } from "@canvas";

import { BoxDrawTool } from "../core";
import { createFrame } from "./frame.factory";
import { presetSize } from "./frame-presets";
import type { FrameElement } from "./frame.types";

/** Draws frames (F): drag, Shift for a square, or click for one of the picked preset's size. */
export class FrameTool extends BoxDrawTool<FrameElement> {
  readonly id = "frame";
  protected readonly layerName = "Frame";

  protected clickSize(): Size {
    return presetSize(this.ctx.getOptions().framePreset);
  }

  protected createNode(
    rect: Rect,
    name: string,
    index: string,
    parentId: string | null,
  ): FrameElement {
    return createFrame(rect, name, index, parentId);
  }
}
