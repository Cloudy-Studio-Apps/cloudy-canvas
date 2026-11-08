import { cn } from "@shared/ui/kit";
import { FileContextMenu } from "@pages/home/components/file-context-menu";
import { FileActionsMenu } from "@pages/home/components/file-actions-menu";
import { FilePreview } from "@pages/home/components/file-preview";
import { useFileKindOf } from "@pages/home/file-kind";
import { dragId, useProjectContext } from "../project-context";
import { useFolderScan } from "../use-folder-scan";
import { entryActions } from "./entry-actions";
import { FolderGlyph } from "./folder-glyph";
import { InlineName } from "./inline-name";
import type { FolderTileProps } from "./folder-tile.types";
import { t } from "../project.i18n";

/** A folder of the Files tab: three previews of its newest files, its name and file count. */
export function FolderTile({ entry }: FolderTileProps) {
  const ctx = useProjectContext();
  const kindOf = useFileKindOf();
  const { entries } = useFolderScan(ctx.record.root, entry.rel, ctx.scanRev);
  const files = entries
    .filter((e) => e.kind === "board" || e.kind === "design")
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
  const actions = entryActions(entry, ctx);
  const color = ctx.manifest.folders[entry.rel]?.color;
  const over = ctx.drag.drag?.overId === dragId("folder", entry.rel);

  return (
    <FileContextMenu actions={actions}>
      <div
        role="button"
        tabIndex={0}
        aria-label={t("folder.open", { name: entry.name })}
        onClick={() => ctx.setFolder(entry.rel)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && event.target === event.currentTarget) {
            ctx.setFolder(entry.rel);
          }
        }}
        {...ctx.drag.grabProps(dragId("folder", entry.rel), ctx.renaming !== entry.rel)}
        {...ctx.drag.dropProps(dragId("folder", entry.rel))}
        className={cn(
          "group relative flex cursor-pointer flex-col overflow-hidden rounded-card border bg-surface shadow-soft",
          "transition-[box-shadow,border-color] duration-200 hover:border-border-strong hover:shadow-lifted",
          "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
          over && "border-primary ring-2 ring-primary/40",
        )}
      >
        <div className="grid aspect-[16/6] grid-cols-3 gap-px bg-border">
          {[0, 1, 2].map((i) => {
            const file = files[i];
            const info = file ? ctx.infoFor(file) : null;
            return info && file ? (
              <FilePreview
                key={file.rel}
                file={info}
                kind={kindOf(info)}
                missing={false}
                iconSize={null}
              />
            ) : (
              <div key={i} className="bg-surface-sunken" />
            );
          })}
        </div>
        <div className="flex items-center gap-2 border-t p-3">
          <FolderGlyph color={color} className="size-4" />
          <div className="min-w-0 flex-1 text-sm font-medium">
            <InlineName entry={entry} label={entry.name} />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">{files.length}</span>
        </div>
        <div className="absolute top-2 right-2">
          <FileActionsMenu actions={actions} label={t("folder.more", { name: entry.name })} />
        </div>
      </div>
    </FileContextMenu>
  );
}
