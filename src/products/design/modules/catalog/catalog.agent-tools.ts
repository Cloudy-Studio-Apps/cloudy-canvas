import {
  exportPath,
  optionalBoolean,
  optionalNumber,
  optionalString,
  recordList,
  stringList,
  type ToolArgs,
} from "@canvas";
import { createId } from "@shared/core";

import { requireDesign, type DesignAgentTool } from "../../agent";
import type { DesignWorkspace } from "../../design-engine.types";
import type { BrochureSlot } from "./brochure";
import { checkBrochure } from "./checks";
import { exportBrochure } from "./export";
import { DESIGN_BROCHURE, isPageFrame, paperSize } from "./model";

/** The brochure as agents read it. */
async function describeBrochure(engine: DesignWorkspace) {
  const brochure = engine.service(DESIGN_BROCHURE);
  const pages = brochure.pages();
  const first = pages[0]?.frame;
  return {
    pages: pages.map((page) => ({
      number: page.number,
      frame: page.frame.id,
      name: page.frame.name,
      designPage: page.frame.pageId,
      options: page.options.map((option) => ({ id: option.id, name: option.name })),
    })),
    settings: brochure.settings(),
    paper: first ? paperSize(first) : null,
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
      "frame (`frame`) chosen among its options (other frames kept as alternatives), the design " +
      "page each is on, the print settings (facing pages, margin in mm, dpi), the paper size of " +
      "the first page, and the print issues (low-resolution pictures, text in the margin, hidden " +
      "pages).",
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
      "Changes how the brochure prints, in one undo step: `facing` (pages in spreads, the first " +
      "alone as the cover), `margin` (the safe area's inset in mm, which the checks read) and " +
      "`dpi` (the exported PDF's resolution, 300 for print).",
    inputSchema: {
      type: "object",
      properties: {
        facing: { type: "boolean" },
        margin: { type: "number", minimum: 0 },
        dpi: { type: "number", minimum: 36, maximum: 600 },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const facing = optionalBoolean(args, "facing");
      const margin = optionalNumber(args, "margin");
      const dpi = optionalNumber(args, "dpi");
      if (margin !== undefined && margin < 0) throw new Error('"margin" must be 0 or more.');
      if (dpi !== undefined && (dpi < 36 || dpi > 600)) throw new Error('"dpi" must be 36–600.');
      const brochure = engine.service(DESIGN_BROCHURE);
      brochure.setSettings({
        ...(facing !== undefined ? { facing } : {}),
        ...(margin !== undefined ? { margin } : {}),
        ...(dpi !== undefined ? { dpi } : {}),
      });
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
