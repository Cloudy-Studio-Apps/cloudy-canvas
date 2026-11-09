import type { CanvasEngine } from "@canvas";
import type { MainMenuGroup } from "../main-menu";

/** The main menu an editor gives its tab: its engine and the menu's groups, read when it opens. */
export interface TabMenu {
  engine: CanvasEngine;
  /** The groups now (the editor's modules may add more over time). */
  groups(): readonly MainMenuGroup[];
}

/** The menus of the tabs whose editor is mounted, by tab id. */
export interface TabMenus {
  /** Registers the tab's menu; returns how to remove it. */
  set(id: string, menu: TabMenu): () => void;
  get(id: string): TabMenu | undefined;
}
