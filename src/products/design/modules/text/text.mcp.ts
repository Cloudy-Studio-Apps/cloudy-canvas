import {
  asUndoStep,
  DOCUMENT_TOKENS,
  optionalChoice,
  optionalNumber,
  optionalString,
  stringArg,
  styleRuns,
} from "@canvas";
import type { FontSource } from "@shared/core";

import { requireDesign, requireNodes, type DesignMcpTool } from "../../mcp";
import { readRange, readRunStyle, RUN_STYLE_PROPERTIES } from "./text-run-args";
import { runStylePatch, unstyledRangePatch } from "./apply-run-style";
import { TEXT_STYLE } from "./text-style";
import { textContentPatch } from "./text-rich-spec";
import { templateOf } from "./text-template";
import type { TextTemplates } from "./text.points.types";
import type { TextNodeElement, TextRunStyle } from "./text.types";
import type { DesignWorkspace } from "../../design-engine.types";

const SOURCES: readonly FontSource[] = ["installed", "google"];

/** A range's text style as an agent names it: its fields and id, `undefined` to unlink, or none. */
function rangeTextStyle(engine: DesignWorkspace, ref: unknown): Partial<TextRunStyle> {
  if (ref === undefined) return {};
  if (ref === null) return { textStyle: undefined };
  if (typeof ref !== "string") throw new Error('"textStyle" is a text style\'s id or name.');
  const style = engine.service(DOCUMENT_TOKENS).store().findStyle(ref);
  if (!style || style.styleType !== TEXT_STYLE) {
    throw new Error(`No text style "${ref}". Call variables_styles_list for the names and ids.`);
  }
  return runStylePatch(style.id, style.value);
}
const DEFAULT_LIMIT = 50;

/**
 * The fonts texts can use, as the font picker lists them, and styling part of a text. A text
 * edited through a template (`templates`) is styled only as a whole here.
 */
export const textTools = (templates: TextTemplates): DesignMcpTool[] => [
  {
    name: "fonts_list",
    description:
      "Font families texts can use (a text's fontFamily), as the font picker lists them: installed " +
      "ones first, then Google Fonts (downloaded when a text uses them). Each has its source, " +
      'category and faces ("400", "700 italic", …: fontWeight and fontStyle). Search by name.',
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Only families whose name contains this." },
        source: { enum: SOURCES },
        limit: { type: "number", description: `At most this many (${DEFAULT_LIMIT} by default).` },
      },
    },
    run: async (host, args) => {
      const search = optionalString(args, "search")?.toLowerCase();
      const source = optionalChoice(args, "source", SOURCES);
      const limit = optionalNumber(args, "limit") ?? DEFAULT_LIMIT;
      const families = await host.fontFamilies();
      const matching = families.filter(
        (font) =>
          (!search || font.family.toLowerCase().includes(search)) &&
          (!source || font.source === source),
      );
      return {
        total: matching.length,
        families: matching.slice(0, Math.max(0, limit)).map((font) => ({
          family: font.family,
          source: font.source,
          ...(font.category ? { category: font.category } : {}),
          faces: font.variants.map((v) => (v.style === "italic" ? `${v.weight} italic` : v.weight)),
        })),
      };
    },
  },
  {
    name: "range_style",
    description:
      "Styles part of a text layer as one undo step, as selecting characters in Figma does " +
      "(mixed styles): characters start to end (end excluded, UTF-16 indexes into its text) take " +
      "the style's fields; the rest of the text keeps its own. A text's ranges are its `runs` in " +
      "nodes_get; setting a field for the whole text (nodes_update) clears it from them. " +
      "`textStyle` (a text style's id or name from variables_styles_list, or null) gives the range that " +
      "style: it follows the style's changes until its typography is set by hand. A text bound " +
      "to data can only be styled whole here.",
    inputSchema: {
      type: "object",
      required: ["id", "start", "end"],
      properties: {
        id: { type: "string" },
        start: { type: "integer" },
        end: { type: "integer" },
        style: { type: "object", properties: RUN_STYLE_PROPERTIES },
        textStyle: { type: ["string", "null"] },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const [id] = requireNodes(engine, [stringArg(args, "id")]);
      const el = engine.getElement(id!);
      if (el?.type !== "text") throw new Error(`Layer ${id} isn't a text.`);
      const text = el as TextNodeElement;
      const length = text.text.length;
      const range = readRange(args.start, args.end, length, "range");
      // Its shown ranges come from the template; only a whole-text style carries over to it.
      if (templateOf(templates, text) && (range.start > 0 || range.end < length)) {
        throw new Error(
          `Layer ${text.id} is a bound text: style a bound text's ranges while editing its ` +
            `template, or style the whole text (start 0, end ${length}).`,
        );
      }
      const own = args.style === undefined ? {} : readRunStyle(args.style, "style");
      const style = { ...unstyledRangePatch(own), ...rangeTextStyle(engine, args.textStyle) };
      if (Object.keys(style).length === 0) throw new Error('Give "style" or "textStyle".');
      const runs = styleRuns(text.runs, range.start, range.end, style, length);
      const patch = textContentPatch(text, text.text, runs);
      if (patch) asUndoStep(engine.doc, () => engine.doc.update(text.id, patch));
      return { id: text.id, runs: patch?.runs ?? text.runs };
    },
  },
];
