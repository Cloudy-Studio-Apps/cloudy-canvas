import { checkBrochure } from "../checks";
import type { DesignWorkspace } from "../../../design-engine.types";
import { brochurePageSize, DESIGN_BROCHURE, paperSize, spanOf } from "../model";

/** The brochure as agents read it (get_brochure, and what the edit tools return). */
export async function describeBrochure(engine: DesignWorkspace) {
  const brochure = engine.service(DESIGN_BROCHURE);
  const pages = brochure.pages();
  const layout = brochure.layout();
  const size = brochurePageSize(pages);
  return {
    pages: pages.map((page, i) => ({
      position: i + 1,
      number: layout.labels.get(page.slot.id) ?? String(page.number),
      frame: page.frame.id,
      name: page.frame.name,
      designPage: page.frame.pageId,
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
    issues: (await checkBrochure(engine)).map(({ page, nodeId, message }) => ({
      page,
      node: nodeId,
      message,
    })),
  };
}
