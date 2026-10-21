import type { FileInfo } from "@core";
import { FileTypeIcon } from "@ui/components/file-type-icon";
import { cn } from "@ui/lib/utils";
import { formatRelativeTime } from "../format-relative-time";
import type { FileCardProps } from "./file-card.types";

const PREVIEW_TINT: Record<FileInfo["type"], string> = {
  board: "bg-board-soft/60",
  design: "bg-design-soft/60",
};

const TYPE_LABEL: Record<FileInfo["type"], string> = {
  board: "Board",
  design: "Design",
};

export function FileCard({ file, onOpen }: FileCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(file)}
      aria-label={`Open ${TYPE_LABEL[file.type].toLowerCase()} ${file.name}`}
      className={cn(
        "group flex cursor-pointer flex-col overflow-hidden rounded-card border bg-surface text-left shadow-soft",
        "transition-[box-shadow,border-color] duration-200 hover:border-border-strong hover:shadow-lifted",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
      )}
    >
      <div
        className={cn("flex aspect-[16/10] items-center justify-center", PREVIEW_TINT[file.type])}
      >
        <FileTypeIcon type={file.type} size="lg" className="bg-surface/70" />
      </div>
      <div className="flex items-center gap-3 border-t p-3.5">
        <FileTypeIcon type={file.type} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {TYPE_LABEL[file.type]} · Edited{" "}
            <time dateTime={file.updatedAt}>{formatRelativeTime(file.updatedAt)}</time>
          </p>
        </div>
      </div>
    </button>
  );
}
