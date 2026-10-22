import { generateNKeysBetween } from "fractional-indexing";

import type { CanvasElement } from "@canvas";

import type {
  EllipseElement,
  FrameElement,
  GroupElement,
  PolygonElement,
  RectangleElement,
  SectionElement,
  StarElement,
  TextNodeElement,
} from "../../modules";
import { convertLine, convertVector, vectorFromGeometry } from "./convert-geometry";
import { boxOf, IDENTITY, isAxisAligned, multiply } from "./fig-matrix";
import { figNodeBase } from "./fig-node-base";
import type { FigMatrix, FigNode, ResolvedFigNode } from "./fig-node.types";
import { textFields } from "./fig-text";
import type { NodePlacement } from "./convert-node.types";
import type { ImportContext } from "./import-context";

/** Nodes that hold others and become frames (components and instances too). */
const FRAMES = new Set(["FRAME", "SYMBOL", "INSTANCE", "COMPONENT_SET"]);
/** Shapes drawn from their box; rotated, they become vectors of their outline. */
const BOX_SHAPES = new Set([
  "RECTANGLE",
  "ROUNDED_RECTANGLE",
  "ELLIPSE",
  "REGULAR_POLYGON",
  "STAR",
]);
/** Figma's star inner radius when the file doesn't say. */
const STAR_INNER_SCALE = 0.382;

/**
 * Converts siblings (bottom to top) into `out`, each with its descendants. `onEach` runs after
 * each sibling (the import's progress).
 */
export function convertChildren(
  children: readonly ResolvedFigNode[],
  parent: Omit<NodePlacement, "index">,
  ctx: ImportContext,
  onEach?: () => void,
): void {
  const keys = generateNKeysBetween(null, null, children.length);
  children.forEach((child, i) => {
    const index = keys[i];
    if (index) convertNode(child, { ...parent, index }, ctx);
    onEach?.();
  });
}

function convertNode(
  resolved: ResolvedFigNode,
  placement: NodePlacement,
  ctx: ImportContext,
): void {
  const { node } = resolved;
  const world = multiply(placement.world, node.transform ?? IDENTITY);
  const el = convertOwn(node, world, placement, ctx);
  if (!el) return;
  placement.out.push(el);
  if (!holdsChildren(el)) return;
  const parent = { world, parentId: el.id, pageId: placement.pageId, out: placement.out };
  convertChildren(resolved.children, parent, ctx);
}

/** The node itself as an element, or `null` when it has no counterpart. */
function convertOwn(
  node: FigNode,
  world: FigMatrix,
  placement: NodePlacement,
  ctx: ImportContext,
): CanvasElement | null {
  const type = node.type ?? "";
  const size = node.size ?? { x: 0, y: 0 };
  const aligned = isAxisAligned(world);
  const rect = boxOf(world, size.x, size.y);
  const base = <K extends string>(kind: K) => figNodeBase(kind, node, rect, placement, ctx);

  if (type === "GROUP" || (type === "FRAME" && node.resizeToFit)) {
    return base("group") satisfies GroupElement;
  }
  if (FRAMES.has(type) || type === "SECTION") {
    if (!aligned) ctx.warnings.add("rotated frames were straightened");
    if (type === "SECTION") return base("section") satisfies SectionElement;
    const frame: FrameElement = {
      ...base("frame"),
      cornerRadius: cornerRadiusOf(node, ctx),
      clipsContent: node.frameMaskDisabled !== true,
    };
    return frame;
  }
  if (BOX_SHAPES.has(type) && !aligned) return vectorFromGeometry(node, world, placement, ctx);
  switch (type) {
    case "RECTANGLE":
    case "ROUNDED_RECTANGLE": {
      const rectangle: RectangleElement = {
        ...base("rectangle"),
        cornerRadius: cornerRadiusOf(node, ctx),
      };
      return rectangle;
    }
    case "ELLIPSE":
      return base("ellipse") satisfies EllipseElement;
    case "REGULAR_POLYGON": {
      const polygon: PolygonElement = { ...base("polygon"), pointCount: node.count ?? 3 };
      return polygon;
    }
    case "STAR": {
      const star: StarElement = {
        ...base("star"),
        pointCount: node.count ?? 5,
        innerRadius: node.starInnerScale ?? STAR_INNER_SCALE,
      };
      return star;
    }
    case "LINE":
      return convertLine(node, world, placement, ctx);
    case "VECTOR":
      return convertVector(node, world, placement, ctx);
    case "TEXT":
      return convertText(node, aligned, rect, placement, ctx);
  }
  // Boolean operations and anything else with an outline keep their look as a vector.
  const vector = vectorFromGeometry(node, world, placement, ctx);
  if (vector && type === "BOOLEAN_OPERATION") ctx.warnings.add("boolean operations became vectors");
  else if (vector) ctx.warnings.add(`${type.toLowerCase()} layers became vectors`);
  else ctx.warnings.add(`${type.toLowerCase()} layers were left out`);
  return vector;
}

function convertText(
  node: FigNode,
  aligned: boolean,
  rect: { x: number; y: number; w: number; h: number },
  placement: NodePlacement,
  ctx: ImportContext,
): TextNodeElement {
  if (!aligned) ctx.warnings.add("rotated texts were straightened");
  const base = figNodeBase("text", node, rect, placement, ctx, { allowImages: false, strokes: [] });
  // An auto-named text follows its content, as ours do when their name is empty.
  return { ...base, name: node.autoRename ? "" : base.name, ...textFields(node, ctx) };
}

/** The corner radius; corners with their own radii take the largest (one radius for now). */
function cornerRadiusOf(node: FigNode, ctx: ImportContext): number {
  const radius = node.cornerRadius ?? 0;
  if (!node.rectangleCornerRadiiIndependent) return radius;
  const corners = [
    node.rectangleTopLeftCornerRadius ?? radius,
    node.rectangleTopRightCornerRadius ?? radius,
    node.rectangleBottomLeftCornerRadius ?? radius,
    node.rectangleBottomRightCornerRadius ?? radius,
  ];
  const largest = Math.max(...corners);
  if (corners.some((corner) => corner !== largest)) {
    ctx.warnings.add("corners with different radii took the largest");
  }
  return largest;
}

/** Whether the converted element takes the node's children (not a vector of its outline). */
function holdsChildren(el: CanvasElement): boolean {
  return el.type === "frame" || el.type === "group" || el.type === "section";
}
