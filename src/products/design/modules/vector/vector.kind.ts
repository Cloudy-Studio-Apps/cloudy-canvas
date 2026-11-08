import {
  identityKey,
  pointInPath,
  type BindableField,
  type ElementBuildContext,
  type ElementPatch,
  type ElementSpec,
  type ElementView,
  type Point,
  type Rect,
  type ResolvedValue,
  type ScaleTransform,
} from "@canvas";

import {
  DesignNodeKind,
  drawPaints,
  drawRegionPaints,
  flipPaints,
  hasOwnRegionFills,
  flipPlacement,
  EMPTY_GEOMETRY,
  hitSegment,
  networkGeometry,
  NETWORK_SCHEMA,
  placeNetwork,
  polylineNetwork,
  readNetwork,
  regionPaints,
  regionShapes,
  scaleNetwork,
  withLegacyRegionIds,
  withRegionIds,
  type FlipAxis,
  type NodeBuildContext,
  type NodeGeometry,
  type VectorNetwork,
} from "../core";
import { VECTOR_DEFAULTS } from "./vector.defaults";
import { createVector } from "./vector.factory";
import type { VectorElement } from "./vector.types";
import { t } from "./vector.i18n";
import { specNetwork } from "./vector-spec-network";
import {
  areaBindable,
  areaBindingsPatch,
  areaStylePatch,
  areaStyleValues,
} from "./vector-area-bindings";
import { areaImages, flipAreaFills, scaleAreaTiles } from "./vector-area-paints";

/**
 * Vectors: their regions are filled and their segments stroked; hit inside a filled region or
 * near a segment; stretched when resized. Double-click edits their points (`editElement`).
 */
export class VectorKind extends DesignNodeKind<VectorElement> {
  readonly type = "vector";
  readonly label = t("label");
  readonly description = t("description");
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

  /**
   * Its curves and which regions it fills: networks are replaced (not changed) when edited, and a
   * new fill of an area keeps the curves and loops, so a color drag doesn't work the shape out
   * again.
   */
  override geometryKey(el: VectorElement): string {
    const { vertices, segments, regions } = el.network;
    const parts = regions.map(
      (region) =>
        `${identityKey(region.loops)}${region.windingRule[0]}${region.fills?.length === 0 ? "-" : ""}`,
    );
    return `${identityKey(vertices)}|${identityKey(segments)}|${parts.join(",")}`;
  }

  /** Its regions filled by their winding rules (holes open) and its segments stroked. */
  protected override buildGeometry(el: VectorElement): NodeGeometry {
    return networkGeometry(el.network, true);
  }

  /** Areas with fills of their own are drawn one by one, bottom to top; else as one shape. */
  draw(view: ElementView, el: VectorElement): void {
    const geometry = this.geometry(el) ?? EMPTY_GEOMETRY;
    if (!hasOwnRegionFills(el.network)) return drawPaints(view, el, geometry, this.strokeOf(el));
    const regions = regionShapes(el.network).flatMap(({ region, shape }) => {
      const data = el.network.regions[region];
      return data ? [{ shape, fills: regionPaints(data, el) }] : [];
    });
    drawRegionPaints(view, el, regions, geometry, this.strokeOf(el));
  }

  protected override hitsShape(el: VectorElement, p: Point, tolerance: number): boolean {
    const reachOut = tolerance + el.strokeWeight + VECTOR_DEFAULTS.reach;
    if (!super.hitsShape(el, p, reachOut)) return false;
    const local = { x: p.x - el.x, y: p.y - el.y };
    const reach = el.strokeWeight / 2 + tolerance + VECTOR_DEFAULTS.reach;
    return hitSegment(el.network, local, reach) !== null || this.hitsFill(el, local);
  }

  /** Whether `local` is inside an area that shows a fill (its own, or the layer's). */
  private hitsFill(el: VectorElement, local: Point): boolean {
    const visible = (paints: readonly { visible: boolean }[]) => paints.some((p) => p.visible);
    if (!hasOwnRegionFills(el.network)) {
      return visible(el.fills) && pointInPath((this.geometry(el) ?? EMPTY_GEOMETRY).fill, local);
    }
    return regionShapes(el.network).some(({ region, shape }) => {
      const data = el.network.regions[region];
      return !!data && visible(regionPaints(data, el)) && pointInPath(shape, local);
    });
  }

