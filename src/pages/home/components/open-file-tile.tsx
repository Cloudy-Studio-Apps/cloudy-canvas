import { FolderOpen } from "lucide-react";

import { formatShortcut } from "@shared/core";
import { OPEN_FILE_SHORTCUT } from "../home-shortcuts";
import { CreateTile } from "./create-tile";
import type { OpenFileTileProps } from "./open-file-tile.types";
import { t } from "../home.i18n";

/** The dashed "Open file…" tile: the native dialog for every file the app opens. */
export function OpenFileTile({ onOpenFile }: OpenFileTileProps) {
  return (
    <CreateTile
      dashed
      icon={
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-sunken text-muted-foreground [&_svg]:size-5">
          <FolderOpen />
        </span>
      }
      title={t("create.open")}
      hint={t("create.openHint", { shortcut: formatShortcut(OPEN_FILE_SHORTCUT) })}
      onSelect={onOpenFile}
      keyShortcuts="Control+O"
    />
  );
}
