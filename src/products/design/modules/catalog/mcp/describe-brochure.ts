import { checkBrochure } from "../checks";
import type { DesignWorkspace } from "../../../design-engine.types";
import {
  brochurePageSize,
  DESIGN_BROCHURES,
  paperSize,
  spanOf,
  type DesignBrochure,
} from "../model";

/** A brochure as agents read it (get_brochure, and what the edit tools return). */
export async function describeBrochure(engine: DesignWorkspace, brochure: DesignBrochure) {
  const pages = brochure.pages();
  const layout = brochure.layout();
  const size = brochurePageSize(pages);
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
    settings: brochure.settings(),
    paper: size ? paperSize(size) : null,
    issues: (await checkBrochure(engine, brochure)).map(({ kind, page, nodeId, message }) => ({
      kind,
      page,
      node: nodeId,
      message,
    })),
  };
}
