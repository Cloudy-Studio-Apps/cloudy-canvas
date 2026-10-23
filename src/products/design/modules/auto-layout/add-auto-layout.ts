import {
  elementBounds,
  type CanvasDocument,
  type CanvasElement,
  type ElementKinds,
  type ElementPatch,
} from "@canvas";

import {
  childrenByParent,
  layoutOf,
  nextLayerName,
  selectionRoots,
  wrapNodes,
  type AutoLayout,
  type DesignNode,
} from "../core";
import { createFrame, FrameKind, type FrameElement } from "../frame";
import { guessLayout } from "./guess-layout";

/**
 * Figma's "Add auto layout" (Shift+A), as one undo step: selected frames without one get an auto
 * layout guessed from their layers; anything else is wrapped in a new auto layout frame that
 * hugs it. Returns the frames to select. `elements` are the scene's.
 */
export function addAutoLayout(
  doc: CanvasDocument,
  ids: ReadonlySet<string>,
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
): string[] {
  const roots = selectionRoots(ids, elements);
  if (roots.length === 0) return [];
  const children = childrenByParent(elements);
  const byId = new Map(elements.map((el) => [el.id, el]));
  const boxOf = (node: CanvasElement) => elementBounds(kinds.kindOf(node), node);
  doc.checkpoint();

  const frames = roots.filter(
    (node): node is FrameElement => kinds.kindOf(node) instanceof FrameKind && !layoutOf(node),
  );
  if (frames.length === roots.length) {
    doc.batch(() => {
      for (const frame of frames) {
        const kids = (children.get(frame.id) ?? [])
          .map((id) => byId.get(id) as DesignNode)
          .filter((kid) => kid.visible);
        const layout = guessLayout(kids.map(boxOf), boxOf(frame));
        orderByPlace(doc, kids, layout, kinds);
        doc.update(frame.id, { layout, sizing: { h: "hug", v: "hug" } } as ElementPatch);
      }
    });
    return frames.map((frame) => frame.id);
  }

  let id: string | null = null;
  doc.batch(() => {
    const layout = guessLayout(roots.map(boxOf), null);
    const name = nextLayerName(doc.all(), "Frame");
    id = wrapNodes(doc, roots, kinds, (rect, index, parentId) => ({
      ...createFrame(rect, name, index, parentId),
      fills: [],
      clipsContent: false,
      layout,
      sizing: { h: "hug", v: "hug" },
    }));
    orderByPlace(doc, roots, layout, kinds);
  });
  return id ? [id] : [];
}

/**
 * Figma's "Remove auto layout" (Alt+Shift+A), as one undo step: the selected frames keep their
 * size and their layers stay where they are; nothing hugs or fills any more.
 */
export function removeAutoLayout(
  doc: CanvasDocument,
  ids: ReadonlySet<string>,
  elements: readonly CanvasElement[],
): string[] {
  const frames = elements.filter((el) => ids.has(el.id) && layoutOf(el)) as DesignNode[];
  if (frames.length === 0) return [];
  const children = childrenByParent(elements);
  const byId = new Map(elements.map((el) => [el.id, el]));
  doc.checkpoint();
  doc.batch(() => {
    for (const frame of frames) {
      doc.update(frame.id, { layout: null, sizing: unfilled(frame, "hug") } as ElementPatch);
      for (const id of children.get(frame.id) ?? []) {
        const child = byId.get(id) as DesignNode | undefined;
        if (child) doc.update(id, { sizing: unfilled(child, "fill") } as ElementPatch);
      }
    }
  });
  return frames.map((frame) => frame.id);
}

/** Gives the nodes their indexes again in the order they sit along the layout's direction. */
function orderByPlace(
  doc: CanvasDocument,
  nodes: readonly DesignNode[],
  layout: AutoLayout,
  kinds: ElementKinds,
): void {
  const p = layout.direction === "horizontal" ? "x" : "y";
  const indexes = nodes.map((node) => node.index).sort();
  const placed = [...nodes].sort(
    (a, b) => elementBounds(kinds.kindOf(a), a)[p] - elementBounds(kinds.kindOf(b), b)[p],
  );
  placed.forEach((node, i) => {
    const index = indexes[i];
    if (index && index !== node.index) doc.update(node.id, { index });
  });
}

/** Its sizing with `sizing` sides made fixed. */
function unfilled(node: DesignNode, sizing: "hug" | "fill"): DesignNode["sizing"] {
  const fixed = (axis: "h" | "v") => (node.sizing[axis] === sizing ? "fixed" : node.sizing[axis]);
  return { h: fixed("h"), v: fixed("v") };
}
