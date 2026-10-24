import { optionalString, stringArg, type ToolArgs } from "@canvas";

import { requireDesign, type DesignAgentTool } from "../../../agent";
import type { DesignWorkspace } from "../../../design-engine.types";
import { DESIGN_PAGES } from "../../pages";
import { DESIGN_BROCHURES } from "../model";
import { BROCHURE_SCHEMA, readBrochure } from "./brochure-args";
import { describeBrochure } from "./describe-brochure";

const PAGE_SCHEMA = {
  type: "string",
  description: "A design page's id (list_pages). Default: your design page.",
};

/** Listing a design page's brochures, and making, renaming and deleting them. */
export const brochureListTools: DesignAgentTool[] = [
  {
    name: "list_brochures",
    description:
      "The brochures of a design page (each belongs to one page and uses only its top-level " +
      "frames; a page can hold several): id, name, page count and whether it's the one open in " +
      "the Catalog mode (the default of every brochure tool).",
    inputSchema: { type: "object", properties: { page: PAGE_SCHEMA } },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const page = readPage(engine, args);
      const brochures = engine.service(DESIGN_BROCHURES);
      const open = brochures.current(page)?.id;
      return {
        designPage: page,
        brochures: brochures.list(page).map((brochure) => ({
          id: brochure.id,
          name: brochure.name,
          pages: brochure.pages().length,
          open: brochure.id === open,
        })),
      };
    },
  },
  {
    name: "create_brochure",
    description:
      'Adds an empty brochure to a design page (named `name`, or "Brochure N"), in one undo ' +
      "step. It's opened when the page had none. Fill it with add_brochure_pages or " +
      "set_brochure_pages (giving its `brochure` id). Returns it.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string" }, page: PAGE_SCHEMA },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const page = readPage(engine, args);
      const brochures = engine.service(DESIGN_BROCHURES);
      const first = brochures.list(page).length === 0;
      const brochure = brochures.create(page, optionalString(args, "name"), first);
      return describeBrochure(engine, brochure);
    },
  },
  {
    name: "rename_brochure",
    description: "Renames a brochure, in one undo step.",
    inputSchema: {
      type: "object",
      required: ["name"],
      properties: { name: { type: "string" }, brochure: BROCHURE_SCHEMA },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      engine.service(DESIGN_BROCHURES).rename(brochure.id, stringArg(args, "name"));
      return { id: brochure.id, name: brochure.name };
    },
  },
  {
    name: "duplicate_brochure",
    description:
      'Copies a brochure (its pages, options and settings; the frames are shared) as "<name> ' +
      'copy" on the same design page, in one undo step, e.g. to try another order. Returns it.',
    inputSchema: { type: "object", properties: { brochure: BROCHURE_SCHEMA } },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      return describeBrochure(engine, engine.service(DESIGN_BROCHURES).duplicate(brochure.id));
    },
  },
  {
    name: "delete_brochure",
    description:
      "Deletes a brochure, in one undo step. Its frames stay in the design. Give `brochure` " +
      "explicitly.",
    inputSchema: {
      type: "object",
      required: ["brochure"],
      properties: { brochure: BROCHURE_SCHEMA },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      engine.service(DESIGN_BROCHURES).remove(brochure.id);
      return { deleted: brochure.id };
    },
  },
];

/** The design page an agent named (`page`), else its own. */
function readPage(engine: DesignWorkspace, args: ToolArgs): string {
  const id = optionalString(args, "page") ?? engine.scope;
  if (id === null || !engine.service(DESIGN_PAGES).page(id)) {
    throw new Error(`There's no design page "${id ?? ""}" (see list_pages).`);
  }
  return id;
}
