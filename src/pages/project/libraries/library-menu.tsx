import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
} from "@shared/ui/kit";
import { useProjectContext } from "../project-context";
import type { LibraryMenuProps } from "./library-dialogs.types";
import { usedByCount } from "./library-usage";
import { RenameLibraryDialog } from "./rename-library-dialog";
import { t } from "../project.i18n";

/**
 * A library's ⋯ menu: Rename…, whether new files take it (turning it off asks first: files that
 * already use it keep it), and Delete… (asks first).
 */
export function LibraryMenu({ library }: LibraryMenuProps) {
  const { libraryActions, fileCount } = useProjectContext();
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const { entry } = library;
  const used = usedByCount(entry, fileCount);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton label={t("libraries.more", { name: entry.name })} size="xs" tooltip={false}>
            <MoreHorizontal />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setRenaming(true)}>
            <Pencil />
            {t("libraries.menu.rename")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              entry.autoAdd ? setStopping(true) : void libraryActions.setAutoAdd(library, true)
            }
          >
            {t(entry.autoAdd ? "libraries.menu.autoOff" : "libraries.menu.autoOn")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive [&_svg]:text-destructive"
            onSelect={() => setDeleting(true)}
          >
            <Trash2 />
            {t("libraries.menu.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <RenameLibraryDialog open={renaming} onOpenChange={setRenaming} library={library} />
      <ConfirmDialog
        open={stopping}
        onOpenChange={setStopping}
        title={t("libraries.autoOff.title", { name: entry.name })}
        description={t("libraries.autoOff.text")}
        confirmLabel={t("libraries.menu.autoOff")}
        onConfirm={() => void libraryActions.setAutoAdd(library, false)}
      />
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={t("libraries.delete.title", { name: entry.name })}
        description={
          used !== null
            ? t("libraries.delete.text", { count: used })
            : t("libraries.delete.textManual")
        }
        confirmLabel={t("libraries.menu.delete")}
        destructive
        onConfirm={() => void libraryActions.remove(library)}
      />
    </>
  );
}
