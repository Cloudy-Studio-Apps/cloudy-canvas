import { File, Folder } from "lucide-react";

import { formatSize, relativeTime } from "@shared/core";
import { Button } from "@shared/ui/kit";
import { useProjectContext } from "../project-context";
import { parentRel } from "../project-rel";
import type { TrashRowProps } from "./trash-row.types";
import { t } from "../project.i18n";

/** The columns of the trash list, shared by its header and rows. */
export const TRASH_COLUMNS = "grid-cols-[minmax(0,1fr)_minmax(0,10rem)_8rem_5rem_6.5rem]";

/** One trashed file or folder: its name, where it was, when it was deleted, its size, Restore. */
export function TrashRow({ entry }: TrashRowProps) {
  const { actions } = useProjectContext();
  const parent = parentRel(entry.from);
  const Icon = entry.folder ? Folder : File;
  return (
    <div
      className={`grid ${TRASH_COLUMNS} items-center gap-3 border-b px-3 py-2 text-sm last:border-0`}
    >
      <span className="flex min-w-0 items-center gap-2">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{entry.name}</span>
      </span>
      <span className="truncate text-muted-foreground">
        {parent === "" ? t("trash.root") : parent.split("/").join(" / ")}
      </span>
      <span className="text-muted-foreground">{relativeTime(entry.deletedAt) ?? t("justNow")}</span>
      <span className="text-muted-foreground tabular-nums">{formatSize(entry.size)}</span>
      <Button variant="outline" size="sm" onClick={() => void actions.restore(entry)}>
        {t("trash.restore")}
      </Button>
    </div>
  );
}
