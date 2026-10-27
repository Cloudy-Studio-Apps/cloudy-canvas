import { cn } from "@shared/ui/kit";
import { RecentFileRow } from "./recent-file-row";
import { ROW_COLUMNS } from "./recent-files-columns";
import type { RecentFilesListProps } from "./recent-files-list.types";
import { t } from "../home.i18n";

/** The recent files as rows, with where each one is: easier to scan than the grid when there are many. */
export function RecentFilesList({ files, missing, kindOf, onOpen }: RecentFilesListProps) {
  return (
    <div className="overflow-hidden rounded-card border bg-surface shadow-soft">
      <div
        aria-hidden="true"
        className={cn(
          ROW_COLUMNS,
          "hidden border-b bg-surface-sunken px-3 py-1.5 text-xs font-medium text-muted-foreground sm:grid",
        )}
      >
        <span />
        <span>{t("recent.columns.name")}</span>
        <span>{t("recent.columns.kind")}</span>
        <span>{t("recent.columns.location")}</span>
        <span>{t("recent.columns.edited")}</span>
      </div>
      <ul>
        {files.map((file) => (
          <RecentFileRow
            key={file.id}
            file={file}
            kind={kindOf(file)}
            missing={missing.has(file.id)}
            onOpen={onOpen}
          />
        ))}
      </ul>
    </div>
  );
}
