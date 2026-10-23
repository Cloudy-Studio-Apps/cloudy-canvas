import {
  rotatePoint,
  type CanvasDocument,
  type EditedChange,
  type ElementKinds,
  type ElementPatch,
  type Point,
  type Rect,
} from "@canvas";

import { DesignNodeKind, type DesignNode } from "../core";
import { dirtyFrames } from "./dirty-frames";
import { DocumentTree } from "./document-tree";
import { layoutFrame } from "./layout-frame";
import { frameLayoutInput } from "./layout-items";

/** Differences smaller than this are left alone (no write, so the hook settles). */
const EPSILON = 1e-3;

/**
 * The design's `afterEdit` hook: lays out again every auto layout frame the edit may change,
 * deepest first, so a frame that hugs is sized before its parent places it. What it writes
 * runs it again (a parent filling a child's width lays the child out next), until nothing moves.
 */
export function relayoutAfterEdit(
  doc: CanvasDocument,
  change: EditedChange,
  kinds: ElementKinds,
): void {
  const dirty = dirtyFrames(doc, change, kinds);
  if (dirty.size === 0) return;
  const tree = new DocumentTree(doc);
  const deepestFirst = [...dirty].sort((a, b) => b[1] - a[1]);
  for (const [id] of deepestFirst) relayoutFrame(doc, tree, kinds, id);
}

/** Lays one frame out and writes what changed: its hugging size, its layers' sizes and places. */
function relayoutFrame(
  doc: CanvasDocument,
  tree: DocumentTree,
  kinds: ElementKinds,
  id: string,
): void {
  const frame = tree.get(id);
  const data = frame && frameLayoutInput(frame, tree, kinds);
  if (!frame || !data) return;
  const result = layoutFrame(data.input, data.items);
  const w = data.input.hugW ? result.w : frame.w;
  const h = data.input.hugH ? result.h : frame.h;
  resizeTo(doc, kinds, frame, { x: frame.x, y: frame.y, w, h });

  for (const [childId, rect] of result.items) {
    const placed = data.placed.get(childId);
    if (!placed) continue;
    let { box } = placed;
    if (!placed.moveOnly && !near(rect.w, box.w, rect.h, box.h)) {
      const { node } = placed;
      resizeTo(doc, kinds, node, { x: node.x, y: node.y, w: rect.w, h: rect.h });
      const resized = tree.get(childId) ?? node;
      box = { ...box, w: resized.w, h: resized.h };
    }
    if (near(rect.x, box.x, rect.y, box.y)) continue;
    const offset = rotatePoint(
      { x: rect.x - box.x, y: rect.y - box.y },
      ORIGIN,
      frame.rotation ?? 0,
    );
    moveWithDescendants(doc, tree, kinds, childId, offset);
  }
}

const ORIGIN: Point = { x: 0, y: 0 };

/** Resizes a node as its kind does (a text wraps again), keeping how it's sized. */
function resizeTo(doc: CanvasDocument, kinds: ElementKinds, node: DesignNode, rect: Rect): void {
  if (near(rect.w, node.w, rect.h, node.h)) return;
  const kind = kinds.kindOf(node);
  if (!(kind instanceof DesignNodeKind)) return;
  const patch: ElementPatch<DesignNode> = { ...kind.resize(node, rect), sizing: node.sizing };
  doc.update(node.id, patch);
}

function moveWithDescendants(
  doc: CanvasDocument,
  tree: DocumentTree,
  kinds: ElementKinds,
  id: string,
  { x: dx, y: dy }: Point,
): void {
  for (const each of tree.withDescendants(id)) {
    const node = tree.get(each);
    if (node) doc.update(each, kinds.kindOf(node).move(node, dx, dy));
  }
}

function near(a: number, b: number, c: number, d: number): boolean {
  return Math.abs(a - b) < EPSILON && Math.abs(c - d) < EPSILON;
}
