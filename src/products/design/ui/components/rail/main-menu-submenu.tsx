import { MENU_FITS_SCREEN } from "@canvas-ui";
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { MainMenuEntry } from "./main-menu-entry";
import { mainMenuLabel } from "./main-menu-label";
import type { MainMenuSubmenuProps } from "./main-menu.types";

/** A labelled group of the main menu (File, Edit, …), opened to the side. */
export function MainMenuSubmenu({ group, onPick }: MainMenuSubmenuProps) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <span className="size-4" />
        {group.label}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent collisionPadding={8} className={`w-60 ${MENU_FITS_SCREEN}`}>
        {group.items.map((item) => (
          <MainMenuEntry key={mainMenuLabel(item)} item={item} onPick={onPick} />
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