  /** Also points its areas' own image fills at `to`. */
  override relinkAsset(
    el: VectorElement,
    from: string,
    to: string,
  ): ElementPatch<VectorElement> | null {
    const own = super.relinkAsset(el, from, to);
    let touched = false;
    const regions = el.network.regions.map((region) => {
      if (!region.fills?.some((p) => p.type === "image" && p.assetId === from)) return region;
      touched = true;
      return {
        ...region,
        fills: region.fills.map((p) =>
          p.type === "image" && p.assetId === from ? { ...p, assetId: to } : p,
        ),
      };
    });
    if (!touched) return own;
    return { ...own, network: { ...el.network, regions } };
  }

  /** Its areas' own image fills count too, so copies and exports carry their pictures. */
  override assets(el: VectorElement): string[] {
    return [...super.assets(el), ...areaImages(el).map((paint) => paint.assetId)];
  }

  /** An area showing a picture flips by a mirrored drawing too, as a layer's picture does. */
  override mirrorsOnFlip(el: VectorElement): boolean {
    return super.mirrorsOnFlip(el) || areaImages(el).length > 0;
  }

  /** Its areas' fills take color styles and variables too (`areaBindable`). */
  override bindable(el: VectorElement): BindableField[] {
    return [...super.bindable(el), ...areaBindable(el, ["all-fills", this.fillScope])];
  }

  override bindValues(
    el: VectorElement,
    path: string,
    value: ResolvedValue,
  ): Record<string, unknown> {
    return areaStyleValues(path, value) ?? super.bindValues(el, path, value);
  }

  override bindPatch(
    el: VectorElement,
    path: string,
    value: ResolvedValue,
  ): ElementPatch<VectorElement> | null {
    const area = areaStylePatch(el, path, value);
    return area === undefined ? super.bindPatch(el, path, value) : area;
  }

  /** Scaled, its areas' tiled pictures scale their tiles too, as the layer's do. */
  override scale(el: VectorElement, t: ScaleTransform): ElementPatch<VectorElement> {
    const patch = super.scale(el, t);
    const network = scaleAreaTiles(patch.network ?? el.network, t);
    return network ? { ...patch, network } : patch;
  }

  /** Its points and curves stretch with its box. */
  protected override resizeShape(el: VectorElement, rect: Rect): ElementPatch<VectorElement> {
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
    return createVector(specNetwork(spec), context.nameFor(this.label), index, null);
  }

  /**
   * Flipping mirrors its points (and their handles) within its box too; a vector showing a
   * picture is drawn mirrored instead, so the picture flips with it.
   */
  override flip(el: VectorElement, axis: FlipAxis, at: number): ElementPatch<VectorElement> {
    if (this.mirrorsOnFlip(el)) return super.flip(el, axis, at);
    const across = axis === "x";
    const mirrored = scaleNetwork(el.network, across ? -1 : 1, across ? 1 : -1);
    const network: VectorNetwork = {
      ...mirrored,
      regions: flipAreaFills(mirrored, axis),
      vertices: mirrored.vertices.map((v) =>
        across ? { x: v.x + el.w, y: v.y } : { x: v.x, y: v.y + el.h },
      ),
    };
    return { ...flipPlacement(el, axis, at), network, ...flipPaints(el, axis) };
  }

  /**
   * A new `network` (relative to x, y) re-wraps the vector's box around what it draws, its areas
   * get ids (an agent may leave them out), and the variables and styles on its areas follow them
   * when the edit adds or removes some.
   */
  override completePatch(
    el: VectorElement,
    patch: ElementPatch<VectorElement>,
    context: ElementBuildContext,
  ): ElementPatch<VectorElement> {
    if (!("network" in patch) || !patch.network) return super.completePatch(el, patch, context);
    const network = withRegionIds(readNetwork(patch.network, "network"));
    const origin = {
      x: patch.x ?? el.x,
      y: patch.y ?? el.y,
      rotation: patch.rotation ?? el.rotation ?? 0,
      w: el.w,
      mirrored: patch.mirrored ?? el.mirrored ?? false,
    };
    const next = {
      ...patch,
      ...("bindings" in patch ? {} : areaBindingsPatch(el, network)),
      ...placeNetwork(origin, network),
    };
    return super.completePatch(el, next, context);
  }

  /** Pencil lines from before networks stored `points`: they become an open chain. */
  override fillDefaults(el: VectorElement): VectorElement {
    const old = el as VectorElement & { points?: number[] };
    // Areas saved before they had ids get them from their places, the same at every read.
    const network = withLegacyRegionIds(el.network ?? polylineNetwork(old.points ?? []));
    return {
      ...super.fillDefaults(el),
      network,
      // Vectors from before stroke settings were drawn with round ends and corners.
      strokeCap: el.strokeCap ?? "round",
      strokeJoin: el.strokeJoin ?? "round",
    };
  }
}
