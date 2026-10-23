import {
  optionalBoolean,
  type ElementBuildContext,
  type ElementPatch,
  type ElementSpec,
  type ElementView,
  type Point,
  type Rect,
} from "@canvas";
import type { Graphics } from "pixi.js";

import {
  DesignNodeKind,
  drawPaints,
  flipPaints,
  flipPlacement,
  hitSegment,
  insideRegion,
  NETWORK_SCHEMA,
  placeNetwork,
  polygonNetwork,
  polylineNetwork,
  readNetwork,
  scaleNetwork,
  traceRegions,
  traceStrokes,
  type FlipAxis,
  type NodeBuildContext,
  type VectorNetwork,
} from "../core";
import { VECTOR_DEFAULTS } from "./vector.defaults";
import { createVector } from "./vector.factory";
import type { VectorElement } from "./vector.types";

/**
 * Vectors: their regions are filled and their segments stroked; hit inside a filled region or
 * near a segment; stretched when resized. Double-click edits their points (`editElement`).
 */
export class VectorKind extends DesignNodeKind<VectorElement> {
  readonly type = "vector";
  readonly label = "Vector";
  readonly description = "A path of points and curves, drawn with the pen or the pencil.";
  override readonly tool = "pen";
  override readonly defaults = VECTOR_DEFAULTS;
  override readonly creatable = true;
  override readonly specProperties = {
    points: {
      type: "array",
      items: { type: "number" },
      description: "Vector: a path through world points as a flat list [x0, y0, x1, y1, …].",
    },
    closed: {
      type: "boolean",
      description: "Vector from points: join the last point to the first.",
    },
    network: NETWORK_SCHEMA,
  };

  override fillOutline(el: VectorElement): (g: Graphics) => void {
    return (g) => traceRegions(g, el.network);
  }

  draw(view: ElementView, el: VectorElement): void {
    drawPaints(
      view,
      el,
      { fill: (g) => traceRegions(g, el.network), stroke: (g) => traceStrokes(g, el.network) },
      { cap: "round", join: "round" },
    );
  }

  override hitTest(el: VectorElement, p: Point, tolerance: number): boolean {
    if (!super.hitTest(el, p, tolerance + el.strokeWeight + VECTOR_DEFAULTS.reach)) return false;
    const local = { x: p.x - el.x, y: p.y - el.y };
    const reach = el.strokeWeight / 2 + tolerance + VECTOR_DEFAULTS.reach;
    const filled = el.fills.some((paint) => paint.visible);
    return (
      hitSegment(el.network, local, reach) !== null || (filled && insideRegion(el.network, local))
    );
  }

  /** Its points and curves stretch with its box. */
  override resize(el: VectorElement, rect: Rect): ElementPatch<VectorElement> {
    const sx = el.w > 0 ? rect.w / el.w : 1;
    const sy = el.h > 0 ? rect.h / el.h : 1;
    return { ...rect, network: scaleNetwork(el.network, sx, sy) };
  }

  /** An agent's vector: a path through `points` (world), or a `network` relative to x, y. */
  protected override nodeFromSpec(
    spec: ElementSpec,
    index: string,
    context: NodeBuildContext,
  ): VectorElement {
    return createVector(this.specNetwork(spec), context.nameFor(this.label), index, null);
  }

  /** The spec's network in world coordinates. */
  private specNetwork({ x, y, args }: ElementSpec): VectorNetwork {
    if (args.network !== undefined) {
      const net = readNetwork(args.network, "network");
      return { ...net, vertices: net.vertices.map((v) => ({ x: v.x + x, y: v.y + y })) };
    }
    const flat = args.points;
    if (
      !Array.isArray(flat) ||
      flat.length < 4 ||
      flat.length % 2 !== 0 ||
      !flat.every((n) => typeof n === "number" && Number.isFinite(n))
    ) {
      throw new Error(
        'A vector needs "points" ([x0, y0, x1, y1, …], at least 2 points) or "network".',
      );
    }
    const points = flat as number[];
    if (!optionalBoolean(args, "closed")) return polylineNetwork(points);
    const corners: Point[] = [];
    for (let i = 0; i < points.length; i += 2) corners.push({ x: points[i]!, y: points[i + 1]! });
    return polygonNetwork(corners);
  }

  /** A new `network` (relative to x, y) re-wraps the vector's box around what it draws. */
  /** Flipping mirrors its points (and their handles) within its box too. */
  override flip(el: VectorElement, axis: FlipAxis, at: number): ElementPatch<VectorElement> {
    const across = axis === "x";
    const mirrored = scaleNetwork(el.network, across ? -1 : 1, across ? 1 : -1);
    const network: VectorNetwork = {
      ...mirrored,
      vertices: mirrored.vertices.map((v) =>
        across ? { x: v.x + el.w, y: v.y } : { x: v.x, y: v.y + el.h },
      ),
    };
    return { ...flipPlacement(el, axis, at), network, ...flipPaints(el, axis) };
  }

  override completePatch(
    el: VectorElement,
    patch: ElementPatch<VectorElement>,
    context: ElementBuildContext,
  ): ElementPatch<VectorElement> {
    const next =
      "network" in patch
        ? {
            ...patch,
            ...placeNetwork(
              {
                x: patch.x ?? el.x,
                y: patch.y ?? el.y,
                rotation: patch.rotation ?? el.rotation ?? 0,
              },
              readNetwork(patch.network, "network"),
            ),
          }
        : patch;
    return super.completePatch(el, next, context);
  }

  /** Pencil lines from before networks stored `points`: they become an open chain. */
  override fillDefaults(el: VectorElement): VectorElement {
    const old = el as VectorElement & { points?: number[] };
    const network = el.network ?? polylineNetwork(old.points ?? []);
    return { ...super.fillDefaults(el), network };
  }
}
