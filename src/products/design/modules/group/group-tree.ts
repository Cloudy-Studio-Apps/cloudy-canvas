import type { CanvasElement } from "@canvas";

import { isDesignNode } from "../core";
import { GROUP_TYPE } from "./group.constants";

/** Whether an element is a group. */
export function isGroup(el: CanvasElement | undefined): boolean {
  return el?.type === GROUP_TYPE;
}

/** The groups around `id`, outermost first, up to the first ancestor that isn't a group. */
export function enclosingGroups(id: string, byId: ReadonlyMap<string, CanvasElement>): string[] {
  const groups: string[] = [];
  const seen = new Set([id]);
  let el = byId.get(id);
  while (el && isDesignNode(el) && el.parentId && !seen.has(el.parentId)) {
    const parent = byId.get(el.parentId);
    if (!isGroup(parent)) break;
    seen.add(el.parentId);
    groups.unshift(el.parentId);
    el = parent;
  }
  return groups;
}
