import type { CanvasElement } from "@canvas";

import { isDesignNode, withDescendants } from "../../core";
import { isText } from "../../text";
import { pageItemTag, pageItemTemplate, readPageRef } from "../model";
import type { PageItemSummary } from "./page-item-summary.types";

/**
 * The page items inside a frame (a page's or a master's) as agents read them: the text shown,
 * its template, a page reference's target, and for a master's copy the master layer it copies
 * (the one catalog_page_item_set changes).
 */
export function pageItemsIn(
  frameId: string,
  elements: readonly CanvasElement[],
): PageItemSummary[] {
  const nodes = elements.filter(isDesignNode);
  const inside = withDescendants(new Set([frameId]), nodes);
  return nodes.flatMap((node): PageItemSummary[] => {
    const template = pageItemTemplate(node);
    if (node.id === frameId || !inside.has(node.id) || !isText(node) || template === null) {
      return [];
    }
    const target = readPageRef(template);
    const tag = pageItemTag(node);
    return [
      {
        node: node.id,
        name: node.name,
        text: node.text,
        template,
        ...(target !== null ? { target } : {}),
        ...(tag ? { fromMaster: tag.source } : {}),
      },
    ];
  });
}
