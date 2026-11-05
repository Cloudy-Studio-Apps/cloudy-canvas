import type { DataScope } from "../../../data";
import type { BrochureElement, BrochureSlot } from "../../brochure";
import { brochureLanguage } from "../language";
import { copyName } from "./copy-name";
import { expandedId } from "./expanded-id";
import { loopContexts } from "./loop-contexts";
import { rowsPerPage } from "./loop-units";
import { repeatTree } from "./repeat-tree";
import type { BrochureExpansion, ExpandedPage, ExpandedSection } from "./expand-brochure.types";
import type { ExpandContext, RepeatNode, RepeatSectionNode } from "./repeat-tree.types";

/**
 * A brochure's pages and sections with its repeats expanded, read like nested loops: walking the
 * template slots in order, a repeating section's pages (subsections included) are yielded once per
 * row of its list, read in the scope of the loops around it, and a repeating page once per row or
 * `perPage` rows; inner repeats expand inside each copy. While designing the template pages show
 * the preview row, a few copies are made and the rest are pending (`made: false`), planned in full
 * (their own inner loops too) so page counts and numbers are right; in an export all are made.
 * Section names read their tokens in each copy's scope, in the brochure's language. Pure: nothing
 * is written.
 */
export function expandBrochure(
  record: Pick<BrochureElement, "slots" | "sections" | "settings">,
  root: DataScope,
  phase: "design" | "export",
): BrochureExpansion {
  const locale = brochureLanguage(record.settings);
  const pages: ExpandedPage[] = [];
  const sections: ExpandedSection[] = [];

  const page = (slot: BrochureSlot, ctx: ExpandContext) => {
    pages.push({
      id: expandedId(slot.id, ctx.path),
      from: slot.id,
      path: ctx.path,
      layers: ctx.layers,
      made: ctx.made,
      printed: ctx.printed,
    });
  };

  const section = (node: RepeatSectionNode, ctx: ExpandContext) => {
    const { section: item, depth } = node.placed;
    sections.push({
      id: expandedId(item.id, ctx.path),
      from: item.id,
      path: ctx.path,
      name: copyName(item.name, ctx.scope, locale),
      level: depth,
      start: expandedId(item.start, ctx.path),
    });
    walk(node.children, ctx);
  };

  const walk = (nodes: readonly RepeatNode[], ctx: ExpandContext) => {
    for (const node of nodes) {
      if (node.kind === "slot") {
        const { slot } = node;
        if (!slot.repeat) page(slot, ctx);
        else {
          const owner = {
            id: slot.id,
            label: slot.repeat.source,
            perPage: rowsPerPage(slot.repeat),
          };
          for (const pass of loopContexts(slot.repeat, owner, ctx, phase)) page(slot, pass);
        }
        continue;
      }
      const { repeat, id, name } = node.placed.section;
      if (!repeat) section(node, ctx);
      else {
        const owner = { id, label: name, perPage: 1 };
        for (const pass of loopContexts(repeat, owner, ctx, phase)) section(node, pass);
      }
    }
  };

  walk(repeatTree(record), { scope: root, layers: [], path: [], made: true, printed: true });
  return { pages, sections, pending: pages.filter((item) => !item.made).length };
}
