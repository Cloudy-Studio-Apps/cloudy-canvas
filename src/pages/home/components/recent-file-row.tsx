import { displayName } from "@shared/core";
import { cn } from "@shared/ui/kit";
import { KIND_LABEL } from "../file-kind";
import { formatRelativeTime } from "../format-relative-time";
import { useFileActions } from "../use-file-actions";
import { FileActionsMenu } from "./file-actions-menu";
import { FileContextMenu } from "./file-context-menu";
import { FileKindIcon } from "./file-kind-icon";
import { FilePreview } from "./file-preview";
import { MissingFilePopover } from "./missing-file-popover";
import { ROW_COLUMNS } from "./recent-files-columns";
import type { FileCardProps } from "./file-card.types";
import { t } from "../home.i18n";

/** A recent file as one row of the list view: what a card shows, plus where it is. */
export function RecentFileRow({ file, kind, missing, onOpen }: FileCardProps) {
  const actions = useFileActions({ file, missing, onOpen });
  const typeLabel = KIND_LABEL[kind];
  const name = displayName(file);
  const location = missing
    ? t("card.missingLocation")
    : file.draft
      ? t("card.draftLocation")
      : file.path;

  const row = (
    // eslint-disable-next-line no-restricted-syntax -- bespoke: Home's list row
    <button
      type="button"
      onClick={missing ? undefined : () => onOpen(file)}
      aria-label={
        missing
          ? t("card.missingLabel", { type: typeLabel, name })
          : t("card.openLabel", { type: typeLabel.toLowerCase(), name })
      }
      className={cn(
        ROW_COLUMNS,
        "w-full cursor-pointer px-3 py-2 text-left outline-none hover:bg-hover",
        "focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:ring-inset",
      )}
    >
      <FilePreview
        file={file}
        kind={kind}
        missing={missing}
        iconSize={null}
        className="aspect-[16/10] w-14 rounded-sm border"
      />
      <span className="min-w-0">
        <span className={cn("block truncate font-medium", missing && "text-muted-foreground")}>
          {name}
        </span>
        {file.description && (
          <span className="block truncate text-xs text-muted-foreground">{file.description}</span>
        )}
      </span>
      <span className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
        <FileKindIcon kind={kind} size="sm" className="size-5 [&_svg]:size-3" />
        {typeLabel}
      </span>
      <span
        className={cn(
          "hidden truncate text-xs sm:block",
          missing ? "text-destructive" : "text-muted-foreground",
        )}
        title={missing || file.draft ? undefined : file.path}
      >
        {location}
      </span>
      <time dateTime={file.updatedAt} className="hidden text-xs text-muted-foreground sm:block">
        {formatRelativeTime(file.updatedAt)}
      </time>
    </button>
  );

  return (
    <FileContextMenu actions={actions}>
      <li className="group relative border-t first:border-t-0">
        {missing ? (
          <MissingFilePopover file={file} actions={actions}>
            {row}
          </MissingFilePopover>
        ) : (
          row
        )}
        <div className="absolute top-1/2 right-3 -translate-y-1/2">
          <FileActionsMenu actions={actions} label={t("card.more", { name })} />
        </div>
      </li>
    </FileContextMenu>
  );
}
