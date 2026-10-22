import {
  optionalBoolean,
  optionalString,
  rectContainsPoint,
  type ElementBuildContext,
  type ElementClip,
  type ElementPatch,
  type ElementSpec,
  type ElementView,
  type Point,
  type Rect,
  type Size,
} from "@canvas";

import type { DesignToolOptions } from "../../design-options.types";
import { BoxShapeKind, nonNegative, type NodeBuildContext } from "../core";
import { createFrame } from "./frame.factory";
import { FRAME_PRESETS, findPreset, presetSize } from "./frame-presets";
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
  override readonly specProperties = {
    preset: {
      type: "string",
      description: "Frame: a preset size when w/h aren't given (list_frame_presets).",
    },
    cornerRadius: { type: "number", description: "Frame or rectangle: corner radius." },
    clipsContent: {
      type: "boolean",
      description: "Frame: hide what its layers draw outside it (true by default).",
    },
  };

  createNode(rect: Rect, name: string, index: string, parentId: string | null): FrameElement {
    return createFrame(rect, name, index, parentId);
  }

  /** A click places a frame of the preset picked in the frame tool's panel. */
  override clickSize(options: DesignToolOptions): Size {
    return presetSize(options.framePreset);
  }

  /** With "Clip content", its children only show inside it, round corners included. */
  override contentClip(el: FrameElement): ElementClip | null {
    if (!el.clipsContent) return null;
    const rect = { x: el.x, y: el.y, w: el.w, h: el.h };
    return { rect, radius: el.cornerRadius, rotation: el.rotation ?? 0 };
  }

  protected override nodeFromSpec(
    spec: ElementSpec,
    index: string,
    context: NodeBuildContext,
  ): FrameElement {
    const frame = super.nodeFromSpec(spec, index, context);
    const { args } = spec;
    const preset = optionalString(args, "preset");
    return {
      ...frame,
      ...(preset && spec.w === undefined && spec.h === undefined
        ? { name: context.nameFor(findPreset(preset)!.label) }
        : {}),
      ...(args.cornerRadius !== undefined
        ? { cornerRadius: nonNegative(args.cornerRadius, "cornerRadius") }
        : {}),
      clipsContent: optionalBoolean(args, "clipsContent") ?? frame.clipsContent,
    };
  }

  /** A preset's size (`preset`), or the frame tool's. */
  protected override specSize(spec: ElementSpec, options: DesignToolOptions): Size {
    const preset = optionalString(spec.args, "preset");
    if (preset === undefined) return super.specSize(spec, options);
    const found = findPreset(preset);
    if (!found) {
      const ids = FRAME_PRESETS.map((item) => item.id).join(", ");
      throw new Error(`No frame preset "${preset}". Use one of: ${ids}.`);
    }
    return found.size;
  }

  override completePatch(
    el: FrameElement,
    patch: ElementPatch<FrameElement>,
    context: ElementBuildContext,
  ): ElementPatch<FrameElement> {
    if ("cornerRadius" in patch) nonNegative(patch.cornerRadius, "cornerRadius");
    return super.completePatch(el, patch, context);
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
