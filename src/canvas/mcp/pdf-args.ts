import type { PdfExportOptions } from "../export";
import type { ToolArgs } from "./mcp-tool.types";
import { optionalChoice, optionalNumber, optionalRecord } from "./tool-args";

const MODES = ["sharp", "flattened"] as const;
const TEXTS = ["selectable", "outlines"] as const;
const QUALITIES = ["high", "balanced", "small"] as const;
const PAGES = ["fit", "a4", "letter", "a3"] as const;
const ORIENTATIONS = ["auto", "portrait", "landscape"] as const;
const DPIS = [300, 150, 96] as const;

/** The `pdf` argument of agents' export tools: the Export dialog's PDF options. */
export const PDF_ARG_SCHEMA = {
  type: "object",
  description: "PDF only. Everything is optional.",
  properties: {
    mode: {
      enum: MODES,
      description:
        "sharp keeps shapes and text as vectors (the default); flattened is one picture.",
    },
    text: { enum: TEXTS, description: "Sharp only: selectable (the default) or outlines." },
    imageQuality: { enum: QUALITIES },
    dpi: { enum: DPIS, description: "Of pictures, and of the whole page when flattened." },
    page: { enum: PAGES, description: "fit sizes the page to the content (the default)." },
    orientation: { enum: ORIENTATIONS },
    margin: { type: "number", description: "Millimeters, on a paper size." },
  },
};

/** The `pdf` argument, checked. */
export function pdfArg(args: ToolArgs): Partial<PdfExportOptions> {
  const pdf = optionalRecord(args, "pdf");
  if (!pdf) return {};
  const dpi = optionalNumber(pdf, "dpi");
  const known = DPIS.find((value) => value === dpi);
  if (dpi !== undefined && known === undefined) {
    throw new Error(`"pdf.dpi" must be one of: ${DPIS.join(", ")}.`);
  }
  const margin = optionalNumber(pdf, "margin");
  if (margin !== undefined && margin < 0) throw new Error(`"pdf.margin" can't be negative.`);
  const options: Partial<PdfExportOptions> = {
    mode: optionalChoice(pdf, "mode", MODES),
    text: optionalChoice(pdf, "text", TEXTS),
    imageQuality: optionalChoice(pdf, "imageQuality", QUALITIES),
    dpi: known,
    page: optionalChoice(pdf, "page", PAGES),
    orientation: optionalChoice(pdf, "orientation", ORIENTATIONS),
    margin,
  };
  return Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined));
}
