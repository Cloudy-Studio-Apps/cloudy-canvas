import { optionalChoice, optionalNumber, optionalString } from "@canvas";
import type { FontSource } from "@shared/core";

import type { DesignAgentTool } from "../../agent";

const SOURCES: readonly FontSource[] = ["installed", "google"];
const DEFAULT_LIMIT = 50;

/** The fonts texts can use, as the font picker lists them. */
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
];
