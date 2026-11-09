import {
  exportPath,
  optionalChoice,
  optionalNumber,
  optionalString,
  PDF_ARG_SCHEMA,
  pdfArg,
  type ExportFormat,
} from "@canvas";

import { optionalShapeIds, requireBoard } from "../../../mcp/board-access";
import type { BoardMcpTool } from "../../../mcp/board-mcp.types";

const FORMATS: readonly ExportFormat[] = ["png", "jpg", "webp", "svg", "pdf", "csv"];
const SVG_TEXTS = ["outlines", "live"] as const;
const BACKGROUNDS = ["solid", "transparent"] as const;
const IDS_SCHEMA = {
  type: "array",
  items: { type: "string" },
  description: "Shapes to include, with what moves with them. Omit for the whole board.",
};

export const exportTools: BoardMcpTool[] = [
  {
    name: "export_shapes",
    description:
      "Exports the board, or some shapes, to a file as the Export dialog does: png, jpg or webp (an " +
      "image), svg (vector), pdf (one page, with the pdf options) or csv (the tables' and database tables' cells). The file goes to " +
      '"path" (absolute; the extension is added when missing), or next to the board\'s file, ' +
      "named after the board. An existing file is replaced. Returns the path written.",
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
      const board = requireBoard(host);
      const format = optionalChoice(args, "format", FORMATS);
      if (!format) throw new Error(`"format" must be one of: ${FORMATS.join(", ")}.`);
      const ids = optionalShapeIds(board.engine, args);
      const path = exportPath(board, format, optionalString(args, "path"), "board");
      const file = await board.engine.exportElements({
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
];
