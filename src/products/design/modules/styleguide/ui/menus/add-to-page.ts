import type { ContextMenuSubmenu } from "@canvas-ui";
import { DESIGN_PAGES, DESIGN_STYLEGUIDE, isSheet, STYLEGUIDE_COMMANDS } from "@design";
import { toast } from "@shared/stores/toast-store";

/**
 * The selected section's "Add to page" submenu: a live element showing the same category (or
 * group) is placed on the page picked, right of what's there.
 */
export const ADD_TO_PAGE: ContextMenuSubmenu = {
  id: STYLEGUIDE_COMMANDS.addToPage,
  label: "Add to page",
  actions: (engine) => {
    const sheet = engine
      .selectedIds()
      .map((id) => engine.getElement(id))
      .find(isSheet);
    if (!sheet) return [];
    return engine
      .service(DESIGN_PAGES)
      .pages()
      .map((page) => ({
        label: page.name,
        run: () => {
          const { category, group, template, options, modeView } = sheet.sheet;
          engine
            .service(DESIGN_STYLEGUIDE)
            .addSheet(page.id, { category, group }, sheet.name, undefined, {
              template,
              options,
              modeView,
            });
          toast({ title: `Added to ${page.name}` });
        },
      }));
  },
};
