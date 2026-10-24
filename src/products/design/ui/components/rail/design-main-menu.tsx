import { Fragment } from "react";
import { useNavigate } from "react-router";

import { MENU_FITS_SCREEN, useEditorModules } from "@canvas-ui";
import { SealLogo } from "@shared/ui/brand/seal-logo";
import { IconButton } from "@shared/ui/kit";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { useDesignEngine } from "../../design-engine-context";
import { designEditor, type MainMenuItem } from "../../modules";
import { MainMenuEntry } from "./main-menu-entry";
import { mainMenuLabel } from "./main-menu-label";
import { mainMenuSections } from "./main-menu-sections";
import { MainMenuSubmenu } from "./main-menu-submenu";

/**
 * The logo at the top of the rail: opens the main menu the modules fill (`mainMenu`). Groups
 * without a label are listed in it; labelled ones (File, Edit, …) open as submenus.
 */
export function DesignMainMenu() {
  const engine = useDesignEngine();
  const navigate = useNavigate();
  const { host } = useEditorModules();
  const groups = [...host.get(designEditor.mainMenu)].sort((a, b) => a.order - b.order);

  const pick = (item: MainMenuItem) => {
    if ("command" in item) engine.commands[item.command]?.();
    else item.run({ engine, navigate: (to) => void navigate(to) });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton size="lg" label="Main menu" tooltip={false} className="mb-2">
          <SealLogo size={22} variant="mark" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
        collisionPadding={8}
        className={`w-56 ${MENU_FITS_SCREEN}`}
      >
        {mainMenuSections(groups).map((section, i) => (
          <Fragment key={section.id}>
            {i > 0 && <DropdownMenuSeparator />}
            {section.kind === "items"
              ? section.items.map((item) => (
                  <MainMenuEntry key={mainMenuLabel(item)} item={item} onPick={pick} />
                ))
              : section.groups.map((group) => (
                  <MainMenuSubmenu key={group.id} group={group} onPick={pick} />
                ))}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
