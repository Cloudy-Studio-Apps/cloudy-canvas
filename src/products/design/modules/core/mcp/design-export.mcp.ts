import {
  exportPath,
  optionalChoice,
  optionalNumber,
  optionalString,
  PDF_ARG_SCHEMA,
  pdfArg,
  type ExportFormat,
  withExportCopy,
} from "@canvas";

import { optionalNodeIds, requireDesign, type DesignMcpTool } from "../../../mcp";

const FORMATS: readonly ExportFormat[] = ["png", "jpg", "webp", "svg", "pdf"];
const SVG_TEXTS = ["outlines", "live"] as const;
const BACKGROUNDS = ["solid", "transparent"] as const;
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
      "Repeated layers export every row, also the ones past their design limit. Returns the path " +
      "written.",
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
      const background = optionalChoice(args, "background", BACKGROUNDS) ?? "solid";
      const scale = optionalNumber(args, "scale");
      const svgText = optionalChoice(args, "text", SVG_TEXTS);
      const pdf = pdfArg(args);
      // From a copy when repeats have rows past their design caps: the file gets every row.
      const file = await withExportCopy(design.engine, (workspace) =>
        workspace.exportElements({ format, background, area: "board", ids, scale, svgText, pdf }),
      );
      await host.writeFile(path, file);
      return { path, bytes: file.size };
    },
  },
];
