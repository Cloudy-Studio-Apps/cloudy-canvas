import { checkBrochure } from "../checks";
import type { DesignWorkspace } from "../../../design-engine.types";
import {
  brochurePageSize,
  DESIGN_BROCHURES,
  pageNumbers,
  paperSize,
  placeSections,
  printedLabels,
  spanOf,
  type DesignBrochure,
} from "../model";
import { describeRepeats } from "./describe-repeats";
import { pageItemsIn } from "./page-item-summary";

/**
 * A brochure as agents read it (get_brochure, and what the edit tools return): its pages with
 * their printed numbers and masters, its masters, sections and settings, and its issues.
 */
export async function describeBrochure(engine: DesignWorkspace, brochure: DesignBrochure) {
  const pages = brochure.pages();
  const layout = brochure.layout();
  const size = brochurePageSize(pages);
  const record = brochure.record();
  const numbers = record ? pageNumbers(layout, record) : [];
  const printed = printedLabels(layout, numbers);
  const settings = brochure.settings();
  const elements = engine.doc.all();
  const positionOf = new Map(pages.map((page, i) => [page.slot.id, i + 1]));
  const others = engine
    .service(DESIGN_BROCHURES)
    .list(brochure.page)
    .filter((other) => other.id !== brochure.id)
    .map((other) => ({ id: other.id, name: other.name }));
  return {
    id: brochure.id,
    name: brochure.name,
    designPage: brochure.page,
    otherBrochures: others,
    pages: pages.map((page, i) => ({
      position: i + 1,
      number: layout.labels.get(page.slot.id) ?? String(page.number),
      // As its page number items print it ("iv"), when numbering or sections change it.
      printedNumber: printed.get(page.slot.id) ?? null,
      // `default` (the brochure's default master), `none` or a master's id.
      master: page.slot.master === undefined ? "default" : (page.slot.master ?? "none"),
      // A pending page has no frame of its own yet: `template` is the page it copies.
      ...(page.pending
        ? { pending: true, frame: null, template: page.frame.id }
        : { frame: page.frame.id }),
      name: page.frame.name,
      ...(page.slot.generated ? { generated: true } : {}),
      ...(page.slot.detached ? { detached: true } : {}),
      ...(page.notPrinted ? { notPrinted: true } : {}),
      span: size ? spanOf(page.frame, size) : 1,
      options: page.options.map((option) => ({ id: option.id, name: option.name })),
    })),
    blanks: layout.sides.flatMap((side, i) =>
      side.kind === "blank" ? [{ printedPage: i + 1, reason: side.reason }] : [],
    ),
    printedPages: layout.pageCount,
    pendingPages: brochure.pendingPages(),
    repeats: describeRepeats(brochure),
    spreads: layout.spreadNumbers,
    settings,
    masters: (record?.masters ?? []).map((master) => ({
      ...master,
      default: master.id === settings.defaultMaster,
      // Its own page items, the ones set_page_item changes for every page.
      pageItems: [master.left, master.right].flatMap((frame) =>
        frame ? pageItemsIn(frame, elements) : [],
      ),
    })),
    // In reading order, with the depth they're read at and the section they're in.
    sections: placeSections(record?.sections ?? [], record?.slots ?? []).map(
      ({ section: { id, name, start, restart, style }, depth, parent }) => ({
        id,
        name,
        startPosition: positionOf.get(start) ?? null,
        level: depth,
        parent,
        restart: restart ?? null,
        style: style ?? null,
      }),
    ),
    paper: size ? paperSize(size) : null,
    issues: (await checkBrochure(engine, brochure)).map(({ kind, page, nodeId, message }) => ({
      kind,
      page,
      node: nodeId,
      message,
    })),
  };
}
