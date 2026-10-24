import { rectContainsRect, rectsIntersect, type CanvasElement, type Rect } from "@canvas";

import { isDesignNode, withDescendants, type DesignNode, type ImagePaint } from "../../core";
import { isText } from "../../text";
import { mmToUnits } from "../model";
import { effectiveDpi } from "./effective-dpi";
import type { BrochureCheckInput, BrochureIssue } from "./brochure-checks.types";

/** Pictures printed with fewer pixels per inch than this look soft. */
export const LOW_DPI = 150;

/**
 * What would print badly in the brochure, page by page: hidden pages (they print blank), pictures
 * under `LOW_DPI` at their printed size, and text reaching into the margin.
 */
export function brochureIssues(input: BrochureCheckInput): BrochureIssue[] {
  const margin = mmToUnits(input.settings.margin);
  return input.pages.flatMap((page) => {
    const { frame, number } = page;
    const at = { page: number, frameId: frame.id };
    if (!frame.visible) {
      return [
        {
          ...at,
          kind: "hidden-page",
          nodeId: frame.id,
          message: "The page is hidden, so it prints blank.",
        },
      ];
    }
    const safe = inset(frame, margin);
    return shownNodes(frame.id, input.elements).flatMap((node): BrochureIssue[] => {
      const issues: BrochureIssue[] = [];
      for (const paint of imagePaints(node)) {
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
