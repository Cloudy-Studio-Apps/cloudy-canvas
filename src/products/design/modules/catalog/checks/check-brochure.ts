import { elementBounds } from "@canvas";

import type { DesignWorkspace } from "../../../design-engine.types";
import { DESIGN_BROCHURE } from "../model";
import { brochureIssues } from "./brochure-checks";
import type { BrochureIssue } from "./brochure-checks.types";
import { knownPictureSize, pictureSize } from "./picture-size";

/**
 * The brochure's print issues (see `brochureIssues`), reading the pictures' sizes from their
 * files the first time each is needed.
 */
export async function checkBrochure(workspace: DesignWorkspace): Promise<BrochureIssue[]> {
  const { doc, kinds } = workspace;
  const brochure = workspace.service(DESIGN_BROCHURE);
  const missing = new Set<string>();
  const check = () =>
    brochureIssues({
      pages: brochure.pages(),
      elements: doc.all(),
      settings: brochure.settings(),
      bounds: (el) => elementBounds(kinds.kindOf(el), el),
      imageSize: (assetId) => {
        const size = knownPictureSize(doc, assetId);
        if (size === undefined) missing.add(assetId);
        return size ?? null;
      },
    });

  const issues = check();
  if (missing.size === 0) return issues;
  await Promise.all([...missing].map((assetId) => pictureSize(doc, assetId)));
  return check();
}
