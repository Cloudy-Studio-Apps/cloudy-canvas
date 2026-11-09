import { useNavigate } from "react-router";

import { MainMenuSectionsView, MENU_FITS_SCREEN, useEditorModules } from "@canvas-ui";
import { SealLogo } from "@shared/ui/brand/seal-logo";
import { IconButton } from "@shared/ui/kit";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { useDesignEngine } from "../../design-engine-context";
import { designEditor } from "../../modules";
import { t } from "../../design-ui.i18n";

/**
 * The logo at the top of the rail (Android; on desktop the title bar's seal shows this menu):
 * opens the main menu the modules fill (`mainMenu`). Groups without a label are listed in it;
 * labelled ones (File, Edit, …) open as submenus.
 */
export function DesignMainMenu() {
  const engine = useDesignEngine();
  const navigate = useNavigate();
  const { host } = useEditorModules();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton size="lg" label={t("rail.mainMenu")} tooltip={false} className="mb-2">
          <SealLogo size={22} variant="mark" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
        collisionPadding={8}
        className={`w-56 ${MENU_FITS_SCREEN}`}
      >
        <MainMenuSectionsView
          groups={host.get(designEditor.mainMenu)}
          engine={engine}
          navigate={(to) => void navigate(to)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
