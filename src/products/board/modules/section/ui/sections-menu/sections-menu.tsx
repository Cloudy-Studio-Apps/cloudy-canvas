import { Frame } from "lucide-react";

import { ToolButton } from "@canvas-ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { SectionsMenuItems } from "./sections-menu-items";

/** Lists the board's sections; picking one zooms to it. */
export function SectionsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ToolButton label="Sections" side="bottom">
          <Frame />
        </ToolButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 w-60 overflow-y-auto">
        <SectionsMenuItems />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
