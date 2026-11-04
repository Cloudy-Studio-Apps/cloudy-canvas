import { rectsIntersect, type PdfBookLink, type Rect } from "@canvas";

import { isText, textLayout, type TextNodeElement } from "../../text";
import { shownNodes } from "../checks/shown-nodes";
import { pageItemTemplate, templateParts } from "../model";
import { partRect } from "./draw-frame";
import type { PageLinksInput } from "./page-links.types";
import { rangeBoxes } from "./range-boxes";
import { textSide } from "./text-side";

/** Whether a page item's text can link: it lists the contents or refers to a page. */
const linksOut = (template: string) => template.includes("{toc}") || template.includes("{page:");

/** `box` cut to `area`, `null` when nothing of it is left. */
function clipped(box: Rect, area: Rect): Rect | null {
  const x = Math.max(box.x, area.x);
  const y = Math.max(box.y, area.y);
  const w = Math.min(box.x + box.w, area.x + area.w) - x;
  const h = Math.min(box.y + box.h, area.y + area.h) - y;
  return w > 0 && h > 0 ? { x, y, w, h } : null;
}

/**
 * The clickable areas of a printed page: each line of a table of contents across its text's
 * width, and the number each `{page:Name}` wrote, opening its page. They're worked out from the
 * text's layout, as the canvas draws it, so they're the same in sharp and flattened PDFs. A text
 * whose stamped words aren't what its template reads now (stale), turned or hidden gets none.
 */
export function pageLinks(input: PageLinksInput): PdfBookLink[] {
  const { page, layout, numbers, context, pdfPages } = input;
  const { frame } = page;
  const area = partRect(frame, page.part);
  return shownNodes(frame.id, input.elements).flatMap((node): PdfBookLink[] => {
    const template = pageItemTemplate(node);
    if (!isText(node) || template === null || !linksOut(template)) return [];
    const el = node as TextNodeElement;
    if ((el.rotation ?? 0) !== 0 || !rectsIntersect(el, area)) return [];
    const side = textSide(el, frame, layout);
    const info = side === null ? undefined : numbers[side];
    if (!info) return [];
    const parts = templateParts(template, { ...context, info });
    if (parts.text !== el.text) return [];
    const laid = textLayout(el);
    return parts.links.flatMap((link) => {
      const target = pdfPages[link.side];
      if (target === undefined || target < 0) return [];
      const whole = link.kind === "contents";
      return rangeBoxes(laid, link.start, link.end).flatMap((box) => {
        const world = whole
          ? { x: el.x, y: el.y + box.y, w: el.w, h: box.h }
          : { x: el.x + box.x, y: el.y + box.y, w: box.w, h: box.h };
        const rect = clipped(world, area);
        return rect ? [{ rect, page: target }] : [];
      });
    });
  });
}
