import type { ContextMenuSubmenu } from "@canvas-ui";
import { DESIGN_PAGES } from "../design-pages";

/** The selection's "Move to page" submenu: every page but the one on screen. */
export const MOVE_TO_PAGE: ContextMenuSubmenu = {
  id: "moveToPage",
  label: "Move to page",
  actions: (engine) => {
    const pages = engine.service(DESIGN_PAGES);
    return pages
      .pages()
      .filter((page) => page.id !== engine.scope)
      .map((page) => ({
        label: page.name,
        run: () => {
          pages.moveNodes(engine.selectedIds(), page.id);
        },
      }));
  },
};
