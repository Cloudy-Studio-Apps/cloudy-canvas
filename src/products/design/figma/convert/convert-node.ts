import { generateNKeysBetween } from "fractional-indexing";

import type { CanvasElement } from "@canvas";
import {
  boxOf,
  IDENTITY,
  multiply,
  placementOf,
  type FigImportContext,
  type FigMatrix,
  type FigNode,
  type ResolvedFigNode,
} from "@canvas/figma";

import {
  layoutOf,
  type BooleanElement,
  type BooleanOperation,
  type EllipseElement,
  type FrameElement,
  type GroupElement,
  type PolygonElement,
  type RectangleElement,
  type SectionElement,
  type StarElement,
  type TextNodeElement,
} from "../../modules";
import { convertLine, convertVector, vectorFromGeometry } from "./convert-geometry";
import { figAutoLayout } from "./fig-auto-layout";
import { figNodeBase } from "./fig-node-base";
import { textFields } from "./fig-text";
import type { NodePlacement } from "./convert-node.types";

/** Nodes that hold others and become frames (components and instances too). */
const FRAMES = new Set(["FRAME", "SYMBOL", "INSTANCE", "COMPONENT_SET"]);
/** Shapes drawn from their box; mirrored or skewed, they become vectors of their outline. */
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
  ctx: FigImportContext,
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
  ctx: FigImportContext,
): void {
  const { node } = resolved;
  const world = multiply(placement.world, node.transform ?? IDENTITY);
  const el = convertOwn(node, world, placement, ctx);
  if (!el) return;
  placement.out.push(el);
  if (!holdsChildren(el)) return;
  const parent = {
    world,
    parentId: el.id,
    pageId: placement.pageId,
    parentLayout: layoutOf(el),
    out: placement.out,
  };
  convertChildren(resolved.children, parent, ctx);
}

/** The node itself as an element, or `null` when it has no counterpart. */
function convertOwn(
  node: FigNode,
  world: FigMatrix,
  placement: NodePlacement,
  ctx: FigImportContext,
): CanvasElement | null {
  const type = node.type ?? "";
  const size = node.size ?? { x: 0, y: 0 };
  // Turned layers keep their turn; mirrored or skewed ones can't, and are straightened (frames,
  // texts) or become vectors (shapes).
  const placed = placementOf(world, size.x, size.y);
  const rect = placed ?? boxOf(world, size.x, size.y);
  const rotation = placed?.rotation ?? 0;
  const base = <K extends string>(kind: K) => ({
    ...figNodeBase(kind, node, rect, placement, ctx),
    rotation,
  });

  if (type === "BOOLEAN_OPERATION") {
    // A live boolean: its operands are converted as its children, and it's worked out from them.
    const boolean: BooleanElement = {
      ...figNodeBase("boolean", node, rect, placement, ctx),
      rotation: 0,
      operation: booleanOperationOf(node, ctx),
    };
    return boolean;
  }
  if (type === "GROUP" || (type === "FRAME" && node.resizeToFit)) {
    // A group is the box round its children, who carry their own turns.
    const group: GroupElement = {
      ...figNodeBase("group", node, rect, placement, ctx),
      rotation: 0,
    };
    return group;
  }
  if (FRAMES.has(type) || type === "SECTION") {
    if (!placed) ctx.warnings.add("mirrored or skewed frames were straightened");
    if (type === "SECTION") return base("section") satisfies SectionElement;
    const frame: FrameElement = {
      ...base("frame"),
      cornerRadius: cornerRadiusOf(node, ctx),
      clipsContent: node.frameMaskDisabled !== true,
      layout: figAutoLayout(node),
    };
    return frame;
  }
  if (BOX_SHAPES.has(type) && !placed) return vectorFromGeometry(node, world, placement, ctx);
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
      return convertText(node, placed !== null, rotation, rect, placement, ctx);
  }
  // Boolean operations and anything else with an outline keep their look as a vector.
  const vector = vectorFromGeometry(node, world, placement, ctx);
  if (vector) ctx.warnings.add(`${type.toLowerCase()} layers became vectors`);
  else ctx.warnings.add(`${type.toLowerCase()} layers were left out`);
  return vector;
}

function convertText(
  node: FigNode,
  placed: boolean,
  rotation: number,
  rect: { x: number; y: number; w: number; h: number },
  placement: NodePlacement,
  ctx: FigImportContext,
): TextNodeElement {
  if (!placed) ctx.warnings.add("mirrored or skewed texts were straightened");
  const base = {
    ...figNodeBase("text", node, rect, placement, ctx, { allowImages: false, strokes: [] }),
    rotation,
  };
  // An auto-named text follows its content, as ours do when their name is empty.
  return { ...base, name: node.autoRename ? "" : base.name, ...textFields(node, ctx) };
}

/** The corner radius; corners with their own radii take the largest (one radius for now). */
function cornerRadiusOf(node: FigNode, ctx: FigImportContext): number {
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
  return (
    el.type === "frame" || el.type === "group" || el.type === "section" || el.type === "boolean"
  );
}

/** A Figma boolean's operation (union when Figma's is unknown, with a warning). */
function booleanOperationOf(node: FigNode, ctx: FigImportContext): BooleanOperation {
  switch (node.booleanOperation) {
    case "SUBTRACT":
      return "subtract";
    case "INTERSECT":
      return "intersect";
    case "XOR":
      return "exclude";
    case "UNION":
    case undefined:
      return "union";
    default:
      ctx.warnings.add("unknown boolean operations became unions");
      return "union";
  }
}
