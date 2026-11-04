import type { TextAlign } from "@canvas";

import { createText, TEXT_DEFAULTS, textSize, type TextNodeElement } from "../../../text";
import type { PageItemAlign, PlacePageItemInput } from "./page-item-definition.types";

/** Which edge an item aligned `align` keeps on a `side` page. */
function edgeOf(align: PageItemAlign, side: "left" | "right"): TextAlign {
  if (align === "center") return "center";
  const outer = side === "left" ? "left" : "right";
  if (align === "outer") return outer;
  return outer === "left" ? "right" : "left";
}

/**
 * A page item's text, inside `target.frame`: its template as its text (the sync reads it for the
 * page it's on), named after the item. Dropped at a point, it's centered there; else the table of
 * contents fills the page's width inside the margin from its top, and the others sit in the top
 * or bottom margin against the edge their `align` says, aligned to it so they grow away from it.
 */
export function placePageItem({
  item,
  target,
  margin,
  index,
  at,
}: PlacePageItemInput): TextNodeElement {
  const { area, side, frame } = target;
  const typography = { ...TEXT_DEFAULTS.typography, fontSize: item.fontSize };
  const body = item.anchor === "body";
  const width = body ? Math.max(area.w - margin * 2, item.fontSize) : undefined;
  const textAlign: TextAlign = body ? "left" : edgeOf(item.align, side);
  const base = createText({ x: 0, y: 0 }, index, frame.id, typography, width);
  const shaped = { ...base, text: item.template, textAlign, name: item.label };
  const sized = { ...shaped, ...sizeOf(shaped) };

  let x: number;
  let y: number;
  if (at) {
    x = at.x - sized.w / 2;
    y = at.y - sized.h / 2;
  } else {
    if (body || textAlign === "left") x = area.x + margin;
    else if (textAlign === "right") x = area.x + area.w - margin - sized.w;
    else x = area.x + (area.w - sized.w) / 2;
    y = item.anchor === "footer" ? area.y + area.h - margin - sized.h : area.y + margin;
  }
  // `catalogText` makes it a page item (`pageItemTemplate`).
  return { ...sized, x, y, pageId: frame.pageId, catalogText: item.template } as TextNodeElement;
}

function sizeOf(el: TextNodeElement): { w: number; h: number } {
  const size = textSize(el);
  return { w: size.w ?? el.w, h: size.h ?? el.h };
}
