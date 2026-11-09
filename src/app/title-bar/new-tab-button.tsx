import { PenTool, Plus, StickyNote } from "lucide-react";
import { useNavigate } from "react-router";

import { createId } from "@shared/core";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { IconButton, MenuItemContent } from "@shared/ui/kit";
import { t } from "./title-bar.i18n";

/** The `+` after the tabs: a small menu to make a new board or design in a new tab. */
export function NewTabButton() {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton label={t("newTab")} tooltip={false} size="xs" className="mx-1">
          <Plus />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onSelect={() => void navigate(`/board/${createId()}`)}>
          <MenuItemContent icon={<StickyNote />} label={t("newBoard")} />
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void navigate(`/design/${createId()}`)}>
          <MenuItemContent icon={<PenTool />} label={t("newDesign")} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
