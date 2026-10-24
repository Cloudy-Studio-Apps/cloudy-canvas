import { optionalString, recordList, stringList, type ToolArgs } from "@canvas";
import { createId } from "@shared/core";

import type { DesignWorkspace } from "../../../design-engine.types";
import type { BrochureSlot } from "../brochure";
import {
  currentBrochure,
  DESIGN_BROCHURES,
  ensureBrochure,
  isPageFrame,
  type BrochurePage,
  type DesignBrochure,
} from "../model";

/**
 * The brochure an agent named (`brochure`, an id), else the open brochure of its design page; with
 * `create`, a page without one gets one. Throws when there's none.
 */
export function readBrochure(
  engine: DesignWorkspace,
  args: ToolArgs,
  { create = false } = {},
): DesignBrochure {
  const id = optionalString(args, "brochure");
  if (id !== undefined) {
    const named = engine.service(DESIGN_BROCHURES).get(id);
    if (!named) throw new Error(`There's no brochure with the id "${id}" (see list_brochures).`);
    return named;
  }
  if (create) return ensureBrochure(engine);
  const current = currentBrochure(engine);
  if (!current) {
    throw new Error("This design page has no brochure yet (create_brochure, or list_brochures).");
  }
  return current;
}

/** The JSON schema of the `brochure` argument every brochure tool takes. */
export const BROCHURE_SCHEMA = {
  type: "string",
  description:
    "The brochure's id (list_brochures). Default: the open brochure of your design page.",
};

/** The pages an agent gave, checked: top-level frames of the brochure's page, each in one page. */
export function readSlots(
  engine: DesignWorkspace,
  brochure: DesignBrochure,
  args: ToolArgs,
): BrochureSlot[] {
  const used = new Set<string>();
  return recordList(args, "pages").map((page, i) => {
    const frames = readPageFrames(engine, brochure, page, "frames");
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

/**
 * Frame ids an agent gave under `key`, checked to be frames at the top of the brochure's design
 * page.
 */
export function readPageFrames(
  engine: DesignWorkspace,
  brochure: DesignBrochure,
  args: ToolArgs,
  key: string,
): string[] {
  const frames = stringList(args, key);
  for (const frame of frames) {
    const el = engine.doc.get(frame);
    if (!isPageFrame(el)) {
      throw new Error(`${frame} isn't a frame at the top of a page (see list_nodes).`);
    }
    if (el.pageId !== brochure.page) {
      throw new Error(`${frame} is on another design page than the brochure "${brochure.name}".`);
    }
  }
  return frames;
}

/** The brochure page at a 1-based `position` an agent gave under `key` (see get_brochure). */
export function requirePagePosition(
  brochure: DesignBrochure,
  args: ToolArgs,
  key = "position",
): BrochurePage {
  const pages = brochure.pages();
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
