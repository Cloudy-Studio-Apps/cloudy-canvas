import type { CanvasDocument, EditedChange } from "@canvas";

import type { DesignWorkspace } from "../../../design-engine.types";
import { cappedRepeats, documentScopes, setDataPhase } from "../../data";
import type { BrochureElement } from "../brochure";
import {
  brochureExpansion,
  expandBrochure,
  hasRepeats,
  syncBrochureRepeats,
  type BrochureExpansion,
} from "../model";
import { brochureFrames } from "./brochure-frames";

/** Whether two expansions print the same pages, showing the same rows. */
function samePages(a: BrochureExpansion, b: BrochureExpansion): boolean {
  if (a.pages.length !== b.pages.length) return false;
  return a.pages.every((page, i) => {
    const other = b.pages[i];
    return (
      other !== undefined &&
      page.id === other.id &&
      page.printed === other.printed &&
      page.made === other.made &&
      page.rows.join("\n") === other.rows.join("\n")
    );
  });
}

/**
 * Whether the brochure as the document holds it prints less than its export must, so the export
 * makes its pages on a copy of the design: a repeat has pages not made yet, a template page shows
 * its preview row rather than the first, a page that doesn't print for the preview row would for
 * the first (or the other way round), or a card repeater on its pages has rows past its design cap.
 */
export function needsBrochureCopy(doc: CanvasDocument, record: BrochureElement): boolean {
  if (cappedRepeats(doc, brochureFrames(record))) return true;
  if (!hasRepeats(record)) return false;
  const shown = brochureExpansion(doc, record);
  if (shown.pending > 0) return true;
  return !samePages(shown, expandBrochure(record, documentScopes(doc).root, "export"));
}

/**
 * Makes every page of a brochure on a copy of the design readied for an export (its data phase
 * `"export"`): its repeats' copies, each filled from its rows, the template pages from the first
 * row, in one transaction, whose `afterEdit` stamps the masters and page items on the new pages and
 * fills the card repeaters in them.
 */
export function prepareBrochureCopy(workspace: DesignWorkspace, brochureId: string): void {
  const { doc, kinds } = workspace;
  setDataPhase(doc, "export");
  // As if its record changed: the sync expands it again and refills every page.
  const change: EditedChange = {
    updated: new Set([brochureId]),
    removed: [],
    before: new Map(),
    tokens: new Set(),
    meta: false,
  };
  doc.batch(() => syncBrochureRepeats(doc, change, kinds));
}
