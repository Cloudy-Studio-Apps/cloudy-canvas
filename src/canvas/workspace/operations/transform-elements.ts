import {
  anchorPoint,
  arrangeRoots,
  scalePatches,
  type RotatePivot,
  type ScaleAnchor,
} from "../../arrange";
import { elementBounds, type CanvasElement, type ElementPatch } from "../../elements";
import { rectCenter, unionRects } from "../../geometry";
import { arrangeHost } from "./arrange-elements";
import { withMembers } from "./members";
import type { WorkspaceParts } from "./workspace-parts.types";

/**
 * Turns elements that can turn (`ElementKind.rotatable`), with what moves with them, by
 * `degrees` (or each one's own, from a function) round the middle of them all, or each round its
 * own middle, as one undo step. Returns the turned ids.
 */
export function rotateElements(
  parts: WorkspaceParts,
  ids: Iterable<string>,
  degrees: number | ((el: CanvasElement) => number),
  around: RotatePivot = "selection",
): string[] {
  const { doc, kinds, scene } = parts;
  const roots = arrangeRoots(ids, arrangeHost(parts)).filter((el) => kinds.kindOf(el).rotatable);
  const shown = (el: CanvasElement) => elementBounds(kinds.kindOf(el), el);
  const all = unionRects(roots.map(shown));
  if (!all) return [];
  const patches = new Map<string, ElementPatch>();
  for (const root of roots) {
    const turn = typeof degrees === "number" ? degrees : degrees(root);
    if (!turn) continue;
    const pivot = rectCenter(around === "each" ? shown(root) : all);
    for (const id of withMembers(parts, [root.id], "move")) {
      const el = scene.get(id);
      const kind = el && kinds.kindOf(el);
      if (el && kind?.rotatable && !el.locked) patches.set(id, kind.rotate(el, turn, pivot));
    }
  }
  if (patches.size === 0) return [];
  doc.checkpoint();
  doc.updateMany(patches);
  return [...patches.keys()];
}

/**
 * Scales elements and their content (fonts, strokes, radii, what moves with them) by `factor`
 * round `anchor` of the box round them, as the Scale tool does, in one undo step. Locked ones
 * stay. Returns the scaled ids.
 */
export function scaleElements(
  parts: WorkspaceParts,
  ids: Iterable<string>,
  factor: number,
  anchor: ScaleAnchor = "top-left",
): string[] {
  if (!(factor > 0) || factor === 1) return [];
  const { doc, kinds, scene } = parts;
  const unlocked = (el: CanvasElement | undefined): el is CanvasElement => !!el && !el.locked;
  const roots = [...ids].map((id) => scene.get(id)).filter(unlocked);
  const box = unionRects(roots.map((el) => elementBounds(kinds.kindOf(el), el)));
  if (!box) return [];
  const members = withMembers(
    parts,
    roots.map((el) => el.id),
    "move",
  );
  const scaled = [...members].map((id) => scene.get(id)).filter(unlocked);
  const patches = scalePatches(scaled, kinds, { origin: anchorPoint(box, anchor), factor });
  if (patches.size === 0) return [];
  doc.checkpoint();
  doc.updateMany(patches);
  return [...patches.keys()];
}
