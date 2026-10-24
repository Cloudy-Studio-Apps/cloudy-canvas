import { optionalString, recordList, stringList, type ToolArgs } from "@canvas";
import { createId } from "@shared/core";

import type { DesignWorkspace } from "../../../design-engine.types";
import type { BrochureSlot } from "../brochure";
import { DESIGN_BROCHURE, isPageFrame, type BrochurePage } from "../model";

/** The pages an agent gave, checked: top-level frames, each in one page only. */
export function readSlots(engine: DesignWorkspace, args: ToolArgs): BrochureSlot[] {
  const used = new Set<string>();
  return recordList(args, "pages").map((page, i) => {
    const frames = readPageFrames(engine, page, "frames");
    const [first] = frames;
    if (first === undefined) throw new Error(`pages[${i}].frames is empty.`);
    for (const frame of frames) {
      if (used.has(frame)) throw new Error(`${frame} is in more than one page.`);
      used.add(frame);
    }
    const chosen = optionalString(page, "chosen") ?? first;
    if (!frames.includes(chosen)) throw new Error(`pages[${i}].chosen isn't one of its frames.`);
    return { id: createId(), frames, chosen };
  });
}

/** Frame ids an agent gave under `key`, checked to be frames at the top of a page. */
export function readPageFrames(engine: DesignWorkspace, args: ToolArgs, key: string): string[] {
  const frames = stringList(args, key);
  for (const frame of frames) {
    if (!isPageFrame(engine.doc.get(frame))) {
      throw new Error(`${frame} isn't a frame at the top of a page (see list_nodes).`);
    }
  }
  return frames;
}

/** The brochure page at a 1-based `position` an agent gave under `key` (see get_brochure). */
export function requirePagePosition(
  engine: DesignWorkspace,
  args: ToolArgs,
  key = "position",
): BrochurePage {
  const pages = engine.service(DESIGN_BROCHURE).pages();
  const position = args[key];
  const page = typeof position === "number" ? pages[Math.round(position) - 1] : undefined;
  if (!page) {
    throw new Error(
      `"${key}" must be a page position from 1 to ${pages.length} (see get_brochure).`,
    );
  }
  return page;
}

/** A 1-based position an agent gave under `key`, as a 0-based index within `count` places. */
export function optionalPlace(args: ToolArgs, key: string, count: number): number | undefined {
  const position = args[key];
  if (position === undefined) return undefined;
  if (typeof position !== "number" || position < 1 || position > count + 1) {
    throw new Error(`"${key}" must be a position from 1 to ${count + 1}.`);
  }
  return Math.round(position) - 1;
}

/** The JSON schema of a page position. */
export const POSITION_SCHEMA = {
  type: "number",
  minimum: 1,
  description: "A page's position in the brochure, from 1 (`position` in get_brochure).",
};
