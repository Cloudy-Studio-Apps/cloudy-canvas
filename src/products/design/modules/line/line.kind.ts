import {
  distanceToSegmentSq,
  optionalChoice,
  type ElementBuildContext,
  type ElementHandle,
  type ElementInteraction,
  type ElementPatch,
  type ElementSpec,
  type ElementView,
  type InteractionQuery,
  type Point,
  angleOf,
  normalizeAngle,
  rotatePoint,
  scaleLength,
  scalePoint,
  type ScaleTransform,
} from "@canvas";

import type { DesignToolOptions } from "../../design-options.types";
import {
  DesignNodeKind,
  flipPaints,
  mirrorPoint,
  NODE_STYLE_FIELDS,
  pointArg,
  type FlipAxis,
  type NodeBuildContext,
} from "../core";
import { LINE_DEFAULTS } from "./line.defaults";
import { drawLine } from "./line.draw";
import { LineEndDrag } from "./line-end-drag";
import { createLine } from "./line.factory";
import { lineEnds, lineFromEnds } from "./line-geometry";
import type { LineCap, LineNodeElement } from "./line.types";

const CAPS: readonly LineCap[] = ["none", "arrow"];
const POINT = { type: "object", properties: { x: { type: "number" }, y: { type: "number" } } };

/**
 * Lines and arrows: hit near the line, selected by their two ends (dragged to change them) rather
 * than a box, turned by moving their ends, and painted with strokes only.
 */
export class LineKind extends DesignNodeKind<LineNodeElement> {
  readonly type = "line";
  readonly label = "Line";
  readonly description = "A straight line, with an arrowhead at either end if you like.";
  override readonly tool = "line";
  override readonly defaults = LINE_DEFAULTS;
  override readonly boxed = false;
  override readonly resizable = false;
  override readonly scalable = true;
  override readonly fillable = false;
  override readonly creatable = true;
  override readonly styleFields = [...NODE_STYLE_FIELDS, "startCap", "endCap"];
  override readonly specProperties = {
    start: { ...POINT, description: "Line: its start (default: x, y)." },
    end: { ...POINT, description: "Line: its end (default: x + w, y + h; w is 100, h 0)." },
    startCap: { enum: CAPS, description: "Line: how its start looks (none)." },
    endCap: { enum: CAPS, description: 'Line: how its end looks ("arrow" makes an arrow).' },
  };

  draw(view: ElementView, el: LineNodeElement): void {
    drawLine(view, el);
  }

  override hitTest(el: LineNodeElement, p: Point, tolerance: number): boolean {
    if (!el.visible) return false;
    const { start, end } = lineEnds(el);
    const radius = el.strokeWeight / 2 + tolerance + LINE_DEFAULTS.reach;
    return distanceToSegmentSq(p, start.x, start.y, end.x, end.y) <= radius * radius;
  }

  /** A line's ends hold its angle: turning moves them, and its `rotation` stays 0. */
  override rotate(
    el: LineNodeElement,
    degrees: number,
    pivot: Point,
  ): ElementPatch<LineNodeElement> {
    const { start, end } = lineEnds(el);
    const turn = (p: Point) => {
      const q = rotatePoint(p, pivot, degrees);
      return { x: Math.round(q.x * 100) / 100, y: Math.round(q.y * 100) / 100 };
    };
    return { ...lineFromEnds(turn(start), turn(end)), rotation: 0 };
  }

  /** The angle it runs at, from its start to its end. */
  override turnOf(el: LineNodeElement): number {
    const { start, end } = lineEnds(el);
    return normalizeAngle(angleOf(end, start));
  }

  /** Flipping mirrors its ends. */
  override flip(el: LineNodeElement, axis: FlipAxis, at: number): ElementPatch<LineNodeElement> {
    const { start, end } = lineEnds(el);
    return {
      ...lineFromEnds(mirrorPoint(start, axis, at), mirrorPoint(end, axis, at)),
      rotation: 0,
      ...flipPaints(el, axis),
    };
  }

  /** Its ends scale (the Scale tool), and its stroke weight. */
  override scale(el: LineNodeElement, t: ScaleTransform): ElementPatch<LineNodeElement> {
    const { start, end } = lineEnds(el);
    return {
      ...lineFromEnds(scalePoint(t, start), scalePoint(t, end)),
      strokeWeight: scaleLength(t, el.strokeWeight),
    };
  }

  override handles(el: LineNodeElement): ElementHandle[] {
    const { start, end } = lineEnds(el);
    return [start, end];
  }

  override interactionAt(
    el: LineNodeElement,
    p: Point,
    query: InteractionQuery,
  ): ElementInteraction<DesignToolOptions> | null {
    if (!query.selected || el.locked) return null;
    const ends = lineEnds(el);
    for (const which of ["end", "start"] as const) {
      if (Math.hypot(p.x - ends[which].x, p.y - ends[which].y) > query.reach) continue;
      return { cursor: "move", press: (ctx) => new LineEndDrag(ctx, el, which) };
    }
    return null;
  }

  protected override nodeFromSpec(
    spec: ElementSpec,
    index: string,
    context: NodeBuildContext,
  ): LineNodeElement {
    const { args } = spec;
    const start =
      args.start === undefined ? { x: spec.x, y: spec.y } : pointArg(args.start, "start");
    const end =
      args.end === undefined
        ? { x: start.x + (spec.w ?? LINE_DEFAULTS.size.w), y: start.y + (spec.h ?? 0) }
        : pointArg(args.end, "end");
    const endCap = optionalChoice(args, "endCap", CAPS) ?? "none";
    const name = context.nameFor(endCap === "arrow" ? "Arrow" : this.label);
    const line = createLine(start, end, name, index, null, endCap);
    return { ...line, startCap: optionalChoice(args, "startCap", CAPS) ?? line.startCap };
  }

  /** New `points` (relative to x, y) re-wrap the line's bounds around its ends. */
  override completePatch(
    el: LineNodeElement,
    patch: ElementPatch<LineNodeElement>,
    context: ElementBuildContext,
  ): ElementPatch<LineNodeElement> {
    optionalChoice(patch, "startCap", CAPS);
    optionalChoice(patch, "endCap", CAPS);
    let next = patch;
    if ("points" in patch) {
      const points = patch.points as unknown;
      if (
        !Array.isArray(points) ||
        points.length !== 4 ||
        !points.every((n) => typeof n === "number" && Number.isFinite(n))
      ) {
        throw new Error('"points" must be [x0, y0, x1, y1], relative to the line\'s x, y.');
      }
      const [x0, y0, x1, y1] = points as number[];
      const x = patch.x ?? el.x;
      const y = patch.y ?? el.y;
      next = {
        ...patch,
        ...lineFromEnds({ x: x + x0!, y: y + y0! }, { x: x + x1!, y: y + y1! }),
      };
    }
    return super.completePatch(el, next, context);
  }

  override fillDefaults(el: LineNodeElement): LineNodeElement {
    return {
      ...super.fillDefaults(el),
      points: el.points ?? [0, 0, el.w, el.h],
      startCap: el.startCap ?? "none",
      endCap: el.endCap ?? "none",
    };
  }
}
