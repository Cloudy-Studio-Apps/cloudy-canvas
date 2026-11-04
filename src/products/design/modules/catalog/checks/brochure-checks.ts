import { rectContainsRect, rectsIntersect, type Rect } from "@canvas";

import { isPlaceholderPaint, type DesignNode, type ImagePaint } from "../../core";
import { isText } from "../../text";
import { mmToUnits, pageItemTemplate, type BrochurePage } from "../model";
import { effectiveDpi } from "./effective-dpi";
import { layoutIssues } from "./layout-issues";
import { printIssues } from "./print-issues";
import { shownNodes } from "./shown-nodes";
import type { BrochureCheckInput, BrochureIssue } from "./brochure-checks.types";
import { t } from "../catalog.i18n";

/** Pictures printed with fewer pixels per inch than this look soft. */
export const LOW_DPI = 150;

/**
 * What would print badly in the brochure: blank pages the layout added and frames of another size
 * (`layoutIssues`), then page by page hidden pages (they print blank), image placeholders still to
 * replace, pictures under `LOW_DPI` at their printed size, text reaching into the margin and a
 * table of contents running past the bottom margin; last
 * what the press needs (`printIssues`).
 */
export function brochureIssues(input: BrochureCheckInput): BrochureIssue[] {
  return [
    ...layoutIssues(input),
    ...input.pages.flatMap((page) => pageIssues(page, input)),
    ...printIssues(input),
  ];
}

/** What would print badly on one page: hidden, placeholders, soft pictures, text in the margin. */
function pageIssues(page: BrochurePage, input: BrochureCheckInput): BrochureIssue[] {
  const { frame } = page;
  const at = {
    page: input.layout.labels.get(page.slot.id) ?? String(page.number),
    frameId: frame.id,
  };
  if (!frame.visible) {
    const message = t("checks.hidden");
    return [{ ...at, kind: "hidden-page", nodeId: frame.id, message }];
  }
  const safe = inset(frame, mmToUnits(input.settings.margin));
  return shownNodes(frame.id, input.elements).flatMap((node): BrochureIssue[] => {
    const issues: BrochureIssue[] = [];
    const paints = imagePaints(node);
    if (paints.some(isPlaceholderPaint)) {
      const message = t("checks.placeholder", { name: node.name });
      issues.push({ ...at, kind: "placeholder", nodeId: node.id, message });
    }
    for (const paint of paints) {
      if (isPlaceholderPaint(paint)) continue;
      const size = input.imageSize(paint.assetId);
      const dpi = size && effectiveDpi(paint, node, size);
      if (dpi !== null && dpi < LOW_DPI) {
        const message = t("checks.lowDpi", { name: node.name, dpi: Math.round(dpi) });
        issues.push({ ...at, kind: "low-resolution", nodeId: node.id, message });
        break;
      }
    }
    const shown = input.bounds(node);
    // A table of contents grows down with its lines: past the bottom margin, it doesn't fit.
    if (isText(node) && pageItemTemplate(node)?.includes("{toc}")) {
      if (shown.y + shown.h > safe.y + safe.h) {
        const message = t("checks.tocOverflow", { name: node.name });
        issues.push({ ...at, kind: "toc-overflow", nodeId: node.id, message });
      }
      return issues;
    }
    if (isText(node) && rectsIntersect(shown, frame) && !rectContainsRect(safe, shown)) {
      const message = t("checks.margin", {
        name: node.name,
        margin: input.settings.margin,
      });
      issues.push({ ...at, kind: "text-in-margin", nodeId: node.id, message });
    }
    return issues;
  });
}

function imagePaints(node: DesignNode): ImagePaint[] {
  return node.fills.filter((paint): paint is ImagePaint => paint.type === "image" && paint.visible);
}

function inset({ x, y, w, h }: Rect, by: number): Rect {
  return { x: x + by, y: y + by, w: Math.max(0, w - by * 2), h: Math.max(0, h - by * 2) };
}
