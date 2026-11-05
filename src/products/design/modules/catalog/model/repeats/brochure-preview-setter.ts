import type { CanvasDocument, CanvasElement } from "@canvas";

import type { DataPreviewSetter, DataPreviewStep } from "../../../data";
import { brochuresOf } from "../design-brochures";
import { brochureExpansion } from "./brochure-expansion";
import { loopOwner } from "./loop-owner";
import { rowsPerPage } from "./loop-units";
import { repeatCopyTag } from "./repeat-copy-tag";
import { slotKey } from "./slot-key";
import { t } from "../../catalog.i18n";

/**
 * A layer's top-level ancestor (itself at the top); `null` when the way up is broken (a parent
 * missing, or a cycle), so nothing is stepped from it.
 */
function topOf(doc: CanvasDocument, id: string): CanvasElement | null {
  const seen = new Set<string>();
  let at = doc.get(id);
  while (at && !seen.has(at.id)) {
    seen.add(at.id);
    const parentId = (at as { parentId?: unknown }).parentId;
    if (typeof parentId !== "string") return at;
    at = doc.get(parentId);
  }
  return null;
}

/**
 * The catalog's `dataPreviewSetters` entry: a brochure's repeating section or page around a
 * layer is "Section <name>" or "Page <name>" in In scope, named as the layer's page reads it (a
 * copy section's own name, the template's at its preview row: `loopOwner`), and from its template
 * pages a stepper sets its `previewRow` (`setRepeat`, one undo step; a page repeat's preview steps
 * by pages, so the row is the page's first). On a page a repeat made every row is fixed: no
 * stepper, a card repeater's on it neither (its row follows the template page's); nor on a layer
 * whose way up is broken.
 */
export const brochurePreviewSetter: DataPreviewSetter = (doc, layer, nodeId) => {
  const top = topOf(doc, nodeId);
  const fixed = top === null || repeatCopyTag(top) !== null;
  for (const record of brochuresOf(doc).records()) {
    const owns = (item: { id: string }) => item.id === layer.owner;
    if (!record.sections.some(owns) && !record.slots.some(owns)) continue;
    const expansion = brochureExpansion(doc, record);
    const slot = top ? record.slots.find((item) => item.frames.includes(top.id)) : undefined;
    const key = slot ? slotKey(slot) : null;
    const page = key === null ? -1 : expansion.pages.findIndex((item) => item.id === key);
    const owner = loopOwner(doc, record, layer.owner, { expansion, page });
    if (!owner) continue;
    const from =
      "section" in owner.target
        ? t("scope.from.section", { name: owner.name })
        : t("scope.from.page", { name: owner.name });
    const perPage = rowsPerPage(owner.repeat);
    const step: DataPreviewStep | null =
      fixed || layer.unreadable || layer.count === 0
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
  return fixed ? { step: null } : null;
};
