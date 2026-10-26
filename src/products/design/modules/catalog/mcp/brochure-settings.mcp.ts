import {
  exportPath,
  optionalBoolean,
  optionalChoice,
  optionalNumber,
  optionalString,
} from "@canvas";

import { requireDesign, type DesignMcpTool } from "../../../mcp";
import {
  BROCHURE_ARRANGES,
  BROCHURE_COVERS,
  BROCHURE_LAYOUTS,
  type BrochureSettings,
} from "../brochure";
import { exportBrochure } from "../export";
import { BROCHURE_SCHEMA, readBrochure } from "./brochure-args";

/** How the brochure prints, and its PDF. */
export const brochureSettingsTools: DesignMcpTool[] = [
  {
    name: "set_brochure_settings",
    description:
      "Changes how the brochure prints, in one undo step: `layout` (`book`: pages facing each " +
      "other across a spine; `single`: one at a time), `covers` (the book's covers, which stand " +
      "alone: `both`, `front`, `back` or `none`; a blank page is added where one is needed to " +
      "keep the back cover on the left or a spread frame starting on a left page), " +
      "`splitSpreads` (frames twice the page's width are spreads of two pages: in the PDF, two " +
      "pages or one wide one), `margin` (the safe area's inset in mm, which the checks read) and " +
      "`dpi` (the exported PDF's resolution, 300 for print) and `arrange`, which lays the " +
      "brochure's frames out on the canvas and keeps them so after every brochure edit " +
      "(`below`: printed pages in a row by spread, the other options under each; `beside`: a " +
      "spread per row, options to the side; `off`, the default, leaves them where they are); " +
      "other layers in the way are moved up or down.",
    inputSchema: {
      type: "object",
      required: ["brochure"],
      properties: {
        layout: { enum: BROCHURE_LAYOUTS },
        covers: { enum: BROCHURE_COVERS },
        splitSpreads: { type: "boolean" },
        margin: { type: "number", minimum: 0 },
        dpi: { type: "number", minimum: 36, maximum: 600 },
        arrange: { enum: BROCHURE_ARRANGES },
        brochure: BROCHURE_SCHEMA,
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      const layout = optionalChoice(args, "layout", BROCHURE_LAYOUTS);
      const covers = optionalChoice(args, "covers", BROCHURE_COVERS);
      const splitSpreads = optionalBoolean(args, "splitSpreads");
      const margin = optionalNumber(args, "margin");
      const dpi = optionalNumber(args, "dpi");
      const arrange = optionalChoice(args, "arrange", BROCHURE_ARRANGES);
      if (margin !== undefined && margin < 0) throw new Error('"margin" must be 0 or more.');
      if (dpi !== undefined && (dpi < 36 || dpi > 600)) throw new Error('"dpi" must be 36–600.');
      const patch: Partial<BrochureSettings> = {};
      if (layout !== undefined) patch.layout = layout;
      if (covers !== undefined) patch.covers = covers;
      if (splitSpreads !== undefined) patch.splitSpreads = splitSpreads;
      if (margin !== undefined) patch.margin = margin;
      if (dpi !== undefined) patch.dpi = dpi;
      if (arrange !== undefined) patch.arrange = arrange;
      brochure.setSettings(patch);
      return { settings: brochure.settings() };
    },
  },
  {
    name: "arrange_brochure",
    description:
      "Lays the brochure's frames out on the canvas once as its `arrange` setting says (`below` " +
      "when it's off: the printed pages in a row by spread, each page's other options under it) " +
      "and moves other layers in the way up or down, in one undo step. Returns how many layers " +
      "moved (0 when it already was arranged).",
    inputSchema: {
      type: "object",
      required: ["brochure"],
      properties: { brochure: BROCHURE_SCHEMA },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const moved = readBrochure(engine, args).arrange();
      // Count the layers moved, not everything they hold.
      const roots = [...moved.keys()].filter((id) => {
        const parent = engine.doc.field(id, "parentId");
        return typeof parent !== "string" || !moved.has(parent);
      });
      return { moved: roots.length };
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
      required: ["brochure"],
      properties: {
        path: { type: "string", description: "Absolute path of the file to write." },
        brochure: BROCHURE_SCHEMA,
      },
    },
    run: async (host, args) => {
      const design = requireDesign(host);
      const brochure = readBrochure(design.engine, args);
      const path = exportPath(design, "pdf", optionalString(args, "path"), "design");
      const file = await exportBrochure(design.engine, brochure);
      await host.writeFile(path, file);
      return {
        path,
        bytes: file.size,
        pages: brochure.pages().length,
      };
    },
  },
];
