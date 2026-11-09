import { useNavigate } from "react-router";

import { MainMenuSectionsView, tabMenus } from "@canvas-ui";
import { DropdownMenuSeparator } from "@shared/ui/components/ui/dropdown-menu";
import { SettingsAboutItems } from "./settings-about-items";
import { ThemeSubmenu } from "./theme-submenu";
import type { FileTabMenuProps } from "./title-bar.types";

/**
 * The seal menu on a file tab: the menu its editor registered (`tabMenus`), read as the menu
 * opens, then Theme. An editor still loading has none yet, so Settings and About stand in.
 */
export function FileTabMenu({ tabId }: FileTabMenuProps) {
  const navigate = useNavigate();
  const menu = tabMenus.get(tabId);
  return (
    <>
      {menu && (
        <>
          <MainMenuSectionsView
            groups={menu.groups()}
            engine={menu.engine}
            navigate={(to) => void navigate(to)}
          />
          <DropdownMenuSeparator />
        </>
      )}
      <ThemeSubmenu />
      {!menu && <SettingsAboutItems />}
    </>
  );
}
