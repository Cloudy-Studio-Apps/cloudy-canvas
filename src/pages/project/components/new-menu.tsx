import { ChevronDown, FolderPlus, PenTool, Plus, StickyNote } from "lucide-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/kit";
import { useProjectContext } from "../project-context";
import { t } from "../project.i18n";

/** New ▾: a design or a board saved in the folder being shown, or a folder in it. */
export function NewMenu() {
  const { actions, folder, setRenaming } = useProjectContext();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm">
          <Plus />
          {t("new.button")}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => actions.newFile("design", folder)}>
          <PenTool />
          {t("new.design")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => actions.newFile("board", folder)}>
          <StickyNote />
          {t("new.board")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() =>
            void actions.createFolder(folder).then((rel) => {
              if (rel !== null) window.setTimeout(() => setRenaming(rel), 80);
            })
          }
        >
          <FolderPlus />
          {t("new.folder")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
