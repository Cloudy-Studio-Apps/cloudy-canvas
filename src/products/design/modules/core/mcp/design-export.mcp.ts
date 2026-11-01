import {
  bytesToBase64,
  exportPath,
  optionalChoice,
  optionalNumber,
  optionalString,
  PDF_ARG_SCHEMA,
  pdfArg,
  type ExportFormat,
} from "@canvas";
import { ToolImage } from "@shared/core";

import { optionalNodeIds, requireDesign, type DesignMcpTool } from "../../../mcp";

const FORMATS: readonly ExportFormat[] = ["png", "jpg", "webp", "svg", "pdf"];
const SVG_TEXTS = ["outlines", "live"] as const;
const BACKGROUNDS = ["solid", "transparent"] as const;
/** Keeps pictures sent to agents small enough to read. */
const VIEW_MAX_SIDE = 2000;
const IDS_SCHEMA = {
  type: "array",
  items: { type: "string" },
  description: "Layers to include, with what they hold. Omit for the whole design.",
};

export const designExportTools: DesignMcpTool[] = [
  {
    name: "export_nodes",
    description:
      "Exports the design, or some layers, to a file as the Export dialog does: png, jpg or webp (an " +
      'image), svg (vector) or pdf (one page, with the pdf options). The file goes to "path" (absolute; the extension is added when ' +
      "missing), or next to the design's file, named after it. An existing file is replaced. " +
      "Returns the path written.",
    inputSchema: {
      type: "object",
      required: ["format"],
      properties: {
        format: { enum: FORMATS },
        ids: IDS_SCHEMA,
        path: { type: "string", description: "Absolute path of the file to write." },
        background: {
          enum: BACKGROUNDS,
          description:
            "PNG, WebP, SVG and sharp PDFs: transparent or the canvas color (solid, the default).",
        },
        scale: { type: "number", description: "Pixels per world unit for images (2 by default)." },
        pdf: PDF_ARG_SCHEMA,
        text: {
          enum: SVG_TEXTS,
          description:
            "SVG only: glyph outlines that look the same anywhere (the default), or live editable text.",
        },
      },
    },
    run: async (host, args) => {
      const design = requireDesign(host);
      const format = optionalChoice(args, "format", FORMATS);
      if (!format) throw new Error(`"format" must be one of: ${FORMATS.join(", ")}.`);
      const ids = optionalNodeIds(design.engine, args);
      const path = exportPath(design, format, optionalString(args, "path"), "design");
      const file = await design.engine.exportElements({
        format,
        background: optionalChoice(args, "background", BACKGROUNDS) ?? "solid",
        area: "board",
        ids,
        scale: optionalNumber(args, "scale"),
        svgText: optionalChoice(args, "text", SVG_TEXTS),
        pdf: pdfArg(args),
      });
      await host.writeFile(path, file);
      return { path, bytes: file.size };
    },
  },
  {
    name: "view_design",
    description:
      "Returns a PNG picture of the design, or of some layers, as the user sees them, to check " +
      `how your changes look. At most ${VIEW_MAX_SIDE} pixels on its longest side.`,
    inputSchema: {
      type: "object",
      properties: {
        ids: IDS_SCHEMA,
        scale: { type: "number", description: "Pixels per world unit (1 by default)." },
      },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const png = await engine.exportElements({
        format: "png",
        background: "solid",
        area: "board",
        ids: optionalNodeIds(engine, args),
        scale: optionalNumber(args, "scale") ?? 1,
        maxSide: VIEW_MAX_SIDE,
        asShown: true,
      });
      return new ToolImage(bytesToBase64(new Uint8Array(await png.arrayBuffer())), "image/png");
    },
  },
  {
    name: "copy_nodes_as_png",
    description:
      "Copies layers (with what they hold) to the system clipboard as a PNG image with a " +
      "transparent background and no margin, as Ctrl+Shift+C does. Without ids, copies the user's selection.",
    inputSchema: {
      type: "object",
      properties: { ids: { type: "array", items: { type: "string" } } },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const ids = optionalNodeIds(engine, args);
      if (!ids && engine.selectedIds().length === 0) {
        throw new Error('Nothing is selected: pass "ids".');
      }
      await engine.copyAsPng(ids);
      return "Copied to the clipboard.";
    },
  },
];
