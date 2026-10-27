import { FolderOpen } from "lucide-react";

import { formatShortcut } from "@shared/core";
import { OPEN_FILE_SHORTCUT } from "../home-shortcuts";
import { CreateTile } from "./create-tile";
import { CreateTiles } from "./create-tiles";
import { SealCard } from "./seal-card";
import type { CreateColumnProps } from "./create-column.types";
import { t } from "../home.i18n";

/** Next to the Continue card: the "New …" tiles, Open file and the seals. */
export function CreateColumn({ onCreate, onOpenFile }: CreateColumnProps) {
  return (
    <nav aria-label={t("create.label")} className="flex flex-col gap-2.5">
      <CreateTiles onCreate={onCreate} />
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
      <SealCard />
    </nav>
  );
}
