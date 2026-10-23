import {
  boxSidesStroke,
  type BoxSides,
  type PathShape,
  optionalBoolean,
  optionalString,
  rectContainsPoint,
  scaleLength,
  type ElementBuildContext,
  type ElementClip,
  type ElementPatch,
  type ElementSpec,
  type ElementView,
  type Point,
  type Rect,
  type ScaleTransform,
  type Size,
} from "@canvas";

import type { DesignToolOptions } from "../../design-options.types";
import {
  BoxShapeKind,
  EMPTY_GEOMETRY,
  networkGeometry,
  NODE_STYLE_FIELDS,
  nonNegative,
  readAutoLayout,
  rectNetwork,
  type LayoutAxis,
  type NodeBuildContext,
  type NodeGeometry,
} from "../core";
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
  override readonly styleFields = [...NODE_STYLE_FIELDS, "cornerRadius"];
  override readonly sidedStrokes = true;

  /** Each side's own weight round its (rounded) box. */
  protected override sidedStrokeArea(el: FrameElement, sides: BoxSides): PathShape {
    return boxSidesStroke(el.w, el.h, el.cornerRadius, sides, el.strokeAlign);
  }

  /** Undashed, and its corners round or mitered (inside, joins don't show). */
  protected override boxStroke(el: FrameElement): boolean {
    if (el.strokeDashes.length > 0) return false;
    return el.strokeAlign === "inside" || el.strokeJoin === "miter" || el.cornerRadius > 0;
  }
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
    layout: {
      type: ["object", "null"],
      description:
        "Frame: auto layout, as in Figma: its layers placed one after another in layer order " +
        '(bottom first). { direction: "horizontal" | "vertical", gap, padding (number, [v, h], ' +
        '[top, right, bottom, left] or { top, right, bottom, left }), align: "start" | "center" | ' +
        '"end" | "space-between", counterAlign: "start" | "center" | "end" | "baseline", wrap, ' +
        "counterGap (between wrapped lines), strokesIncluded, reverseStacking }; missing fields " +
        "keep their value (new: a row, gap 10, padding 10). null removes it. With sizing " +
        '{ h: "hug" } the frame takes its layers\' width.',
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
      ...(args.layout !== undefined ? { layout: readAutoLayout(args.layout, null) } : {}),
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
    if (!("layout" in patch)) return super.completePatch(el, patch, context);
    const layout = readAutoLayout(patch.layout, el.layout);
    // Without a layout, nothing is left to hug.
    const sizing = patch.sizing ?? el.sizing;
    const fixed = (axis: "h" | "v") => (sizing[axis] === "hug" ? "fixed" : sizing[axis]);
    const next = {
      ...patch,
      layout,
      ...(layout ? {} : { sizing: { h: fixed("h"), v: fixed("v") } }),
    };
    return super.completePatch(el, next, context);
  }

  /** An auto layout frame may hug its layers. */
  override hugs(el: FrameElement, axis: LayoutAxis): boolean {
    return el.layout !== null && el.sizing[axis] === "hug";
  }

  override geometryKey(el: FrameElement): string {
    return `${el.w},${el.h},${el.cornerRadius}`;
  }

  /** Its (rounded) box; frames don't become vectors, so it isn't their `vectorNetwork`. */
  protected override buildGeometry(el: FrameElement): NodeGeometry {
    return networkGeometry(rectNetwork(el.w, el.h, el.cornerRadius), false);
  }

  draw(view: ElementView, el: FrameElement): void {
    drawFrame(view, el, this.geometry(el) ?? EMPTY_GEOMETRY, this.strokeOf(el));
  }

  protected override hitsShape(el: FrameElement, p: Point, tolerance: number): boolean {
    if (super.hitsShape(el, p, tolerance)) return true;
    return showsLabel(el) && rectContainsPoint(labelRect(el), p, tolerance);
  }

  /** Its corners round in proportion; its children are scaled as its members. */
  override scale(el: FrameElement, t: ScaleTransform): ElementPatch<FrameElement> {
    return { ...super.scale(el, t), cornerRadius: scaleLength(t, el.cornerRadius) };
  }

  override fillDefaults(el: FrameElement): FrameElement {
    return {
      ...super.fillDefaults(el),
      cornerRadius: el.cornerRadius ?? FRAME_DEFAULTS.cornerRadius,
      clipsContent: el.clipsContent ?? FRAME_DEFAULTS.clipsContent,
      layout: el.layout ?? null,
    };
  }
}
