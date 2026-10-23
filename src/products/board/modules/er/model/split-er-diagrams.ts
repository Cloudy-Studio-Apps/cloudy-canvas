import { createId } from "@shared/core";
import type { CanvasDocument, CanvasElement, ElementPatch } from "@canvas";

import { isErElement } from "../base/is-er-element";
import type { ErElement, ErElementBase } from "../base/er.types";
import { erComponents } from "./er-components";

/**
 * After a deletion, gives each part of a diagram that the deletion cut off from the rest a
 * diagram of its own (deleting the relation that joined two diagrams splits them again). Only
 * parts that were linked `before` are split, so shapes that were already on their own (an entity
 * just added) stay in their diagram; the largest part keeps the diagram and its name. Call inside
 * the deletion's batch, after `pruneEr`, or with `diagrams` after an edit that unlinks shapes
 * (removing a participant).
 */
export function splitErDiagrams(
  doc: CanvasDocument,
  before: readonly CanvasElement[],
  diagrams?: Iterable<string>,
): void {
  const was = before.filter(isErElement);
  const now = doc.all().filter(isErElement);
  const alive = new Set(now.map((shape) => shape.id));
  // By default the diagrams that lost a shape; edits that only unlink name theirs.
  const touched = new Set(
    diagrams ?? was.filter((shape) => !alive.has(shape.id)).map((s) => s.diagram),
  );
  const patches = new Map<string, ElementPatch<ErElementBase>>();
  for (const diagram of touched) {
    for (const parts of cutParts(inDiagram(was, diagram), inDiagram(now, diagram))) {
      const [, ...cutOff] = [...parts].sort((a, b) => b.length - a.length);
      for (const ids of cutOff) {
        const patch = { diagram: createId(), diagramName: "" };
        for (const id of ids) patches.set(id, patch);
      }
    }
  }
  if (patches.size) doc.updateMany(patches);
}

/** For each group linked before, its linked groups now (only the ones split in two or more). */
function cutParts(was: readonly ErElement[], now: readonly ErElement[]): string[][][] {
  const groupOf = new Map<string, number>();
  erComponents(was).forEach((ids, group) => ids.forEach((id) => groupOf.set(id, group)));
  const parts = new Map<number, string[][]>();
  for (const ids of erComponents(now)) {
    const group = ids[0] === undefined ? undefined : groupOf.get(ids[0]);
    if (group === undefined) continue;
    const list = parts.get(group);
    if (list) list.push(ids);
    else parts.set(group, [ids]);
  }
  return [...parts.values()].filter((list) => list.length > 1);
}

function inDiagram(shapes: readonly ErElement[], diagram: string): ErElement[] {
  return shapes.filter((shape) => shape.diagram === diagram);
}
