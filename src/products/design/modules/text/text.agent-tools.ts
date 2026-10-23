import {
  asUndoStep,
  optionalChoice,
  optionalNumber,
  optionalString,
  stringArg,
  styleRuns,
} from "@canvas";
import type { FontSource } from "@shared/core";

import { requireDesign, requireNodes, type DesignAgentTool } from "../../agent";
import { readRange, readRunStyle, RUN_STYLE_PROPERTIES } from "./text-run-args";
import { textContentPatch } from "./text-rich-spec";
import type { TextNodeElement } from "./text.types";

const SOURCES: readonly FontSource[] = ["installed", "google"];
const DEFAULT_LIMIT = 50;

/** The fonts texts can use, as the font picker lists them, and styling part of a text. */
export const textTools: DesignAgentTool[] = [
  {
    name: "list_fonts",
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
    name: "style_text_range",
    description:
      "Styles part of a text layer as one undo step, as selecting characters in Figma does " +
      "(mixed styles): characters start to end (end excluded, UTF-16 indexes into its text) take " +
      "the style's fields; the rest of the text keeps its own. A text's ranges are its `runs` in " +
      "get_nodes; setting a field for the whole text (update_nodes) clears it from them.",
    inputSchema: {
      type: "object",
      required: ["id", "start", "end", "style"],
      properties: {
        id: { type: "string" },
        start: { type: "integer" },
        end: { type: "integer" },
        style: { type: "object", properties: RUN_STYLE_PROPERTIES },
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
      const style = readRunStyle(args.style, "style");
      const runs = styleRuns(text.runs, range.start, range.end, style, length);
      const patch = textContentPatch(text, text.text, runs);
      if (patch) asUndoStep(engine.doc, () => engine.doc.update(text.id, patch));
      return { id: text.id, runs: patch?.runs ?? text.runs };
    },
  },
];
