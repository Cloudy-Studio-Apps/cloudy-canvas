import type { Rect } from "@canvas";

import type { DesignNode } from "../../core";
import { isText } from "../../text";
import type { BrochurePage } from "../model";
import type { BrochureCheckInput, BrochureIssue } from "./brochure-checks.types";
import { shownNodes } from "./shown-nodes";
import { t } from "../catalog.i18n";

/** How near a page's edge a layer counts as stopping on it, in world units. */
const EDGE_TOLERANCE = 0.5;

/**
 * What the press needs: CMYK without a profile can't be exported, and a layer that stops exactly on
 * a page's edge leaves a thin line of what's behind it if the cut is off by a hair.
 */
export function printIssues(input: BrochureCheckInput): BrochureIssue[] {
  const { pages, settings, layout } = input;
  const first = pages[0];
  const issues: BrochureIssue[] = [];
  if (settings.colorMode === "cmyk" && !settings.printProfile && first) {
    const page = layout.labels.get(first.slot.id) ?? String(first.number);
    const { id } = first.frame;
    const message = t("checks.noProfile");
    issues.push({ page, frameId: id, nodeId: id, kind: "no-print-profile", message });
  }
  if (settings.bleed <= 0) return issues;
  return [...issues, ...pages.flatMap((page) => edgeIssues(page, input))];
}

function edgeIssues(page: BrochurePage, input: BrochureCheckInput): BrochureIssue[] {
  const { frame } = page;
  const at = {
    page: input.layout.labels.get(page.slot.id) ?? String(page.number),
    frameId: frame.id,
  };
  // A rounded page has no bleed, so what's on its edge has nothing to run into.
  if (frame.cornerRadius > 0) {
    const message = t("checks.roundedPage", { name: frame.name });
    return [{ ...at, nodeId: frame.id, kind: "rounded-page", message }];
  }
  return shownNodes(frame.id, input.elements)
    .filter((node) => painted(node) && stopsOnEdge(input.bounds(node), frame))
    .map((node) => ({
      ...at,
      nodeId: node.id,
      kind: "stops-at-edge",
      message: t("checks.stopsAtEdge", { name: node.name, bleed: input.settings.bleed }),
    }));
}

function painted(node: DesignNode): boolean {
  return !isText(node) && node.fills.some((paint) => paint.visible);
}

function stopsOnEdge(shown: Rect, page: Rect): boolean {
  const near = (a: number, b: number) => Math.abs(a - b) <= EDGE_TOLERANCE;
  return (
    near(shown.x, page.x) ||
    near(shown.y, page.y) ||
    near(shown.x + shown.w, page.x + page.w) ||
    near(shown.y + shown.h, page.y + page.h)
  );
}
