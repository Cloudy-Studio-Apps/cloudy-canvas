import { FolderInput } from "lucide-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/ui/kit";
import type { OpenProjectMenuProps } from "./open-project-menu.types";
import { t } from "../projects.i18n";

/** "Open project…": a `.cproject` file or a project folder. */
export function OpenProjectMenu({ onOpenFile, onOpenFolder }: OpenProjectMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <FolderInput />
          {t("open.button")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onOpenFile}>{t("open.file")}</DropdownMenuItem>
        <DropdownMenuItem onSelect={onOpenFolder}>{t("open.folder")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
