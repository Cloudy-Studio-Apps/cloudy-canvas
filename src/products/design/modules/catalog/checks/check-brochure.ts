import { elementBounds } from "@canvas";

import type { DesignWorkspace } from "../../../design-engine.types";
import { pageNumbers, pageRefs, type DesignBrochure } from "../model";
import { brochureIssues } from "./brochure-checks";
import type { BrochureIssue } from "./brochure-checks.types";
import { repeatIssues } from "./repeat-issues";
import { knownPictureSize, pictureSize } from "./picture-size";

/**
 * A brochure's print issues (see `brochureIssues`), reading the pictures' sizes from their
 * files the first time each is needed.
 */
export async function checkBrochure(
  workspace: DesignWorkspace,
  brochure: DesignBrochure,
): Promise<BrochureIssue[]> {
  const { doc, kinds } = workspace;
  const missing = new Set<string>();
  const layout = brochure.layout();
  const record = brochure.record();
  const refs = record ? pageRefs(layout, pageNumbers(layout, record)) : () => null;
  // Pending pages are their template's frame (checked once, as itself); not printed ones print nothing.
  const pages = brochure.pages().filter((page) => !page.pending && !page.notPrinted);
  const check = () =>
    brochureIssues({
      pages,
      layout,
      refs,
      elements: doc.all(),
      settings: brochure.settings(),
      bounds: (el) => elementBounds(kinds.kindOf(el), el),
      imageSize: (assetId) => {
        const size = knownPictureSize(doc, assetId);
        if (size === undefined) missing.add(assetId);
        return size ?? null;
      },
    });

  const more = () => repeatIssues(workspace, brochure);
  const issues = check();
  if (missing.size === 0) return [...issues, ...more()];
  await Promise.all([...missing].map((assetId) => pictureSize(doc, assetId)));
  return [...check(), ...more()];
}
