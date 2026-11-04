import type { CanvasElement } from "@canvas";

import type { DesignNode } from "../../../core";
import { isText } from "../../../text";
import { itemTextPatch } from "./item-text-patch";
import { pageItemTemplate } from "./page-item-fields";
import type { PageItemTag, TemplateContext } from "./page-item.types";
import { resolveTemplate } from "./resolve-template";

/** Fields a copy never takes from its master layer. */
const OWN = new Set(["id", "index"]);

/** The fields a text's measured size depends on not, so an unchanged text needn't be measured. */
const MEASURED = new Set(["text", "runs", "w", "h", "x"]);

function same(a: unknown, b: unknown): boolean {
  return a === b || JSON.stringify(a) === JSON.stringify(b);
}

/**
 * A master layer as its copy on a page wants to be: moved by (`dx`, `dy`), under `parentId`,
 * locked, tagged, its template text read for the page. `old` is the copy already there: when only
 * its text could differ and it already reads the same, it isn't measured again.
 */
export function copyOf(
  source: DesignNode,
  move: { dx: number; dy: number; parentId: string; pageId: string },
  tag: PageItemTag,
  context: TemplateContext,
  old: CanvasElement | undefined,
): DesignNode {
  const want = {
    ...source,
    x: source.x + move.dx,
    y: source.y + move.dy,
    parentId: move.parentId,
    pageId: move.pageId,
    locked: true,
    catalogCopy: tag,
  } as DesignNode;
  const template = pageItemTemplate(source);
  if (!isText(want) || template === null) return want;
  const text = resolveTemplate(template, context);
  if (old && isText(old) && old.text === text && sameButMeasured(want, old)) {
    return { ...want, text, runs: old.runs, w: old.w, h: old.h, x: old.x } as DesignNode;
  }
  return { ...want, ...itemTextPatch(want, text) } as DesignNode;
}

/** Whether a copy differs from what it wants only in what measuring its text decides. */
function sameButMeasured(want: CanvasElement, old: CanvasElement): boolean {
  const was = old as unknown as Record<string, unknown>;
  return Object.entries(want).every(
    ([field, value]) => OWN.has(field) || MEASURED.has(field) || same(was[field], value),
  );
}

/** What `old` needs to become `want` (its own id and index kept), `null` when nothing. */
export function copyPatch(old: CanvasElement, want: CanvasElement): Record<string, unknown> | null {
  const was = old as unknown as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(want)) {
    if (!OWN.has(field) && !same(was[field], value)) patch[field] = value;
  }
  return Object.keys(patch).length > 0 ? patch : null;
}
