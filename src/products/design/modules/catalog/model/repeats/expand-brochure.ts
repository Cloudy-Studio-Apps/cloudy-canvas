import type { DataScope } from "../../../data";
import type { BrochureElement, BrochureSlot } from "../../brochure";
import { brochureLanguage } from "../language";
import { copyName } from "./copy-name";
import { expandedId } from "./expanded-id";
import { loopContexts } from "./loop-contexts";
import { rowsPerPage } from "./loop-units";
import { detachedPage, placeDetached } from "./place-detached";
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
 * Section names read their tokens in each copy's scope, in the brochure's language. A page taken
 * out of a repeat by hand (its id in its loop's `detachedPages`) isn't made: its detached slot, if
 * it was detached rather than deleted, stands in its place as a plain page; pages of whole copies
 * taken out (`detached`) are plain pages after the slot before them (`placeDetached`). Pure:
 * nothing is written.
 */
export function expandBrochure(
  record: Pick<BrochureElement, "slots" | "sections" | "settings">,
  root: DataScope,
  phase: "design" | "export",
): BrochureExpansion {
  const locale = brochureLanguage(record.settings);
  const pages: ExpandedPage[] = [];
  const sections: ExpandedSection[] = [];
  // Single copies taken out by hand: none is made; a detached one stands in its place.
  const skipped = new Set<string>();
  for (const item of [...record.sections, ...record.slots]) {
    for (const id of item.repeat?.detachedPages ?? []) skipped.add(id);
  }
  const standIns = new Map<string, BrochureSlot>();
  for (const slot of record.slots) {
    const { detached } = slot;
    const id = detached ? expandedId(detached.from, detached.rows) : "";
    if (detached && !slot.generated && skipped.has(id) && !standIns.has(id)) standIns.set(id, slot);
  }
  const placed = new Set<string>();

  const page = (slot: BrochureSlot, ctx: ExpandContext) => {
    const id = expandedId(slot.id, ctx.path);
    // Named by the rows it shows, so the same page is left out in both phases.
    const shown = expandedId(slot.id, ctx.rows);
    if (ctx.path.length > 0 && skipped.has(shown)) {
      const standIn = standIns.get(shown);
      if (standIn) {
        pages.push(detachedPage(standIn));
        placed.add(standIn.id);
      }
      return;
    }
    pages.push({
      id,
      from: slot.id,
      path: ctx.path,
      rows: ctx.rows,
      layers: ctx.layers,
      made: ctx.made,
      printed: ctx.printed,
    });
  };

  const section = (node: RepeatSectionNode, ctx: ExpandContext) => {
    const { section: item, depth } = node.placed;
    const placed: ExpandedSection = {
      id: expandedId(item.id, ctx.path),
      from: item.id,
      path: ctx.path,
      rows: ctx.rows,
      name: copyName(item.name, ctx.scope, locale),
      level: depth,
      start: expandedId(item.start, ctx.path),
      first: pages.length,
      end: pages.length,
    };
    sections.push(placed);
    walk(node.children, ctx);
    // Its range is the tree's: a repeating section's run already stops before the back cover.
    placed.end = pages.length;
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

  walk(repeatTree(record), {
    scope: root,
    layers: [],
    path: [],
    rows: [],
    made: true,
    printed: true,
  });
  placeDetached(record, pages, sections, placed);
  return { pages, sections, pending: pages.filter((item) => !item.made && item.printed).length };
}
