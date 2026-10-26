import { optionalBoolean, optionalNumber, optionalString, stringArg, stringList } from "@canvas";

import { requireDesign, requireNodes, type DesignMcpTool } from "../../../mcp";
import type { DesignWorkspace } from "../../../design-engine.types";
import { DESIGN_PAGES } from "../design-pages";

const PAGE_ID = { type: "string", description: "The page's id (from list_pages)." };

/** The pages with what agents need to pick one. */
function listPages(engine: DesignWorkspace) {
  const pages = engine.service(DESIGN_PAGES);
  return pages.pages().map((page, position) => ({
    id: page.id,
    name: page.name,
    position,
    current: page.id === engine.scope,
    layers: pages.nodes(page.id).length,
  }));
}

/** A page id of the design, checked. */
function requirePage(engine: DesignWorkspace, id: string): string {
  if (!engine.service(DESIGN_PAGES).page(id)) {
    throw new Error(`No page with id ${id}. Call list_pages for the ids.`);
  }
  return id;
}

/** Pages, as the Pages list of the Layers tab works with them. */
export const pagesTools: DesignMcpTool[] = [
  {
    name: "list_pages",
    description:
      "Lists the design's pages in order: id, name, position, whether it's the page you work on " +
      "(`current`; the user may be on another) and how many layers it has. Every other layer " +
      "tool works on your current page; switch_page changes it.",
    inputSchema: { type: "object", properties: {} },
    run: (host) => ({ pages: listPages(requireDesign(host).engine) }),
  },
  {
    name: "switch_page",
    description:
      "Switches the page you work on, so the layer tools (list_nodes, create_nodes, …) act on " +
      "it. Only yours changes: the user stays on their page. Your selection is cleared.",
    inputSchema: { type: "object", required: ["id"], properties: { id: PAGE_ID } },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      engine.setScope(requirePage(engine, stringArg(args, "id")));
      return { current: engine.scope };
    },
  },
  {
    name: "create_page",
    description:
      'Adds a page after the current one (named "Page N" unless `name` is given), in one undo ' +
      "step, and switches to it unless `switchTo` is false. Returns its id.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        switchTo: { type: "boolean", description: "Switch to the new page (default true)." },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const page = engine.service(DESIGN_PAGES).add(engine.scope, optionalString(args, "name"));
      if (optionalBoolean(args, "switchTo") ?? true) engine.setScope(page.id);
      return { page: page.id, name: page.name };
    },
  },
  {
    name: "rename_page",
    description: "Renames a page, in one undo step.",
    inputSchema: {
      type: "object",
      required: ["id", "name"],
      properties: { id: PAGE_ID, name: { type: "string" } },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const name = stringArg(args, "name").trim();
      if (!name) throw new Error('"name" is empty.');
      engine.service(DESIGN_PAGES).rename(requirePage(engine, stringArg(args, "id")), name);
      return { renamed: true };
    },
  },
  {
    name: "duplicate_page",
    description:
      'Adds a copy of a page and all its layers right after it, named "<name> copy", in one ' +
      "undo step, and switches to it unless `switchTo` is false. Returns its id.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: PAGE_ID, switchTo: { type: "boolean" } },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const id = requirePage(engine, stringArg(args, "id"));
      const page = engine.service(DESIGN_PAGES).duplicate(id);
      if (optionalBoolean(args, "switchTo") ?? true) engine.setScope(page.id);
      return { page: page.id, name: page.name };
    },
  },
  {
    name: "delete_page",
    description:
      "Deletes a page and every layer on it, in one undo step. The last page can't be deleted; " +
      "when the current page goes, the next one is shown.",
    inputSchema: { type: "object", required: ["id"], properties: { id: PAGE_ID } },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      engine.service(DESIGN_PAGES).remove(requirePage(engine, stringArg(args, "id")));
      return { deleted: true, current: engine.scope };
    },
  },
  {
    name: "reorder_page",
    description: "Moves a page to `position` (0-based) in the page order, in one undo step.",
    inputSchema: {
      type: "object",
      required: ["id", "position"],
      properties: { id: PAGE_ID, position: { type: "number" } },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const position = optionalNumber(args, "position");
      if (position === undefined) throw new Error('"position" is required.');
      engine.service(DESIGN_PAGES).reorder(requirePage(engine, stringArg(args, "id")), position);
      return { pages: listPages(engine) };
    },
  },
  {
    name: "move_nodes_to_page",
    description:
      "Moves layers of the current page, with everything they hold, to another page (on top of " +
      "its layers), in one undo step. Layers whose parent stays behind go to the top of the page. " +
      "The current page doesn't change.",
    inputSchema: {
      type: "object",
      required: ["ids", "page"],
      properties: { ids: { type: "array", items: { type: "string" } }, page: PAGE_ID },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const ids = requireNodes(engine, stringList(args, "ids"));
      const page = requirePage(engine, stringArg(args, "page"));
      return { moved: engine.service(DESIGN_PAGES).moveNodes(ids, page) };
    },
  },
];
