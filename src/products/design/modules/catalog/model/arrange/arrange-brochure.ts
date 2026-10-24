import {
  rotatedBounds,
  unionRects,
  type CanvasDocument,
  type ElementPatch,
  type Point,
  type Rect,
} from "@canvas";

import { childrenByParent, isDesignNode, type DesignNode } from "../../../core";
import type { FrameElement } from "../../../frame";
import { isBrochure, type BrochureElement } from "../../brochure";
import type { BookLayout } from "../book-layout.types";
import type { BrochurePage } from "../brochure-pages.types";
import { ARRANGE_GAPS } from "./arrange.constants";
import type { ArrangeBlock, ArrangeMode, ArrangeObstacle } from "./arrange.types";
import { arrangeBlocks } from "./arrange-blocks";
import { arrangeFrames } from "./arrange-frames";
import { pushAside } from "./push-aside";

/**
 * Lays the brochure's frames out on its design page (see `arrangeFrames`), from the top-left of
 * where they are now, and pushes the page's other top-level layers out of the way (`pushAside`).
 * Writes the moves (frames and pushed layers with everything they hold) without a checkpoint, so
 * the caller decides the undo step, and returns each moved node's offset; nothing is written when
 * nothing moves. Design nodes keep their shapes relative to `x`/`y` (groups follow their
 * children), so moving one is moving its corner.
 */
export function arrangeBrochure(
  doc: CanvasDocument,
  brochure: BrochureElement,
  layout: BookLayout,
  pages: readonly BrochurePage[],
  mode: ArrangeMode,
): Map<string, Point> {
  // Turned frames are laid out by the box round them, then moved by as much as that box moves.
  const boxed = pages.map(boxedPage);
  const frames = boxed.flatMap((page) => page.options);
  const origin = unionRects(frames);
  if (!origin) return new Map();
  const blocks = arrangeBlocks(layout, brochure.settings).map((block) => boxedBlock(block, boxed));
  const targets = arrangeFrames(blocks, mode, origin);
  const roots = new Map<string, Point>();
  const area: Rect[] = [];
  for (const frame of frames) {
    const to = targets.get(frame.id);
    if (!to) continue;
    area.push({ ...to, w: frame.w, h: frame.h });
    if (to.x !== frame.x || to.y !== frame.y) roots.set(frame.id, sub(to, frame));
  }
  const nodes = doc
    .all()
    .filter((el): el is DesignNode => isDesignNode(el) && el.pageId === brochure.page);
  const covered = unionRects(area);
  if (covered) {
    // Other brochures' frames on the page aren't in the way: they're theirs to arrange.
    const skip = new Set([...frames.map((frame) => frame.id), ...brochureFrames(doc, brochure)]);
    const pushed = pushAside(covered, obstacles(nodes, skip), ARRANGE_GAPS.option);
    for (const [id, offset] of pushed) roots.set(id, offset);
  }
  const moved = withOffsets(roots, nodes);
  if (moved.size === 0) return moved;
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const patches = new Map<string, ElementPatch>();
  for (const [id, offset] of moved) {
    const node = byId.get(id);
    if (node) patches.set(id, { x: node.x + offset.x, y: node.y + offset.y });
  }
  doc.updateMany(patches);
  return moved;
}

/** The page's top-level layers outside the brochure, each by what it and its contents cover. */
function obstacles(nodes: readonly DesignNode[], skip: ReadonlySet<string>): ArrangeObstacle[] {
  const children = childrenByParent(nodes);
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const cover = (node: DesignNode): Rect[] => [
    rectOf(node),
    ...(children.get(node.id) ?? []).flatMap((id) => {
      const child = byId.get(id);
      return child ? cover(child) : [];
    }),
  ];
  return nodes.flatMap((node) => {
    if (node.parentId || skip.has(node.id)) return [];
    const rect = unionRects(cover(node));
    return rect ? [{ id: node.id, rect }] : [];
  });
}

/** The roots' offsets handed down to everything they hold (roots never hold each other). */
function withOffsets(
  roots: ReadonlyMap<string, Point>,
  nodes: readonly DesignNode[],
): Map<string, Point> {
  const moved = new Map<string, Point>();
  if (roots.size === 0) return moved;
  const children = childrenByParent(nodes);
  for (const [id, offset] of roots) {
    const queue = [id];
    for (let next = queue.pop(); next !== undefined; next = queue.pop()) {
      moved.set(next, offset);
      queue.push(...(children.get(next) ?? []));
    }
  }
  return moved;
}

/** A page whose frames are the boxes round them (as they show, turned or not). */
function boxedPage(page: BrochurePage): BrochurePage {
  const box = (frame: FrameElement): FrameElement => ({ ...frame, ...rectOf(frame) });
  return { ...page, frame: box(page.frame), options: page.options.map(box) };
}

/** A block over the boxed pages (`boxedPage`), matched by slot. */
function boxedBlock(block: ArrangeBlock, pages: readonly BrochurePage[]): ArrangeBlock {
  const find = (page: BrochurePage | undefined) =>
    page && pages.find((other) => other.slot.id === page.slot.id);
  return { left: find(block.left), right: find(block.right), across: find(block.across) };
}

/** The frames of the design page's other brochures. */
function brochureFrames(doc: CanvasDocument, brochure: BrochureElement): string[] {
  return doc
    .all()
    .filter((el) => isBrochure(el) && el.id !== brochure.id && el.page === brochure.page)
    .flatMap((el) => (isBrochure(el) ? el.slots.flatMap((slot) => slot.frames) : []));
}

function rectOf(node: DesignNode): Rect {
  return rotatedBounds({ x: node.x, y: node.y, w: node.w, h: node.h }, node.rotation ?? 0);
}

function sub(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}
