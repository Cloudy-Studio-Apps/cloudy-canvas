import { MENU_FITS_SCREEN, useFileTabs } from "@canvas-ui";
import { SealLogo } from "@shared/ui/brand/seal-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { IconButton } from "@shared/ui/kit";
import { FileTabMenu } from "./file-tab-menu";
import { HomeMenu } from "./home-menu";
import { t } from "./title-bar.i18n";

/**
 * The seal at the window's left: the main menu. On Home the app's own (New board, New design,
 * Open file…, Theme, Settings, About); on a file tab, the menu its editor registered.
 */
export function SealMenu() {
  const activeId = useFileTabs((s) => s.activeId);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton label={t("seal")} tooltip={false} size="md" className="mx-1">
          <SealLogo variant="mark" size={22} />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        collisionPadding={8}
        className={`w-56 ${MENU_FITS_SCREEN}`}
      >
        {activeId === null ? <HomeMenu /> : <FileTabMenu tabId={activeId} />}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
