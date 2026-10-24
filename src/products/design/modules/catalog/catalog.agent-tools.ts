import {
  exportPath,
  optionalBoolean,
  optionalChoice,
  optionalNumber,
  optionalString,
  recordList,
  stringList,
  type ToolArgs,
} from "@canvas";
import { createId } from "@shared/core";

import { requireDesign, type DesignAgentTool } from "../../agent";
import type { DesignWorkspace } from "../../design-engine.types";
import {
  BROCHURE_COVERS,
  BROCHURE_LAYOUTS,
  type BrochureSettings,
  type BrochureSlot,
} from "./brochure";
import { checkBrochure } from "./checks";
import { exportBrochure } from "./export";
import { brochurePageSize, DESIGN_BROCHURE, isPageFrame, paperSize, spanOf } from "./model";

/** The brochure as agents read it. */
async function describeBrochure(engine: DesignWorkspace) {
  const brochure = engine.service(DESIGN_BROCHURE);
  const pages = brochure.pages();
  const layout = brochure.layout();
  const size = brochurePageSize(pages);
  return {
    pages: pages.map((page) => ({
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

/** The pages an agent gave, checked: top-level frames, each in one page only. */
function readSlots(engine: DesignWorkspace, args: ToolArgs): BrochureSlot[] {
  const used = new Set<string>();
  return recordList(args, "pages").map((page, i) => {
    const frames = stringList(page, "frames");
    const [first] = frames;
    if (first === undefined) throw new Error(`pages[${i}].frames is empty.`);
    for (const frame of frames) {
      if (!isPageFrame(engine.doc.get(frame))) {
        throw new Error(`${frame} isn't a frame at the top of a page (see list_nodes).`);
      }
      if (used.has(frame)) throw new Error(`${frame} is in more than one page.`);
      used.add(frame);
    }
    const chosen = optionalString(page, "chosen") ?? first;
    if (!frames.includes(chosen)) throw new Error(`pages[${i}].chosen isn't one of its frames.`);
    return { id: createId(), frames, chosen };
  });
}

/** The brochure of the Catalog mode: a design's top-level frames as a print catalog's pages. */
export const catalogTools: DesignAgentTool[] = [
  {
    name: "get_brochure",
    description:
      "The design's brochure (the Catalog mode): its pages in order, each printing one top-level " +
      "frame (`frame`) chosen among its options (other frames kept as alternatives), with its " +
      'page numbers (`number`, "6–7" for a spread frame: `span` 2, twice the page\'s width) ' +
      "and the design page it's on; the blank pages the layout adds, the printed page count, the " +
      "spreads as they're read (printed page numbers), the print settings (layout, covers, " +
      "splitSpreads, margin in mm, dpi), the page size, and the print issues (low-resolution " +
      "pictures, text in the margin, hidden pages, blank pages added, frames of another size).",
    inputSchema: { type: "object", properties: {} },
    run: async (host) => describeBrochure(requireDesign(host).engine),
  },
  {
    name: "set_brochure_pages",
    description:
      "Replaces the brochure's pages, in order, in one undo step. Each page lists the top-level " +
      "frames that could be it (`frames`, its options) and the one printed (`chosen`, the first " +
      "by default). Frames may be on any design page; a frame can be in one page only. The frames " +
      "themselves don't change.",
    inputSchema: {
      type: "object",
      required: ["pages"],
      properties: {
        pages: {
          type: "array",
          items: {
            type: "object",
            required: ["frames"],
            properties: {
              frames: { type: "array", items: { type: "string" } },
              chosen: { type: "string" },
            },
          },
        },
      },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      engine.service(DESIGN_BROCHURE).setSlots(readSlots(engine, args));
      return describeBrochure(engine);
    },
  },
  {
    name: "set_brochure_settings",
    description:
      "Changes how the brochure prints, in one undo step: `layout` (`book`: pages facing each " +
      "other across a spine; `single`: one at a time), `covers` (the book's covers, which stand " +
      "alone: `both`, `front`, `back` or `none`; a blank page is added where one is needed to " +
      "keep the back cover on the left or a spread frame starting on a left page), " +
      "`splitSpreads` (frames twice the page's width are spreads of two pages: in the PDF, two " +
      "pages or one wide one), `margin` (the safe area's inset in mm, which the checks read) and " +
      "`dpi` (the exported PDF's resolution, 300 for print).",
    inputSchema: {
      type: "object",
      properties: {
        layout: { enum: BROCHURE_LAYOUTS },
        covers: { enum: BROCHURE_COVERS },
        splitSpreads: { type: "boolean" },
        margin: { type: "number", minimum: 0 },
        dpi: { type: "number", minimum: 36, maximum: 600 },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const layout = optionalChoice(args, "layout", BROCHURE_LAYOUTS);
      const covers = optionalChoice(args, "covers", BROCHURE_COVERS);
      const splitSpreads = optionalBoolean(args, "splitSpreads");
      const margin = optionalNumber(args, "margin");
      const dpi = optionalNumber(args, "dpi");
      if (margin !== undefined && margin < 0) throw new Error('"margin" must be 0 or more.');
      if (dpi !== undefined && (dpi < 36 || dpi > 600)) throw new Error('"dpi" must be 36–600.');
      const patch: Partial<BrochureSettings> = {};
      if (layout !== undefined) patch.layout = layout;
      if (covers !== undefined) patch.covers = covers;
      if (splitSpreads !== undefined) patch.splitSpreads = splitSpreads;
      if (margin !== undefined) patch.margin = margin;
      if (dpi !== undefined) patch.dpi = dpi;
      const brochure = engine.service(DESIGN_BROCHURE);
      brochure.setSettings(patch);
      return { settings: brochure.settings() };
    },
  },
  {
    name: "export_brochure_pdf",
    description:
      "Writes the brochure as one PDF, a page per brochure page in order, each the printed " +
      "frame exactly at the brochure's dpi (an A4 frame is an A4 page). The file goes to " +
      '"path" (absolute; .pdf is added when missing), or next to the design\'s file, named after ' +
      "it. An existing file is replaced. Returns the path written and the page count.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Absolute path of the file to write." },
      },
    },
    run: async (host, args) => {
      const design = requireDesign(host);
      const path = exportPath(design, "pdf", optionalString(args, "path"), "design");
      const file = await exportBrochure(design.engine);
      await host.writeFile(path, file);
      return {
        path,
        bytes: file.size,
        pages: design.engine.service(DESIGN_BROCHURE).pages().length,
      };
    },
  },
];
