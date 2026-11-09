import { Folder, Info, PenTool, Settings, StickyNote } from "lucide-react";
import { useNavigate } from "react-router";

import { openAbout } from "@shared/about";
import { createId } from "@shared/core";
import { DropdownMenuItem, DropdownMenuSeparator } from "@shared/ui/components/ui/dropdown-menu";
import { MenuItemContent } from "@shared/ui/kit";
import { useOpenFile } from "@pages/home/use-open-file";
import { ThemeSubmenu } from "./theme-submenu";
import { t } from "./title-bar.i18n";

/** The seal menu on the Home tab: New board, New design, Open file…, Theme, Settings and About. */
export function HomeMenu() {
  const navigate = useNavigate();
  const openFile = useOpenFile();
  return (
    <>
      <DropdownMenuItem onSelect={() => void navigate(`/board/${createId()}`)}>
        <MenuItemContent icon={<StickyNote />} label={t("newBoard")} />
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => void navigate(`/design/${createId()}`)}>
        <MenuItemContent icon={<PenTool />} label={t("newDesign")} />
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => void openFile()}>
        <MenuItemContent icon={<Folder />} label={t("openFile")} />
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <ThemeSubmenu />
      <DropdownMenuItem onSelect={() => void navigate("/settings/appearance")}>
        <MenuItemContent icon={<Settings />} label={t("settings")} />
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={openAbout}>
        <MenuItemContent icon={<Info />} label={t("about")} />
      </DropdownMenuItem>
    </>
  );
}
