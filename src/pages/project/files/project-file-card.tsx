import { fileNameFromPath, relativeTime } from "@shared/core";
import { cn } from "@shared/ui/kit";
import {
  FileActionsMenu,
  FileContextMenu,
  FileKindIcon,
  FilePreview,
  KIND_LABEL,
  useFileKindOf,
} from "@pages/shared/files";
import { dragId, useProjectContext } from "../project-context";
import { entryActions } from "./entry-actions";
import { InlineName } from "./inline-name";
import type { ProjectFileCardProps } from "./project-file-card.types";
import { t } from "../project.i18n";

/** A board or design of the project: a card (or a row) that opens it, drags and has a menu. */
export function ProjectFileCard({ entry, where, view = "grid" }: ProjectFileCardProps) {
  const ctx = useProjectContext();
  const kindOf = useFileKindOf();
  const info = ctx.infoFor(entry);
  const kind = kindOf(info);
  const name = fileNameFromPath(entry.name);
  const actions = entryActions(entry, ctx);
  const dragging = ctx.drag.drag?.id === dragId("file", entry.rel);
  const when = entry.updatedAt ? (relativeTime(entry.updatedAt) ?? t("justNow")) : "";
  const meta = [KIND_LABEL[kind], where, when].filter(Boolean).join(" · ");
  const row = view === "list";

  return (
    <FileContextMenu actions={actions}>
      <div
        role="button"
        tabIndex={0}
        aria-label={t("file.open", { name })}
        onClick={() => void ctx.actions.open(entry)}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "Enter") void ctx.actions.open(entry);
          if (event.key === "Delete") void ctx.actions.trash(entry);
        }}
        {...ctx.drag.grabProps(dragId("file", entry.rel), ctx.renaming !== entry.rel)}
        className={cn(
          "group relative flex cursor-pointer overflow-hidden rounded-card border bg-surface text-left shadow-soft",
          "transition-[box-shadow,border-color] duration-200 hover:border-border-strong hover:shadow-lifted",
          "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
          row ? "items-center gap-3 p-2" : "flex-col",
          dragging && "opacity-50",
        )}
      >
        <FilePreview
          file={info}
          kind={kind}
          missing={false}
          iconSize={row ? null : "lg"}
          className={row ? "h-10 w-16 shrink-0 rounded-md" : "aspect-[16/10]"}
        />
        <div className={cn("flex min-w-0 flex-1 items-center gap-3", !row && "border-t p-3")}>
          <FileKindIcon kind={kind} size="sm" />
          <div className="min-w-0 flex-1">
            <InlineName entry={entry} label={name} className="text-sm font-medium" />
            <p className="truncate text-xs text-muted-foreground">{meta}</p>
          </div>
        </div>
        <div className={cn("absolute right-2", row ? "top-1/2 -translate-y-1/2" : "top-2")}>
          <FileActionsMenu actions={actions} label={t("file.more", { name })} />
        </div>
      </div>
    </FileContextMenu>
  );
}
