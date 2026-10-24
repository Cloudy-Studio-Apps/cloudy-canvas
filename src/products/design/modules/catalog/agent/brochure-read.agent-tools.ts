import { bytesToBase64, optionalNumber } from "@canvas";
import { ToolImage } from "@shared/core";

import { requireDesign, type DesignAgentTool } from "../../../agent";
import { checkBrochure, effectiveDpi, LOW_DPI, pictureSize } from "../checks";
import { drawBrochureSheet } from "../export";
import { brochurePageSize, DESIGN_BROCHURE, pagePictures, spanOf } from "../model";
import { POSITION_SCHEMA, requirePagePosition } from "./brochure-args";
import { describeBrochure } from "./describe-brochure";

/** Keeps pictures sent to agents small enough to read. */
const VIEW_MAX_SIDE = 2000;

/** Reading the brochure: all of it, one page with its pictures, or how it looks as it's read. */
export const brochureReadTools: DesignAgentTool[] = [
  {
    name: "get_brochure",
    description:
      "The design's brochure (the Catalog mode): its pages in order, each printing one top-level " +
      "frame (`frame`) chosen among its options (other frames kept as alternatives), with its " +
      'page numbers (`number`, "6–7" for a spread frame: `span` 2, twice the page\'s width) ' +
      "and the design page it's on; the blank pages the layout adds, the printed page count, the " +
      "spreads as they're read (printed page numbers), the print settings (layout, covers, " +
      "splitSpreads, margin in mm, dpi), the page size, and the print issues (low-resolution " +
      "pictures, text in the margin, hidden pages, blank pages added, frames of another size).",
    inputSchema: { type: "object", properties: {} },
    run: async (host) => describeBrochure(requireDesign(host).engine),
  },
  {
    name: "get_brochure_page",
    description:
      "One brochure page (by `position`, from 1): its printed frame, page numbers, span, design " +
      "page and options, every picture on it (the layer, which of its fills, the assetId, the " +
      "picture's pixel size, its dpi at print size and whether that's low; replace_image swaps " +
      "one) and its print issues.",
    inputSchema: {
      type: "object",
      required: ["position"],
      properties: { position: POSITION_SCHEMA },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const page = requirePagePosition(engine, args);
      const brochure = engine.service(DESIGN_BROCHURE);
      const pages = brochure.pages();
      const size = brochurePageSize(pages);
      const { frame } = page;
      const pictures = await Promise.all(
        pagePictures(engine.doc.all(), frame.id).map(async ({ node, fill, paint }) => {
          const pixels = await pictureSize(engine.doc, paint.assetId);
          const dpi = pixels && Math.round(effectiveDpi(paint, node, pixels));
          return {
            node: node.id,
            name: node.name,
            fill,
            assetId: paint.assetId,
            scaleMode: paint.scaleMode,
            pixels,
            dpi,
            lowResolution: dpi !== null && dpi < LOW_DPI,
          };
        }),
      );
      const issues = (await checkBrochure(engine))
        .filter((issue) => issue.frameId === frame.id)
        .map(({ nodeId, message }) => ({ node: nodeId, message }));
      return {
        position: pages.indexOf(page) + 1,
        number: brochure.layout().labels.get(page.slot.id) ?? String(page.number),
        frame: frame.id,
        name: frame.name,
        designPage: frame.pageId,
        span: size ? spanOf(frame, size) : 1,
        options: page.options.map((option) => ({ id: option.id, name: option.name })),
        pictures,
        issues,
      };
    },
  },
  {
    name: "view_brochure",
    description:
      "Returns a PNG of the brochure as it's read, to check its pages and order: with " +
      "`position`, the spread holding that page (covers alone on their side, a spread frame's " +
      "halves across the spine, blank pages as paper); without, every spread in rows with its page " +
      `numbers under it. At most ${VIEW_MAX_SIDE} pixels on its longest side.`,
    inputSchema: {
      type: "object",
      properties: {
        position: POSITION_SCHEMA,
        maxSide: {
          type: "number",
          description: `Longest side in pixels (${VIEW_MAX_SIDE} at most).`,
        },
      },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const layout = engine.service(DESIGN_BROCHURE).layout();
      let spreads = layout.spreads.map((_, i) => i);
      if (args.position !== undefined) {
        const slot = requirePagePosition(engine, args).slot.id;
        spreads = spreads.filter((spread) =>
          (layout.spreads[spread] ?? []).some((index) => {
            const side = layout.sides[index];
            return side?.kind === "page" && side.page.slot.id === slot;
          }),
        );
      }
      const maxSide = Math.min(optionalNumber(args, "maxSide") ?? VIEW_MAX_SIDE, VIEW_MAX_SIDE);
      const png = await drawBrochureSheet(engine, { spreads, maxSide });
      return new ToolImage(bytesToBase64(new Uint8Array(await png.arrayBuffer())), "image/png");
    },
  },
];
