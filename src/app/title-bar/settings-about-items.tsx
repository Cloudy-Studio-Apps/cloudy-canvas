import { Info, Settings } from "lucide-react";
import { useNavigate } from "react-router";

import { openAbout } from "@shared/about";
import { DropdownMenuItem } from "@shared/ui/components/ui/dropdown-menu";
import { MenuItemContent } from "@shared/ui/kit";
import { t } from "./title-bar.i18n";

/** The seal menu's Settings and About, for Home and for a file tab with no menu of its own. */
export function SettingsAboutItems() {
  const navigate = useNavigate();
  return (
    <>
      <DropdownMenuItem onSelect={() => void navigate("/settings")}>
        <MenuItemContent icon={<Settings />} label={t("settings")} />
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={openAbout}>
        <MenuItemContent icon={<Info />} label={t("about")} />
      </DropdownMenuItem>
    </>
  );
}
