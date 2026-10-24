import { rectContainsRect, rectsIntersect, type CanvasElement, type Rect } from "@canvas";

import { isDesignNode, withDescendants, type DesignNode, type ImagePaint } from "../../core";
import { isPlaceholderPaint } from "../../image";
import { isText } from "../../text";
import { mmToUnits, type BrochurePage } from "../model";
import { effectiveDpi } from "./effective-dpi";
import { layoutIssues } from "./layout-issues";
import type { BrochureCheckInput, BrochureIssue } from "./brochure-checks.types";

/** Pictures printed with fewer pixels per inch than this look soft. */
export const LOW_DPI = 150;

/**
 * What would print badly in the brochure: blank pages the layout added and frames of another size
 * (`layoutIssues`), then page by page hidden pages (they print blank), image placeholders still to
 * replace, pictures under `LOW_DPI` at their printed size, and text reaching into the margin.
 */
export function brochureIssues(input: BrochureCheckInput): BrochureIssue[] {
  return [...layoutIssues(input), ...input.pages.flatMap((page) => pageIssues(page, input))];
}

/** What would print badly on one page: hidden, placeholders, soft pictures, text in the margin. */
function pageIssues(page: BrochurePage, input: BrochureCheckInput): BrochureIssue[] {
  const { frame } = page;
  const at = {
    page: input.layout.labels.get(page.slot.id) ?? String(page.number),
    frameId: frame.id,
  };
  if (!frame.visible) {
    const message = "The page is hidden, so it prints blank.";
    return [{ ...at, kind: "hidden-page", nodeId: frame.id, message }];
  }
  const safe = inset(frame, mmToUnits(input.settings.margin));
  return shownNodes(frame.id, input.elements).flatMap((node): BrochureIssue[] => {
    const issues: BrochureIssue[] = [];
    const paints = imagePaints(node);
    if (paints.some(isPlaceholderPaint)) {
      const message = `“${node.name}” is a placeholder: replace it with the picture.`;
      issues.push({ ...at, kind: "placeholder", nodeId: node.id, message });
    }
    for (const paint of paints) {
      if (isPlaceholderPaint(paint)) continue;
      const size = input.imageSize(paint.assetId);
      const dpi = size && effectiveDpi(paint, node, size);
      if (dpi !== null && dpi < LOW_DPI) {
        const message = `“${node.name}” is ${Math.round(dpi)} dpi at print size.`;
        issues.push({ ...at, kind: "low-resolution", nodeId: node.id, message });
        break;
      }
    }
    const shown = input.bounds(node);
    if (isText(node) && rectsIntersect(shown, frame) && !rectContainsRect(safe, shown)) {
      const message = `“${node.name}” reaches into the ${input.settings.margin} mm margin.`;
      issues.push({ ...at, kind: "text-in-margin", nodeId: node.id, message });
    }
    return issues;
  });
}

/** The visible layers inside a frame (a hidden one hides what it holds). */
function shownNodes(frameId: string, elements: readonly CanvasElement[]): DesignNode[] {
  const nodes = elements.filter(isDesignNode);
  const hidden = withDescendants(
    new Set(nodes.filter((node) => !node.visible).map((node) => node.id)),
    nodes,
  );
  const inside = withDescendants(new Set([frameId]), nodes);
  return nodes.filter((node) => node.id !== frameId && inside.has(node.id) && !hidden.has(node.id));
}

function imagePaints(node: DesignNode): ImagePaint[] {
  return node.fills.filter((paint): paint is ImagePaint => paint.type === "image" && paint.visible);
}

function inset({ x, y, w, h }: Rect, by: number): Rect {
  return { x: x + by, y: y + by, w: Math.max(0, w - by * 2), h: Math.max(0, h - by * 2) };
}
