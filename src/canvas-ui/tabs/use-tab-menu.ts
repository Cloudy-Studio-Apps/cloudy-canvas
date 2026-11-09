import { useContext, useEffect } from "react";

import type { CanvasEngine } from "@canvas";
import type { MainMenuGroup } from "../main-menu";
import { TabContext } from "./tab-context";
import { tabMenus } from "./tab-menus";

/**
 * Gives the editor's tab its main menu (`tabMenus`) while the editor is mounted: the title bar's
 * seal shows the active tab's, read as it opens.
 */
export function useTabMenu(engine: CanvasEngine, groups: readonly MainMenuGroup[]): void {
  const tabId = useContext(TabContext)?.tabId;
  useEffect(() => {
    if (!tabId) return;
    return tabMenus.set(tabId, { engine, groups: () => groups });
  }, [tabId, engine, groups]);
}
