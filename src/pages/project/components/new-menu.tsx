import {
  ChevronDown,
  FolderPlus,
  ImagePlus,
  Library,
  PenTool,
  Plus,
  StickyNote,
} from "lucide-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@shared/ui/kit";
import { useProjectContext } from "../project-context";
import { t } from "../project.i18n";

/** New ▾: a design or a board saved in the folder being shown, a folder in it, a library, or pictures added to one. */
export function NewMenu() {
  const { actions, folder, setRenaming, setNewLibraryOpen, libs, libraryActions } =
    useProjectContext();
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
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setNewLibraryOpen(true)}>
          <Library />
          {t("new.library")}
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={libs.summaries.length === 0}>
            <ImagePlus />
            {t("new.addImages")}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {libs.summaries.map((library) => (
              <DropdownMenuItem
                key={library.entry.id}
                onSelect={() => void libraryActions.addAssets(library)}
              >
                {library.entry.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
