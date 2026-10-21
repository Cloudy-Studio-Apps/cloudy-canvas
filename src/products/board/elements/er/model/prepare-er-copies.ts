import type { CanvasElement, CopyContext } from "@canvas";
import { createId } from "@shared/core";

import type { ErElement } from "../base/er.types";
import { isErElement } from "../base/is-er-element";
import { erOrphans, withoutDeadLinks } from "./er-orphans";

/**
 * Copied ER elements form a new diagram for each diagram they came from (`"Library copy"`), so
 * their names don't clash with the originals'. Links to ER elements that weren't copied are
 * dropped, with the elements that can't exist without them (e.g. an attribute copied without its
 * owner).
 */
export function prepareErCopies(
  copies: CanvasElement[],
  { existing }: CopyContext,
): CanvasElement[] {
  const shapes = copies.filter(isErElement);
  if (shapes.length === 0) return copies;

  const ids = new Set(shapes.map((s) => s.id));
  const dead = (id: string) => !ids.has(id);
  const gone = erOrphans(shapes, dead);
  const diagrams = newDiagrams(shapes, existing);

  return copies.flatMap((el): CanvasElement[] => {
    if (!isErElement(el)) return [el];
    if (gone.has(el.id)) return [];
    const patch = withoutDeadLinks(el, (id) => dead(id) || gone.has(id));
    return [{ ...el, ...patch, ...diagrams.get(el.diagram) } as ErElement];
  });
}

/** Source diagram id → the new diagram's id and name. */
function newDiagrams(
  shapes: readonly ErElement[],
  existing: readonly CanvasElement[],
): Map<string, { diagram: string; diagramName: string }> {
  const names = new Set(existing.filter(isErElement).map((s) => s.diagramName));
  const diagrams = new Map<string, { diagram: string; diagramName: string }>();
  for (const shape of shapes) {
    if (diagrams.has(shape.diagram)) continue;
    const diagramName = shape.diagramName && freeCopyName(shape.diagramName, names);
    names.add(diagramName);
    diagrams.set(shape.diagram, { diagram: createId(), diagramName });
  }
  return diagrams;
}

/** `"<name> copy"`, or `"<name> copy 2"`, … when that's taken. */
function freeCopyName(name: string, taken: ReadonlySet<string>): string {
  const base = `${name} copy`;
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base} ${n}`)) n++;
  return `${base} ${n}`;
}
