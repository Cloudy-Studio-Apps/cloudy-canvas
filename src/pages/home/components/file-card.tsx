import { displayName } from "@shared/core";
import { Badge } from "@shared/ui/components/ui/badge";
import { cn } from "@shared/ui/lib/utils";
import { formatRelativeTime } from "../format-relative-time";
import { KIND_LABEL } from "../file-kind";
import { useFileActions } from "../use-file-actions";
import { FileActionsMenu } from "./file-actions-menu";
import { FileContextMenu } from "./file-context-menu";
import { FileKindIcon } from "./file-kind-icon";
import { FilePreview } from "./file-preview";
import { MissingFilePopover } from "./missing-file-popover";
import type { FileCardProps } from "./file-card.types";
import { t } from "../home.i18n";

export function FileCard({ file, kind, missing, onOpen }: FileCardProps) {
  const actions = useFileActions({ file, missing, onOpen });
  const typeLabel = KIND_LABEL[kind];
  const name = displayName(file);

  const card = (
    // eslint-disable-next-line no-restricted-syntax -- bespoke: Home's file card with its thumbnail
    <button
      type="button"
      onClick={missing ? undefined : () => onOpen(file)}
      aria-label={
        missing
          ? t("card.missingLabel", { type: typeLabel, name })
          : t("card.openLabel", { type: typeLabel.toLowerCase(), name })
      }
      className={cn(
        "flex w-full cursor-pointer flex-col overflow-hidden rounded-card border bg-surface text-left shadow-soft",
        "transition-[box-shadow,border-color] duration-200 hover:border-border-strong hover:shadow-lifted",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
        missing && "border-dashed",
      )}
    >
      <FilePreview file={file} kind={kind} missing={missing} className="aspect-[16/10]" />
      <div className="flex items-center gap-3 border-t p-3.5">
        <FileKindIcon kind={kind} size="sm" className={cn(missing && "opacity-40")} />
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
            <time dateTime={file.updatedAt}>
              {t("card.meta", { type: typeLabel, time: formatRelativeTime(file.updatedAt) })}
            </time>
          </p>
        </div>
        {missing ? (
          <Badge variant="destructive">{t("card.missing")}</Badge>
        ) : (
          file.draft && <Badge variant="outline">{t("card.draft")}</Badge>
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
          <FileActionsMenu actions={actions} label={t("card.more", { name })} />
        </div>
      </div>
    </FileContextMenu>
  );
}
