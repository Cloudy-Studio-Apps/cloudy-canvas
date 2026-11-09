import { Fragment } from "react";

import { DropdownMenuSeparator } from "@shared/ui/components/ui/dropdown-menu";
import { MainMenuEntry } from "./main-menu-entry";
import { mainMenuLabel } from "./main-menu-label";
import { mainMenuSections } from "./main-menu-sections";
import { MainMenuSubmenu } from "./main-menu-submenu";
import { runMainMenuItem } from "./run-main-menu-item";
import type { MainMenuItem, MainMenuSectionsProps } from "./main-menu.types";

/**
 * The inside of a main menu dropdown: the groups' items and submenus, with separators between
 * sections, in group order. Picking runs the item on the engine.
 */
export function MainMenuSectionsView({ groups, engine, navigate }: MainMenuSectionsProps) {
  const sorted = [...groups].sort((a, b) => a.order - b.order);
  const pick = (item: MainMenuItem) => runMainMenuItem(item, engine, navigate);
  return mainMenuSections(sorted).map((section, i) => (
    <Fragment key={section.id}>
      {i > 0 && <DropdownMenuSeparator />}
      {section.kind === "items"
        ? section.items.map((item) => (
            <MainMenuEntry key={mainMenuLabel(item)} item={item} engine={engine} onPick={pick} />
          ))
        : section.groups.map((group) => (
            <MainMenuSubmenu key={group.id} group={group} engine={engine} onPick={pick} />
          ))}
    </Fragment>
  ));
}
