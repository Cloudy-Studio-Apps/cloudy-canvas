import { Copy, ExternalLink, FolderInput, FolderOpen, Pencil } from "lucide-react";

import type { ProjectEntry } from "@shared/core";
import type { FileAction } from "@pages/home/use-file-actions.types";
import { parentRel } from "../project-rel";
import type { ProjectContextValue } from "../project-context.types";
import { t } from "../project.i18n";

/** What can be done with a file or folder of the project, for its ⋯ and right-click menus. */
export function entryActions(entry: ProjectEntry, ctx: ProjectContextValue): FileAction[] {
  const { actions, setRenaming, setMoving, setFolder } = ctx;
  const isFolder = entry.kind === "folder";
  return [
    {
      id: "open",
      label: t("menu.open"),
      icon: ExternalLink,
      run: () => (isFolder ? setFolder(entry.rel) : void actions.open(entry)),
    },
    {
      id: "rename",
      label: t("menu.rename"),
      icon: Pencil,
      run: () => {
        setFolder(parentRel(entry.rel));
        // After the menu closes and gives focus back, or the field would lose it at once.
        window.setTimeout(() => setRenaming(entry.rel), 80);
      },
    },
    { id: "move", label: t("menu.move"), icon: FolderInput, run: () => setMoving(entry) },
    {
      id: "duplicate",
      label: t("menu.duplicate"),
      icon: Copy,
      run: () => void actions.duplicate(entry),
    },
    {
      id: "reveal",
      label: t("menu.reveal"),
      icon: FolderOpen,
      run: () => void actions.reveal(entry.rel),
    },
  ];
}
