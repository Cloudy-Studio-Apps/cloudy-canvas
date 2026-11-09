import { asUndoStep, optionalNumber, optionalString, type ToolArgs } from "@canvas";

import { requireDesign, type DesignMcpTool } from "../../../mcp";
import { readRepeatArgs } from "../../data";
import type { BrochureRepeat, DesignBrochure, RepeatTarget } from "../model";
import {
  BROCHURE_SCHEMA,
  POSITION_SCHEMA,
  readBrochure,
  requirePagePosition,
} from "./brochure-args";
import { describeRepeats } from "./describe-repeats";

const NOTE =
  "A section (`section`, its id from catalog_brochure_get) repeats its pages, subsections included, for " +
  "each row of a list, or a page (`position`) repeats for each row or each `perPage` rows. " +
  "`source` is an expression read in the scope of the repeats around it (`products`, " +
  "`category.products`); inside, the row is `as` (`item` by default; with perPage above 1 it " +
  "is the page's list, `item[]`). Design the pages with data_bind first. While designing, the " +
  "first `designLimit` copies are made (3 when unset) and the rest are pending pages, counted " +
  "in numbers and the table of contents and made at export.";

const TARGET = {
  section: { type: "string", description: "The section's id (catalog_brochure_get `sections`)." },
  position: POSITION_SCHEMA,
};

/** The section or page an agent named, exactly one of `section` / `position`. */
function readTarget(brochure: DesignBrochure, args: ToolArgs): RepeatTarget {
  const section = optionalString(args, "section");
  if (section !== undefined && args.position !== undefined) {
    throw new Error('Give "section" or "position", not both.');
  }
  if (section !== undefined) {
    if (!brochure.record()?.sections.some((item) => item.id === section)) {
      throw new Error(`There's no section with the id "${section}" (see catalog_brochure_get).`);
    }
    return { section };
  }
  if (args.position === undefined) throw new Error('Give "section" or "position".');
  return { slot: requirePagePosition(brochure, args).slot.id };
}

/** `perPage`: a whole number from 1, or null for the default. */
function readPerPage(args: ToolArgs): number | null | undefined {
  if (args.perPage === undefined || args.perPage === null) return args.perPage;
  const value = optionalNumber(args, "perPage");
  if (value === undefined || !Number.isInteger(value) || value < 1) {
    throw new Error('"perPage" must be a whole number of 1 or more, or null.');
  }
  return value;
}

/** Repeating sections and pages of a brochure over a list of data. */
export const brochureRepeatTools: DesignMcpTool[] = [
  {
    name: "repeat_set",
    description:
      `Makes a brochure section or page repeat for each row of a data list, or changes its ` +
      `repeat, in one undo step. ${NOTE} Only what you pass changes (null clears key, limit, ` +
      "designLimit, previewRow and perPage); `source` is required the first time. `filter` is " +
      "[{ path, op: exists|empty|eq|neq|gt|lt|contains, value? }], `sort` [{ path, descending? }]. " +
      "Pages a repeat made can't repeat themselves. Returns the brochure's repeats with what " +
      "each made and its pending pages.",
    inputSchema: {
      type: "object",
      required: ["brochure"],
      properties: {
        brochure: BROCHURE_SCHEMA,
        ...TARGET,
        source: { type: "string", description: "The list to repeat for: `products`." },
        as: { type: "string", description: "The row's name inside, `item` by default." },
        key: { type: ["string", "null"], description: "A path in the row giving its identity." },
        perPage: {
          type: ["number", "null"],
          description: "Pages only: rows on each page (1 when unset).",
        },
        filter: { type: "array", description: "Rows must satisfy all of these." },
        sort: { type: "array", description: "Rows in this order." },
        limit: { type: ["number", "null"], description: "Most rows used everywhere." },
        designLimit: {
          type: ["number", "null"],
          description: "Most copies made while designing (3 when unset); the export makes all.",
        },
        previewRow: {
          type: ["number", "null"],
          description: "The row the template pages show while designing (0 when unset).",
        },
      },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      const target = readTarget(brochure, args);
      if (args.template !== undefined) throw new Error("A brochure repeat takes no template.");
      const { repeat: read } = readRepeatArgs(args);
      const perPage = readPerPage(args);
      if (perPage !== undefined && "section" in target) {
        throw new Error('"perPage" is for pages: a section takes one row per copy.');
      }
      const repeat: Partial<BrochureRepeat> = { ...read };
      if (perPage !== undefined) repeat.perPage = perPage === null ? undefined : perPage;
      asUndoStep(engine.doc, () => brochure.setRepeat(target, repeat));
      return { brochure: brochure.id, repeats: describeRepeats(brochure) };
    },
  },
  {
    name: "repeat_remove",
    description:
      "Stops a brochure section or page repeating, in one undo step: the pages it made go and " +
      "the template pages stay as normal pages (undo brings the copies back). Give `section` or " +
      "`position`. Returns the brochure's remaining repeats.",
    inputSchema: {
      type: "object",
      required: ["brochure"],
      properties: { brochure: BROCHURE_SCHEMA, ...TARGET },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      const target = readTarget(brochure, args);
      asUndoStep(engine.doc, () => brochure.setRepeat(target, null));
      return { brochure: brochure.id, repeats: describeRepeats(brochure) };
    },
  },
];
