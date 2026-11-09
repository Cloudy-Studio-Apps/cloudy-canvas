import {
  asUndoStep,
  exportPath,
  optionalBoolean,
  optionalRecord,
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
import { exportBrochure, storePrintProfile } from "../export";
import { BROCHURE_SCHEMA, readBrochure } from "./brochure-args";
import { readMaster } from "./master-args";

const PDF_MODES = ["sharp", "flattened"] as const;
const COLOR_MODES = ["rgb", "cmyk"] as const;
const RENDERING_INTENTS = ["relative", "perceptual"] as const;
const NUMBER_STYLES = ["arabic", "roman-lower", "roman-upper"] as const;
const COVER_NUMBERINGS = ["numbered", "hidden", "uncounted"] as const;

/** How the brochure prints, and its PDF. */
export const brochureSettingsTools: DesignMcpTool[] = [
  {
    name: "brochure_settings_set",
    description:
      "Changes how the brochure prints, in one undo step: `layout` (`book`: pages facing each " +
      "other across a spine; `single`: one at a time), `covers` (the book's covers, which stand " +
      "alone: `both`, `front`, `back` or `none`; a blank page is added where one is needed to " +
      "keep the back cover on the left or a spread frame starting on a left page), " +
      "`splitSpreads` (frames twice the page's width are spreads of two pages: in the PDF, two " +
      "pages or one wide one), `margin` (the safe area's inset in mm, which the checks read) and " +
      "`bleed` (how far pages run past their trim in the PDF, in mm), `cropMarks`, `colorMode` " +
      "(`rgb`, or `cmyk`, which needs a print profile), `printProfilePath` (the absolute path of " +
      "the print shop's .icc file, kept in the design; it sets `colorMode` to `cmyk`), " +
      "`renderingIntent` (`relative` or `perceptual`), " +
      "`dpi` (the exported PDF's picture resolution, 300 for print), `pdfMode` (`sharp`, the " +
      "default, keeps shapes and text as vectors; `flattened` prints each page as one picture, " +
      "for print shops that ask for it) and `arrange`, which lays the " +
      "brochure's frames out on the canvas and keeps them so after every brochure edit " +
      "(`below`: printed pages in a row by spread, the other options under each; `beside`: a " +
      "spread per row, options to the side; `off`, the default, leaves them where they are); " +
      "other layers in the way are moved up or down. Masters and numbering: `numbering` (`start`, " +
      "the first page's number; `style`, `arabic`, `roman-lower` or `roman-upper`; `covers`, " +
      "`numbered`, `hidden` (counted, not written: the default) or `uncounted`), " +
      "`defaultMaster` (the master pages show unless they pick one: a master's id, or null for " +
      "none) and `mastersOnCovers` (whether covers show their master too). `language` (a BCP 47 " +
      "tag: es, en, fr, pt, de, it) is the language the brochure is written in: its dates, its " +
      "built-in page items' words (already placed ones are rewritten in it, unless someone " +
      "changed them), its master frames' names and its PDF's language.",
    inputSchema: {
      type: "object",
      required: ["brochure"],
      properties: {
        layout: { enum: BROCHURE_LAYOUTS },
        covers: { enum: BROCHURE_COVERS },
        splitSpreads: { type: "boolean" },
        margin: { type: "number", minimum: 0 },
        dpi: { type: "number", minimum: 36, maximum: 600 },
        pdfMode: { enum: PDF_MODES },
        bleed: { type: "number", minimum: 0 },
        cropMarks: { type: "boolean" },
        colorMode: { enum: COLOR_MODES },
        renderingIntent: { enum: RENDERING_INTENTS },
        printProfilePath: { type: "string" },
        arrange: { enum: BROCHURE_ARRANGES },
        numbering: {
          type: "object",
          properties: {
            start: { type: "number", minimum: 0 },
            style: { enum: NUMBER_STYLES },
            covers: { enum: COVER_NUMBERINGS },
          },
        },
        defaultMaster: { type: ["string", "null"] },
        mastersOnCovers: { type: "boolean" },
        language: { type: "string", description: "A BCP 47 tag, e.g. es, fr, pt-BR." },
        brochure: BROCHURE_SCHEMA,
      },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      const profilePath = optionalString(args, "printProfilePath");
      const layout = optionalChoice(args, "layout", BROCHURE_LAYOUTS);
      const covers = optionalChoice(args, "covers", BROCHURE_COVERS);
      const splitSpreads = optionalBoolean(args, "splitSpreads");
      const margin = optionalNumber(args, "margin");
      const dpi = optionalNumber(args, "dpi");
      const pdfMode = optionalChoice(args, "pdfMode", PDF_MODES);
      const bleed = optionalNumber(args, "bleed");
      const cropMarks = optionalBoolean(args, "cropMarks");
      const colorMode = optionalChoice(args, "colorMode", COLOR_MODES);
      const renderingIntent = optionalChoice(args, "renderingIntent", RENDERING_INTENTS);
      const arrange = optionalChoice(args, "arrange", BROCHURE_ARRANGES);
      if (bleed !== undefined && bleed < 0) throw new Error('"bleed" must be 0 or more.');
      if (margin !== undefined && margin < 0) throw new Error('"margin" must be 0 or more.');
      if (dpi !== undefined && (dpi < 36 || dpi > 600)) throw new Error('"dpi" must be 36–600.');
      const numbering = optionalRecord(args, "numbering");
      const start = numbering && optionalNumber(numbering, "start");
      if (start !== undefined && start < 0) throw new Error('"numbering.start" must be 0 or more.');
      const style = numbering && optionalChoice(numbering, "style", NUMBER_STYLES);
      const coverNumbers = numbering && optionalChoice(numbering, "covers", COVER_NUMBERINGS);
      const mastersOnCovers = optionalBoolean(args, "mastersOnCovers");
      const language = optionalString(args, "language")?.trim();
      if (language !== undefined && !/^[A-Za-z]{2,8}(-[A-Za-z0-9]{1,8})*$/.test(language)) {
        throw new Error('"language" must be a BCP 47 tag, e.g. "es", "fr" or "pt-BR".');
      }
      const defaultMaster =
        args.defaultMaster === null
          ? null
          : "defaultMaster" in args
            ? readMaster(brochure, args, "defaultMaster").id
            : undefined;
      const patch: Partial<BrochureSettings> = {};
      if (profilePath) {
        patch.printProfile = await storePrintProfile(engine, await host.readFile(profilePath));
        patch.colorMode = "cmyk";
      }
      if (layout !== undefined) patch.layout = layout;
      if (covers !== undefined) patch.covers = covers;
      if (splitSpreads !== undefined) patch.splitSpreads = splitSpreads;
      if (margin !== undefined) patch.margin = margin;
      if (dpi !== undefined) patch.dpi = dpi;
      if (pdfMode !== undefined) patch.pdfMode = pdfMode;
      if (bleed !== undefined) patch.bleed = bleed;
      if (cropMarks !== undefined) patch.cropMarks = cropMarks;
      if (colorMode !== undefined) patch.colorMode = colorMode;
      if (renderingIntent !== undefined) patch.renderingIntent = renderingIntent;
      if (arrange !== undefined) patch.arrange = arrange;
      if (numbering) {
        patch.numbering = { ...brochure.settings().numbering };
        if (start !== undefined) patch.numbering.start = Math.round(start);
        if (style !== undefined) patch.numbering.style = style;
        if (coverNumbers !== undefined) patch.numbering.covers = coverNumbers;
      }
      if (defaultMaster !== undefined) patch.defaultMaster = defaultMaster;
      if (mastersOnCovers !== undefined) patch.mastersOnCovers = mastersOnCovers;
      if (language !== undefined) patch.language = language;
      asUndoStep(engine.doc, () => brochure.setSettings(patch));
      return { settings: brochure.settings() };
    },
  },
  {
    name: "brochure_arrange",
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
    name: "brochure_pdf_export",
    description:
      "Writes the brochure as one PDF, a page per brochure page in order, each the printed " +
      "frame as its print settings say: trimmed to its size (an A4 frame trims to A4), with bleed, " +
      "crop marks, colors and pdfMode. The file goes to " +
      '"path" (absolute; .pdf is added when missing), or next to the design\'s file, named after ' +
      "it. An existing file is replaced. The PDF opens with bookmarks in the reader's sidebar " +
      "(the table of contents' entries: the sections, nested, else the pages), and every table " +
      "of contents line and page reference ({page:Name}) opens its page; CMYK (PDF/X) files keep " +
      "the bookmarks and have no links. Every page prints: a repeated section or page makes all " +
      "its rows' pages, and a repeated layer all its rows, also the ones not made in the design " +
      "yet, on a copy, so the design itself doesn't change. `updateSources` (false by default: the " +
      "data saved in the file) updates the data sources the brochure reads first, one undo step " +
      "each; if one can't be updated, nothing is exported (the ones before it stay updated). " +
      "Without it, a source whose data isn't on this device yet refuses the export: update it. A " +
      "brochure too deeply nested to make in one go fails with nothing written. Returns the path " +
      "written and the page " +
      "count.",
    inputSchema: {
      type: "object",
      required: ["brochure"],
      properties: {
        path: { type: "string", description: "Absolute path of the file to write." },
        updateSources: {
          type: "boolean",
          description: "Update the sources the brochure reads before exporting (default false).",
        },
        brochure: BROCHURE_SCHEMA,
      },
    },
    run: async (host, args) => {
      const design = requireDesign(host);
      const brochure = readBrochure(design.engine, args);
      const path = exportPath(design, "pdf", optionalString(args, "path"), "design");
      const update = optionalBoolean(args, "updateSources") ?? false;
      const { file, pages } = await exportBrochure(design.engine, brochure, {
        data: update ? "update" : "saved",
      });
      await host.writeFile(path, file);
      return { path, bytes: file.size, pages };
    },
  },
];
