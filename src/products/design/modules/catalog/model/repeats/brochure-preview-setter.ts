import type { CanvasDocument, CanvasElement } from "@canvas";

import type { DataPreviewSetter, DataPreviewStep } from "../../../data";
import { brochuresOf } from "../design-brochures";
import { loopOwner } from "./loop-owner";
import { rowsPerPage } from "./loop-units";
import { repeatCopyTag } from "./repeat-copy-tag";
import { t } from "../../catalog.i18n";

/** A layer's top-level ancestor (itself at the top). */
function topOf(doc: CanvasDocument, id: string): CanvasElement | undefined {
  const seen = new Set<string>();
  let at = doc.get(id);
  while (at && !seen.has(at.id)) {
    seen.add(at.id);
    const parentId = (at as { parentId?: unknown }).parentId;
    if (typeof parentId !== "string") return at;
    at = doc.get(parentId);
  }
  return at;
}

/**
 * The catalog's `dataPreviewSetters` entry: a brochure's repeating section or page around a
 * layer is "Section <name>" or "Page <name>" in In scope, and from its template pages a stepper
 * sets its `previewRow` (`setRepeat`, one undo step; a page repeat's preview steps by pages, so
 * the row is the page's first). On a page a repeat made every row is fixed: no stepper, a card
 * repeater's on it neither (its row follows the template page's).
 */
export const brochurePreviewSetter: DataPreviewSetter = (doc, layer, nodeId) => {
  const top = topOf(doc, nodeId);
  const copy = repeatCopyTag(top) !== null;
  for (const record of brochuresOf(doc).records()) {
    const owner = loopOwner(doc, record, layer.owner);
    if (!owner) continue;
    const from =
      "section" in owner.target
        ? t("scope.from.section", { name: owner.name })
        : t("scope.from.page", { name: owner.name });
    const perPage = rowsPerPage(owner.repeat);
    const step: DataPreviewStep | null =
      copy || layer.unreadable || layer.count === 0
        ? null
        : {
            count: layer.count,
            row: layer.index,
            set: (row) =>
              brochuresOf(doc)
                .get(record.id)
                ?.setRepeat(owner.target, { previewRow: row * perPage }),
          };
    return { from, step };
  }
  return copy ? { step: null } : null;
};
