import type { CanvasDocument, ElementPatch } from "@canvas";

import type { DataFieldRenameHook, DataFieldRenamer, DataScope } from "../../../data";
import type { BrochureElement, BrochureSection, BrochureSlot } from "../../brochure";
import { brochuresOf } from "../design-brochures";
import { DEFAULT_REPEAT_AS } from "./brochure-repeat.constants";
import type { BrochureRepeat } from "./brochure-repeat.types";
import { repeatTree } from "./repeat-tree";
import type { RepeatNode } from "./repeat-tree.types";

/** One brochure's sections and slots with their renamed fields rewritten, `null` when none. */
function renamedBrochure(
  record: BrochureElement,
  renamer: DataFieldRenamer,
): Partial<Pick<BrochureElement, "sections" | "slots">> | null {
  const sections = new Map<string, BrochureSection>();
  const slots = new Map<string, BrochureSlot>();
  const repeatIn = (scope: DataScope, repeat: BrochureRepeat): BrochureRepeat | null =>
    renamer.repeat(scope, repeat, DEFAULT_REPEAT_AS) as BrochureRepeat | null;

  const walk = (nodes: readonly RepeatNode[], scope: DataScope) => {
    for (const node of nodes) {
      if (node.kind === "slot") {
        const repeat = node.slot.repeat && repeatIn(scope, node.slot.repeat);
        if (repeat) slots.set(node.slot.id, { ...node.slot, repeat });
        continue;
      }
      const { section } = node.placed;
      let inner = scope;
      let next: BrochureSection = section;
      if (section.repeat) {
        const repeat = repeatIn(scope, section.repeat);
        if (repeat) next = { ...next, repeat };
        inner = renamer.rowScope(
          scope,
          section.repeat.source,
          section.repeat.as || DEFAULT_REPEAT_AS,
        );
      }
      // A section's name reads its tokens in its own loop's row (`copyName`).
      const name = renamer.text(inner, section.name);
      if (name !== null) next = { ...next, name };
      if (next !== section) sections.set(section.id, next);
      walk(node.children, inner);
    }
  };
  walk(repeatTree(record), renamer.root);

  if (sections.size === 0 && slots.size === 0) return null;
  return {
    ...(sections.size > 0
      ? { sections: record.sections.map((item) => sections.get(item.id) ?? item) }
      : {}),
    ...(slots.size > 0 ? { slots: record.slots.map((item) => slots.get(item.id) ?? item) } : {}),
  };
}

/**
 * The catalog's `dataFieldRenames` hook: when a source's shape step renames fields, each
 * brochure's section and page repeats (`source` in the loops around, `key`, `filter`, `sort` in
 * the row) and section names follow, read in the scope their expansion reads them in
 * (`repeatTree`). The pages' layers are the data module's (their scope comes from
 * `pageScopeProvider`). Written in the caller's undo step.
 */
export const renameBrochureFields: DataFieldRenameHook = (
  doc: CanvasDocument,
  renamer: DataFieldRenamer,
) => {
  const patches = new Map<string, ElementPatch>();
  for (const record of brochuresOf(doc).records()) {
    const patch = renamedBrochure(record, renamer);
    if (patch) patches.set(record.id, patch as ElementPatch);
  }
  if (patches.size > 0) doc.updateMany(patches);
};
