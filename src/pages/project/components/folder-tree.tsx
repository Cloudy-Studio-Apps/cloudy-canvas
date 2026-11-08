import { Files, FolderPlus } from "lucide-react";

import { cn, IconButton, ListRow } from "@shared/ui/kit";
import { dragId, useProjectContext } from "../project-context";
import { useFolderScan } from "../use-folder-scan";
import { FolderTreeNode } from "./folder-tree-node";
import { t } from "../project.i18n";

/** The sidebar's Files section: "All files" (the project root) and the folders below it. */
export function FolderTree() {
  const ctx = useProjectContext();
  const { entries } = useFolderScan(ctx.record.root, "", ctx.scanRev);
  const folders = entries.filter((e) => e.kind === "folder");
  const files = entries.filter((e) => e.kind === "board" || e.kind === "design").length;
  const over = ctx.drag.drag?.overId === dragId("folder", "");

  return (
    <section>
      <div className="flex h-8 items-center justify-between px-2 text-xs font-semibold text-muted-foreground">
        {t("tree.files")}
        <IconButton
          label={t("folder.new")}
          size="xs"
          onClick={() => {
            ctx.setFolder(ctx.folder);
            void ctx.actions
              .createFolder(ctx.folder)
              .then((rel) => rel !== null && ctx.setRenaming(rel));
          }}
        >
          <FolderPlus />
        </IconButton>
      </div>
      <ListRow
        selected={ctx.folder === ""}
        onSelect={() => ctx.setFolder("")}
        {...ctx.drag.dropProps(dragId("folder", ""))}
        className={cn(over && "bg-primary-soft ring-1 ring-primary")}
        icon={<Files />}
        label={t("tree.all")}
        meta={files > 0 ? files : undefined}
      />
      {folders.map((entry) => (
        <FolderTreeNode key={entry.rel} rel={entry.rel} name={entry.name} />
      ))}
    </section>
  );
}
