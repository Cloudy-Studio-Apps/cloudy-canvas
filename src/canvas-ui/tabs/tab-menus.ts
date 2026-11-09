import type { TabMenu, TabMenus } from "./tab-menu.types";

const menus = new Map<string, TabMenu>();

/**
 * The main menu of each tab whose editor is mounted, set by `useTabMenu`. Not reactive: the seal
 * menu in the title bar reads the active tab's when it opens.
 */
export const tabMenus: TabMenus = {
  set(id, menu) {
    menus.set(id, menu);
    return () => {
      if (menus.get(id) === menu) menus.delete(id);
    };
  },
  get: (id) => menus.get(id),
};
