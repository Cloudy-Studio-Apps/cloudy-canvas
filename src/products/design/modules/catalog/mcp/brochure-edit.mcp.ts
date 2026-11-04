import { asUndoStep, optionalRecord, optionalString } from "@canvas";

import { requireDesign, type DesignMcpTool } from "../../../mcp";
import { blankFrame, PAPER_PRESETS } from "./blank-frame";
import {
  BROCHURE_SCHEMA,
  optionalPlace,
  POSITION_SCHEMA,
  readBrochure,
  readPageFrames,
  readSlots,
  readPositions,
  requirePagePosition,
} from "./brochure-args";
import { describeBrochure } from "./describe-brochure";
import { PAGE_MASTER_SCHEMA, readPageMaster } from "./master-args";

/** Changing a brochure's pages, page by page or all at once, each one undo step. */
export const brochureEditTools: DesignMcpTool[] = [
  {
    name: "set_brochure_pages",
    description:
      "Replaces the brochure's pages, in order, in one undo step. Each page lists the top-level " +
      "frames that could be it (`frames`, its options) and the one printed (`chosen`, the first " +
      "by default). Frames must be on the brochure's design page; a frame can be in one page only. " +
      "The frames themselves don't change.",
    inputSchema: {
      type: "object",
      required: ["brochure", "pages"],
      properties: {
        pages: {
          type: "array",
          items: {
            type: "object",
            required: ["frames"],
            properties: {
              frames: { type: "array", items: { type: "string" } },
              chosen: { type: "string" },
            },
          },
        },
        brochure: BROCHURE_SCHEMA,
      },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      brochure.setSlots(readSlots(engine, brochure, args));
      return describeBrochure(engine, brochure);
    },
  },
  {
    name: "add_brochure_pages",
    description:
      "Adds pages to the brochure at `at` (a page position from 1; the end by default), in one " +
      "undo step: `frames` (top-level frames not in it yet, in the order given; frames already " +
      "in it are skipped), or `blank`, a new empty frame of a paper size (`preset`, " +
      "`landscape`; by default the last page's size) placed right of your page's content, as " +
      "the page list's + does. Returns the brochure.",
    inputSchema: {
      type: "object",
      required: ["brochure"],
      properties: {
        frames: { type: "array", items: { type: "string" } },
        blank: {
          type: "object",
          properties: {
            preset: { enum: PAPER_PRESETS },
            landscape: { type: "boolean", description: "Wider than tall (presets only)." },
          },
        },
        at: POSITION_SCHEMA,
        brochure: BROCHURE_SCHEMA,
      },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      const at = optionalPlace(args, "at", brochure.pages().length);
      const blank = optionalRecord(args, "blank");
      if (blank) {
        brochure.addNewPage(blankFrame(engine, brochure, blank), at);
      } else {
        const frames = readPageFrames(engine, brochure, args, "frames");
        if (frames.length === 0) throw new Error('Give "frames" or "blank".');
        brochure.addPages(frames, at);
      }
      return describeBrochure(engine, brochure);
    },
  },
  {
    name: "move_brochure_page",
    description:
      "Moves a page (by `position`, from 1), or several (`positions`, kept in the brochure's " +
      "order and moved together), so the first starts at position `to`, as dragging them in the " +
      "page list does, in one undo step. Returns the brochure.",
    inputSchema: {
      type: "object",
      required: ["brochure", "to"],
      properties: {
        position: POSITION_SCHEMA,
        positions: { type: "array", items: POSITION_SCHEMA },
        to: POSITION_SCHEMA,
        brochure: BROCHURE_SCHEMA,
      },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      const slots = Array.isArray(args.positions)
        ? readPositions(brochure, args.positions)
        : [requirePagePosition(brochure, args).slot.id];
      const room = brochure.pages().length - slots.length + 1;
      const to = args.to;
      if (typeof to !== "number" || to < 1 || to > room) {
        throw new Error(`"to" must be a position from 1 to ${room}.`);
      }
      asUndoStep(engine.doc, () => brochure.moveMany(slots, Math.round(to) - 1));
      return describeBrochure(engine, brochure);
    },
  },
  {
    name: "remove_brochure_pages",
    description:
      "Takes pages (by `positions`, from 1) out of the brochure with their options, in one undo " +
      "step. Their frames stay in the design. Returns the brochure.",
    inputSchema: {
      type: "object",
      required: ["brochure", "positions"],
      properties: {
        positions: { type: "array", items: POSITION_SCHEMA },
        brochure: BROCHURE_SCHEMA,
      },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      const slots = readPositions(brochure, Array.isArray(args.positions) ? args.positions : []);
      asUndoStep(engine.doc, () => brochure.removePages(slots));
      return describeBrochure(engine, brochure);
    },
  },
  {
    name: "set_brochure_page_options",
    description:
      "Sets a page's options (`frames`, top-level frames in the order they're listed; frames " +
      "taken from other pages leave them) and the one it prints (`chosen`, the first by " +
      "default), and the master it shows (`master`), in one undo step: adding, removing or " +
      "choosing an alternative version. Give `frames` or `master`, or both. Returns the brochure.",
    inputSchema: {
      type: "object",
      required: ["brochure", "position"],
      properties: {
        position: POSITION_SCHEMA,
        frames: { type: "array", items: { type: "string" } },
        chosen: { type: "string" },
        master: PAGE_MASTER_SCHEMA,
        brochure: BROCHURE_SCHEMA,
      },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      const page = requirePagePosition(brochure, args);
      const master = readPageMaster(brochure, args);
      const frames = "frames" in args ? readPageFrames(engine, brochure, args, "frames") : null;
      if (frames?.length === 0) throw new Error('"frames" is empty.');
      if (!frames && !master.given) throw new Error('Give "frames" or "master".');
      const chosen = optionalString(args, "chosen");
      if (chosen !== undefined && !frames?.includes(chosen)) {
        throw new Error(`"chosen" isn't one of "frames".`);
      }
      asUndoStep(engine.doc, () => {
        if (frames) brochure.setOptions(page.slot.id, frames, chosen);
        if (master.given) brochure.masters.setPageMaster([page.slot.id], master.master);
      });
      return describeBrochure(engine, brochure);
    },
  },
];
