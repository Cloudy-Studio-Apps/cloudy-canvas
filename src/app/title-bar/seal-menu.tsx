import { Info, PenTool, Settings, StickyNote } from "lucide-react";
import { useNavigate } from "react-router";

import { openAbout } from "@shared/about";
import { createId } from "@shared/core";
import { SealLogo } from "@shared/ui/brand/seal-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { IconButton, MenuItemContent } from "@shared/ui/kit";
import { t } from "./title-bar.i18n";

/** The seal at the window's left: the main menu (app-level items for now). */
export function SealMenu() {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton label={t("seal")} tooltip={false} size="md" className="mx-1">
          <SealLogo variant="mark" size={22} />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuItem onSelect={() => void navigate(`/board/${createId()}`)}>
          <MenuItemContent icon={<StickyNote />} label={t("newBoard")} />
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void navigate(`/design/${createId()}`)}>
          <MenuItemContent icon={<PenTool />} label={t("newDesign")} />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void navigate("/settings/appearance")}>
          <MenuItemContent icon={<Settings />} label={t("settings")} />
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={openAbout}>
          <MenuItemContent icon={<Info />} label={t("about")} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
