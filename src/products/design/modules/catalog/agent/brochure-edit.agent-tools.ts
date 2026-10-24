import {
  optionalBoolean,
  optionalChoice,
  optionalRecord,
  optionalString,
  type ToolArgs,
} from "@canvas";

import { requireDesign, type DesignAgentTool } from "../../../agent";
import type { DesignWorkspace } from "../../../design-engine.types";
import { createPresetFrame, FRAME_PRESETS, findPreset, type FrameElement } from "../../frame";
import type { DesignBrochure } from "../model";
import {
  BROCHURE_SCHEMA,
  optionalPlace,
  POSITION_SCHEMA,
  readBrochure,
  readPageFrames,
  readSlots,
  requirePagePosition,
} from "./brochure-args";
import { describeBrochure } from "./describe-brochure";

/** The paper presets a blank page can be (the frame presets' Paper group). */
const PAPER_PRESETS = FRAME_PRESETS.filter((preset) => preset.group === "Paper").map(
  (preset) => preset.id,
);

/** Changing a brochure's pages, page by page or all at once, each one undo step. */
export const brochureEditTools: DesignAgentTool[] = [
  {
    name: "set_brochure_pages",
    description:
      "Replaces the brochure's pages, in order, in one undo step. Each page lists the top-level " +
      "frames that could be it (`frames`, its options) and the one printed (`chosen`, the first " +
      "by default). Frames must be on the brochure's design page; a frame can be in one page only. " +
      "The frames themselves don't change.",
    inputSchema: {
      type: "object",
      required: ["pages"],
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
      "the page list's + does. Without `brochure`, a design page without one gets one. Returns " +
      "the brochure.",
    inputSchema: {
      type: "object",
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
      const brochure = readBrochure(engine, args, { create: true });
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
      "Moves a page (by `position`, from 1) to position `to`, as dragging it in the page list " +
      "does, in one undo step. Returns the brochure.",
    inputSchema: {
      type: "object",
      required: ["position", "to"],
      properties: { position: POSITION_SCHEMA, to: POSITION_SCHEMA, brochure: BROCHURE_SCHEMA },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      const page = requirePagePosition(brochure, args);
      const to = requirePagePosition(brochure, args, "to");
      brochure.move(page.slot.id, to.number - 1);
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
      required: ["positions"],
      properties: {
        positions: { type: "array", items: POSITION_SCHEMA },
        brochure: BROCHURE_SCHEMA,
      },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      const positions = Array.isArray(args.positions) ? args.positions : [];
      if (positions.length === 0) throw new Error('"positions" is empty.');
      const slots = positions.map((position, i) => {
        const key = `positions[${i}]`;
        return requirePagePosition(brochure, { [key]: position }, key).slot.id;
      });
      brochure.removePages(slots);
      return describeBrochure(engine, brochure);
    },
  },
  {
    name: "set_brochure_page_options",
    description:
      "Sets a page's options (`frames`, top-level frames in the order they're listed; frames " +
      "taken from other pages leave them) and the one it prints (`chosen`, the first by " +
      "default), in one undo step: adding, removing or choosing an alternative version. Returns " +
      "the brochure.",
    inputSchema: {
      type: "object",
      required: ["position", "frames"],
      properties: {
        position: POSITION_SCHEMA,
        frames: { type: "array", items: { type: "string" } },
        chosen: { type: "string" },
        brochure: BROCHURE_SCHEMA,
      },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      const page = requirePagePosition(brochure, args);
      const frames = readPageFrames(engine, brochure, args, "frames");
      if (frames.length === 0) throw new Error('"frames" is empty.');
      const chosen = optionalString(args, "chosen");
      if (chosen !== undefined && !frames.includes(chosen)) {
        throw new Error(`"chosen" isn't one of "frames".`);
      }
      brochure.setOptions(page.slot.id, frames, chosen);
      return describeBrochure(engine, brochure);
    },
  },
];

/** A new empty page frame for `add_brochure_pages`: a paper preset, or the last page's size. */
function blankFrame(
  engine: DesignWorkspace,
  brochure: DesignBrochure,
  blank: ToolArgs,
): FrameElement {
  if (engine.scope !== brochure.page) {
    throw new Error("Blank pages are added on your design page: switch_page to the brochure's.");
  }
  const presetId = optionalChoice(blank, "preset", PAPER_PRESETS);
  const preset = presetId === undefined ? undefined : findPreset(presetId);
  const last = brochure.pages().at(-1)?.frame;
  const size = preset?.size ?? (last ? { w: last.w, h: last.h } : findPreset("a4")?.size);
  if (!size) throw new Error('Give "blank.preset".');
  const landscape = preset !== undefined && optionalBoolean(blank, "landscape") === true;
  const label = `${preset?.label ?? "Page"}${landscape ? " landscape" : ""}`;
  const shaped = landscape ? { w: Math.max(size.w, size.h), h: Math.min(size.w, size.h) } : size;
  const page = { id: "brochure-page", group: "Paper", label, size: shaped };
  return createPresetFrame(page, engine.doc, engine.elements());
}
