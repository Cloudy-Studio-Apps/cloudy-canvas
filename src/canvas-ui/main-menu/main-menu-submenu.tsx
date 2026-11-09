import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { MENU_FITS_SCREEN } from "../components/context-menu/menu-fits-screen";
import { MainMenuEntry } from "./main-menu-entry";
import { mainMenuLabel } from "./main-menu-label";
import type { MainMenuSubmenuProps } from "./main-menu.types";

/** A labelled group of the main menu (File, Edit, …), opened to the side. */
export function MainMenuSubmenu({ group, engine, onPick }: MainMenuSubmenuProps) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <span className="size-4" />
        {group.label}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent collisionPadding={8} className={`w-60 ${MENU_FITS_SCREEN}`}>
        {group.items.map((item) => (
          <MainMenuEntry key={mainMenuLabel(item)} item={item} engine={engine} onPick={onPick} />
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
