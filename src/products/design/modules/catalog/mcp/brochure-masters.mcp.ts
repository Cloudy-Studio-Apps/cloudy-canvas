import { asUndoStep, optionalChoice, optionalNumber, optionalString, recordList } from "@canvas";
import { createId } from "@shared/core";

import { requireDesign, type DesignMcpTool } from "../../../mcp";
import type { BrochureSection } from "../brochure";
import { detachCopies, isPageFrame, pageItemTag } from "../model";
import { addPageItem, ADD_PAGE_ITEM_DESCRIPTION, ADD_PAGE_ITEM_SCHEMA } from "./add-page-item";
import {
  BROCHURE_SCHEMA,
  POSITION_SCHEMA,
  readBrochure,
  requirePagePosition,
} from "./brochure-args";
import { describeBrochure } from "./describe-brochure";
import { readMaster } from "./master-args";

const NUMBER_STYLES = ["arabic", "roman-lower", "roman-upper"] as const;

/** A brochure's masters (headers and footers stamped on its pages), sections and page items. */
export const brochureMasterTools: DesignMcpTool[] = [
  {
    name: "create_brochure_master",
    description:
      "Adds a master to the brochure, in one undo step: a frame for left pages and one for right " +
      "pages (the brochure's page size, transparent, above the design page's layers), named " +
      '`name` (else "A-Master", …). Layers put inside its frames (create_nodes with the frame as `parent`, ' +
      "or add_page_item) appear, locked, on every page that uses it; the first master made is " +
      "the default. Returns the master's id and its frames.",
    inputSchema: {
      type: "object",
      required: ["brochure"],
      properties: { name: { type: "string" }, brochure: BROCHURE_SCHEMA },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      const name = optionalString(args, "name");
      const id = asUndoStep(engine.doc, () => brochure.masters.add(name));
      const master = brochure.masters.list().find((item) => item.id === id);
      if (!master) throw new Error("The master couldn't be made.");
      return { master: master.id, name: master.name, left: master.left, right: master.right };
    },
  },
  {
    name: "remove_brochure_master",
    description:
      "Takes a master out of the brochure, in one undo step: its copies leave the pages, and " +
      "pages that used it show the default master. Its frames stay in the design, as ordinary " +
      "frames. Returns the brochure.",
    inputSchema: {
      type: "object",
      required: ["brochure", "master"],
      properties: { master: { type: "string" }, brochure: BROCHURE_SCHEMA },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      const master = readMaster(brochure, args);
      asUndoStep(engine.doc, () => brochure.masters.remove(master.id));
      return describeBrochure(engine, brochure);
    },
  },
  {
    name: "set_brochure_sections",
    description:
      "Replaces the brochure's sections, in one undo step. A section runs from its first page " +
      "(`startPosition`, from 1) to the next section's at its `level` or above (0, the default, a " +
      "top-level section; 1 a subsection of the section before it, and so on, any depth; a " +
      "section and its first subsection can start on the same page). Its `name` is the " +
      "`{section}` of its pages' headers (`{section:1}` adds its parent's, `{section:all}` every " +
      'parent\'s: "Tunnels › Shotcrete") and a line of the table of contents, indented by ' +
      "level; `restart` restarts the page numbers " +
      "there, and `style` (`arabic`, `roman-lower`, `roman-upper`) changes how they're written " +
      "from there on. An empty list removes them all. Returns the brochure.",
    inputSchema: {
      type: "object",
      required: ["brochure", "sections"],
      properties: {
        sections: {
          type: "array",
          items: {
            type: "object",
            required: ["name", "startPosition"],
            properties: {
              name: { type: "string" },
              startPosition: POSITION_SCHEMA,
              level: { type: "integer", minimum: 0 },
              restart: { type: "number", minimum: 0 },
              style: { enum: NUMBER_STYLES },
            },
          },
        },
        brochure: BROCHURE_SCHEMA,
      },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      const key = (start: string, level: number) => `${start}:${level}`;
      const before = new Map(
        brochure.masters.sections().map((item) => [key(item.start, item.level ?? 0), item.id]),
      );
      const starts = new Set<string>();
      const sections = recordList(args, "sections").map((entry, i): BrochureSection => {
        const name = optionalString(entry, "name")?.trim();
        if (!name) throw new Error(`sections[${i}].name is empty.`);
        const start = requirePagePosition(brochure, entry, "startPosition").slot.id;
        const level = optionalNumber(entry, "level") ?? 0;
        if (!Number.isInteger(level) || level < 0) {
          throw new Error(`sections[${i}].level must be a whole number, 0 or more.`);
        }
        if (starts.has(key(start, level))) {
          throw new Error(`Two sections of level ${level} start at sections[${i}]'s page.`);
        }
        starts.add(key(start, level));
        const restart = optionalNumber(entry, "restart");
        if (restart !== undefined && restart < 0) {
          throw new Error(`sections[${i}].restart must be 0 or more.`);
        }
        const style = optionalChoice(entry, "style", NUMBER_STYLES);
        return {
          id: before.get(key(start, level)) ?? createId(),
          name,
          start,
          ...(level === 0 ? {} : { level }),
          ...(restart === undefined ? {} : { restart: Math.round(restart) }),
          ...(style === undefined ? {} : { style }),
        };
      });
      asUndoStep(engine.doc, () => brochure.masters.setSections(sections));
      return describeBrochure(engine, brochure);
    },
  },
  {
    name: "add_page_item",
    description: ADD_PAGE_ITEM_DESCRIPTION,
    inputSchema: ADD_PAGE_ITEM_SCHEMA,
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      return { nodes: asUndoStep(engine.doc, () => addPageItem(engine, brochure, args)) };
    },
  },
  {
    name: "detach_master_layer",
    description:
      "Detaches a master layer's locked copy on a page (`node`, a layer marked `catalogCopy` in " +
      "get_nodes) in one undo step: it becomes an ordinary layer of that page, to edit there " +
      "only, and that page no longer gets that master layer. Returns how many layers were " +
      "detached (the copy and what it holds).",
    inputSchema: {
      type: "object",
      required: ["brochure", "node"],
      properties: { node: { type: "string" }, brochure: BROCHURE_SCHEMA },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const brochure = readBrochure(engine, args);
      const node = optionalString(args, "node");
      const el = node === undefined ? undefined : engine.doc.get(node);
      const tag = pageItemTag(el);
      if (!node || !tag || isPageFrame(el)) {
        throw new Error('"node" must be a master layer\'s copy on a page (see get_layer_tree).');
      }
      if (tag.brochure !== brochure.id) {
        throw new Error(`"${node}" comes from another brochure (${tag.brochure}).`);
      }
      return { detached: asUndoStep(engine.doc, () => detachCopies(engine.doc, [node])) };
    },
  },
];
