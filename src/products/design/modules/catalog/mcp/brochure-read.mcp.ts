import { bytesToBase64, optionalNumber } from "@canvas";
import { ToolImage } from "@shared/core";

import { requireDesign, type DesignMcpTool } from "../../../mcp";
import { isPlaceholderPaint } from "../../core";
import { checkBrochure, effectiveDpi, LOW_DPI, pictureSize } from "../checks";
import { drawBrochureSheet } from "../export";
import { brochurePageSize, pagePictures, spanOf } from "../model";
import {
  BROCHURE_SCHEMA,
  POSITION_SCHEMA,
  readBrochure,
  requirePagePosition,
} from "./brochure-args";
import { describeBrochure } from "./describe-brochure";
import { pageItemsIn } from "./page-item-summary";

/** Keeps pictures sent to agents small enough to read. */
const VIEW_MAX_SIDE = 2000;

/** Reading a brochure: all of it, one page with its pictures, or how it looks as it's read. */
export const brochureReadTools: DesignMcpTool[] = [
  {
    name: "brochure_get",
    description:
      "A brochure (the Catalog mode; each belongs to one design page, which can hold several: " +
      "catalog_brochures_list): its id, name, design page and the page's other brochures; its pages in " +
      "order, each printing one top-level frame (`frame`) chosen among its options (other frames " +
      'kept as alternatives), with its page numbers (`number`, "6–7" for a spread frame: `span` ' +
      "2, twice the page's width); the blank pages the layout adds, the printed page count, the " +
      "spreads as they're read (printed page numbers), the print settings (layout, covers, " +
      "splitSpreads, margin in mm, dpi), the page size, and the print issues by `kind` " +
      "(placeholder: an image placeholder still to replace, low-resolution pictures, text in " +
      "the margin, hidden pages, blank pages added, frames of another size, CMYK with no print " +
      "profile, layers stopping at the page edge with no bleed, rounded pages, a table of " +
      "contents past the bottom margin (toc-overflow), a page reference naming no section or page " +
      "(page-ref-missing), data that doesn't fit (data), a repeat with nothing to print " +
      "(empty-source), a repeat with pages taken out and no key, so they follow row positions " +
      "(unkeyed-detach), over 1,000 pages (too-many-pages)). Pages a repeat made are marked " +
      "`generated`, ones taken out of a repeat `detached`, pages a repeat will make at export " +
      "`pending` (no `frame` yet, `template` is the page they copy; counted in `pendingPages`), " +
      "and `repeats` lists each repeating section or page with its settings and pending count " +
      "(catalog_repeat_set). Each master lists its own `pageItems` (template and target).",
    inputSchema: {
      type: "object",
      required: ["brochure"],
      properties: { brochure: BROCHURE_SCHEMA },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      return describeBrochure(engine, readBrochure(engine, args));
    },
  },
  {
    name: "page_get",
    description:
      "One brochure page (by `position`, from 1): its printed frame, page numbers, span and " +
      "options, every picture on it (the layer, which of its fills, the assetId, the " +
      "picture's pixel size, its dpi at print size and whether that's low, or `placeholder: true` " +
      "for an image placeholder waiting for its picture; image_replace swaps one), its page " +
      "items (`pageItems`: the text shown, its `template`, a page reference's `target`, and on a " +
      "master's copy `fromMaster`, the master layer to change instead; catalog_page_item_set changes " +
      "them) and its print issues.",
    inputSchema: {
      type: "object",
      required: ["brochure", "position"],
      properties: { position: POSITION_SCHEMA, brochure: BROCHURE_SCHEMA },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      const page = requirePagePosition(brochure, args);
      const pages = brochure.pages();
      const size = brochurePageSize(pages);
      const { frame } = page;
      const pictures = await Promise.all(
        pagePictures(engine.doc.all(), frame.id).map(async ({ node, fill, paint }) => {
          if (isPlaceholderPaint(paint)) {
            return {
              node: node.id,
              name: node.name,
              fill,
              assetId: paint.assetId,
              placeholder: true,
            };
          }
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
      const issues = (await checkBrochure(engine, brochure))
        .filter((issue) => issue.frameId === frame.id)
        .map(({ kind, nodeId, message }) => ({ kind, node: nodeId, message }));
      return {
        position: pages.indexOf(page) + 1,
        number: brochure.layout().labels.get(page.slot.id) ?? String(page.number),
        frame: frame.id,
        name: frame.name,
        span: size ? spanOf(frame, size) : 1,
        options: page.options.map((option) => ({ id: option.id, name: option.name })),
        pictures,
        pageItems: pageItemsIn(frame.id, engine.doc.all()),
        issues,
      };
    },
  },
  {
    name: "brochure_view",
    description:
      "Returns a PNG of the brochure as it's read, to check its pages and order: with " +
      "`position`, the spread holding that page (covers alone on their side, a spread frame's " +
      "halves across the spine, blank pages as paper); without, every spread in rows with its page " +
      `numbers under it. At most ${VIEW_MAX_SIDE} pixels on its longest side.`,
    inputSchema: {
      type: "object",
      required: ["brochure"],
      properties: {
        position: POSITION_SCHEMA,
        brochure: BROCHURE_SCHEMA,
        maxSide: {
          type: "number",
          description: `Longest side in pixels (${VIEW_MAX_SIDE} at most).`,
        },
      },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      const layout = brochure.layout();
      let spreads = layout.spreads.map((_, i) => i);
      if (args.position !== undefined) {
        const slot = requirePagePosition(brochure, args).slot.id;
        spreads = spreads.filter((spread) =>
          (layout.spreads[spread] ?? []).some((index) => {
            const side = layout.sides[index];
            return side?.kind === "page" && side.page.slot.id === slot;
          }),
        );
      }
      const maxSide = Math.min(optionalNumber(args, "maxSide") ?? VIEW_MAX_SIDE, VIEW_MAX_SIDE);
      const png = await drawBrochureSheet(engine, brochure, { spreads, maxSide });
      return new ToolImage(bytesToBase64(new Uint8Array(await png.arrayBuffer())), "image/png");
    },
  },
];
