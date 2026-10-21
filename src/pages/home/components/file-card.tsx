import { displayName, type FileInfo } from "@shared/core";
import { FileTypeIcon } from "@shared/ui/components/file-type-icon";
import { Badge } from "@shared/ui/components/ui/badge";
import { cn } from "@shared/ui/lib/utils";
import { formatRelativeTime } from "../format-relative-time";
import { useFileActions } from "../use-file-actions";
import { useFileThumbnail } from "../use-file-thumbnail";
import { FileActionsMenu } from "./file-actions-menu";
import { FileContextMenu } from "./file-context-menu";
import { MissingFilePopover } from "./missing-file-popover";
import type { FileCardProps } from "./file-card.types";

const PREVIEW_TINT: Record<FileInfo["type"], string> = {
  board: "bg-board-soft/60",
  design: "bg-design-soft/60",
};

const TYPE_LABEL: Record<FileInfo["type"], string> = {
  board: "Board",
  design: "Design",
};

export function FileCard({ file, missing, onOpen }: FileCardProps) {
  const actions = useFileActions({ file, missing, onOpen });
  const typeLabel = TYPE_LABEL[file.type];
  const name = displayName(file);
  const thumbnail = useFileThumbnail(file.id);
  const showThumbnail = thumbnail !== null && !missing;

  const card = (
    <button
      type="button"
      onClick={missing ? undefined : () => onOpen(file)}
      aria-label={
        missing
          ? `${typeLabel} ${name} is missing. Show options`
          : `Open ${typeLabel.toLowerCase()} ${name}`
      }
      className={cn(
        "flex w-full cursor-pointer flex-col overflow-hidden rounded-card border bg-surface text-left shadow-soft",
        "transition-[box-shadow,border-color] duration-200 hover:border-border-strong hover:shadow-lifted",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
        missing && "border-dashed",
      )}
    >
      <div
        className={cn(
          "flex aspect-[16/10] items-center justify-center overflow-hidden",
          missing ? "bg-surface-sunken" : PREVIEW_TINT[file.type],
        )}
      >
        {showThumbnail ? (
          <img src={thumbnail} alt="" draggable={false} className="size-full object-cover" />
        ) : (
          <FileTypeIcon
            type={file.type}
            size="lg"
            className={cn("bg-surface/70", missing && "opacity-40 grayscale")}
          />
        )}
      </div>
      <div className="flex items-center gap-3 border-t p-3.5">
        <FileTypeIcon type={file.type} size="sm" className={cn(missing && "opacity-40")} />
        <div className="min-w-0 flex-1">
          <p className={cn("truncate text-sm font-medium", missing && "text-muted-foreground")}>
            {name}
          </p>
          {file.description && (
            <p className="truncate text-xs text-muted-foreground" title={file.description}>
              {file.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {typeLabel} · Edited{" "}
            <time dateTime={file.updatedAt}>{formatRelativeTime(file.updatedAt)}</time>
          </p>
        </div>
        {missing ? (
          <Badge variant="destructive">Missing</Badge>
        ) : (
          file.draft && <Badge variant="outline">Draft</Badge>
        )}
      </div>
    </button>
  );

  return (
    <FileContextMenu actions={actions}>
      <div className="group relative grid">
        {missing ? (
          <MissingFilePopover file={file} actions={actions}>
            {card}
          </MissingFilePopover>
        ) : (
          card
        )}
        <div className="absolute top-2 right-2">
          <FileActionsMenu actions={actions} label={`More actions for ${name}`} />
        </div>
      </div>
    </FileContextMenu>
  );
}
