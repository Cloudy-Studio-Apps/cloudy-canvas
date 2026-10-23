import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { useEngine } from "../../engine-context";
import { entryEnabled } from "./context-menu-enabled";
import type { ContextMenuCategoryEntryProps } from "./context-menu-entry.types";
import { ContextMenuGroups } from "./context-menu-groups";
import { MENU_FITS_SCREEN } from "./menu-fits-screen";

/** An entry of the context menu that opens a submenu of commands. */
export function ContextMenuCategoryEntry({ item, context }: ContextMenuCategoryEntryProps) {
  const engine = useEngine();
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger disabled={!entryEnabled(item, context, engine)}>
        {item.label}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent collisionPadding={8} className={`min-w-52 ${MENU_FITS_SCREEN}`}>
        <ContextMenuGroups groups={item.groups} context={context} />
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
