import type { CanvasDocument, CanvasElement } from "@canvas";

import { isDesignNode, type DesignNode } from "../../../core";
import { isFrame } from "../../../frame";
import { childrenMap, dataCopyTag, repeatOf, templateOf } from "../../repeat";
import type { TemplateIterator } from "./template-iterator.types";

const byIndex = (a: DesignNode, b: DesignNode) =>
  a.index < b.index ? -1 : a.index > b.index ? 1 : 0;

/**
 * The nearest iterator around a layer whose template it is or is inside, for its preview row;
 * `null` when the way up passes through a copy or a detached copy, or the iterator is itself a
 * copy (its repeat follows its template's).
 */
export function templateIterator(doc: CanvasDocument, nodeId: string): TemplateIterator | null {
  let children: Map<string, DesignNode[]> | null = null;
  const seen = new Set<string>();
  for (let at: CanvasElement | undefined = doc.get(nodeId); at && !seen.has(at.id);) {
    seen.add(at.id);
    if (!isDesignNode(at) || !at.parentId) return null;
    const parent = doc.get(at.parentId);
    const repeat = parent ? repeatOf(parent) : null;
    if (parent && isFrame(parent) && repeat) {
      children ??= childrenMap(doc);
      const template = templateOf(parent, [...(children.get(parent.id) ?? [])].sort(byIndex));
      if (template?.id !== at.id || dataCopyTag(parent)) return null;
      return { frameId: parent.id, repeat };
    }
    at = parent;
  }
  return null;
}
