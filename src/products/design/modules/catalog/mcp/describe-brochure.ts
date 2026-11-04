import { checkBrochure } from "../checks";
import type { DesignWorkspace } from "../../../design-engine.types";
import {
  brochurePageSize,
  DESIGN_BROCHURES,
  pageNumbers,
  paperSize,
  printedLabels,
  spanOf,
  type DesignBrochure,
} from "../model";

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
      frame: page.frame.id,
      name: page.frame.name,
      span: size ? spanOf(page.frame, size) : 1,
      options: page.options.map((option) => ({ id: option.id, name: option.name })),
    })),
    blanks: layout.sides.flatMap((side, i) =>
      side.kind === "blank" ? [{ printedPage: i + 1, reason: side.reason }] : [],
    ),
    printedPages: layout.pageCount,
    spreads: layout.spreadNumbers,
    settings,
    masters: (record?.masters ?? []).map((master) => ({
      ...master,
      default: master.id === settings.defaultMaster,
    })),
    sections: (record?.sections ?? []).map(({ id, name, start, restart, style }) => ({
      id,
      name,
      startPosition: positionOf.get(start) ?? null,
      restart: restart ?? null,
      style: style ?? null,
    })),
    paper: size ? paperSize(size) : null,
    issues: (await checkBrochure(engine, brochure)).map(({ kind, page, nodeId, message }) => ({
      kind,
      page,
      node: nodeId,
      message,
    })),
  };
}
