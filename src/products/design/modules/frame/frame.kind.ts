import { rectContainsPoint, type ElementView, type Point, type Rect, type Size } from "@canvas";

import type { DesignToolOptions } from "../../design-options.types";
import { BoxShapeKind } from "../core";
import { createFrame } from "./frame.factory";
import { presetSize } from "./frame-presets";
import { FRAME_DEFAULTS } from "./frame.defaults";
import { drawFrame } from "./frame.draw";
import { labelRect, showsLabel } from "./frame-label";
import type { FrameElement } from "./frame.types";

/** Frames hold other nodes; at the top of the page they show their name and are hit by it too. */
export class FrameKind extends BoxShapeKind<FrameElement> {
  readonly type = "frame";
  readonly label = "Frame";
  readonly description = "A container for layers, like a screen or an artboard.";
  override readonly tool = "frame";
  override readonly defaults = FRAME_DEFAULTS;
  override readonly container = true;

  createNode(rect: Rect, name: string, index: string, parentId: string | null): FrameElement {
    return createFrame(rect, name, index, parentId);
  }

  /** A click places a frame of the preset picked in the frame tool's panel. */
  override clickSize(options: DesignToolOptions): Size {
    return presetSize(options.framePreset);
  }

  draw(view: ElementView, el: FrameElement): void {
    drawFrame(view, el);
  }

  override hitTest(el: FrameElement, p: Point, tolerance: number): boolean {
    if (super.hitTest(el, p, tolerance)) return true;
    return showsLabel(el) && rectContainsPoint(labelRect(el), p, tolerance);
  }

  override fillDefaults(el: FrameElement): FrameElement {
    return {
      ...super.fillDefaults(el),
      cornerRadius: el.cornerRadius ?? FRAME_DEFAULTS.cornerRadius,
      clipsContent: el.clipsContent ?? FRAME_DEFAULTS.clipsContent,
    };
  }
}
