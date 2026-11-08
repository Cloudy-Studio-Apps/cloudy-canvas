import { Trash2 } from "lucide-react";

import { ListRow } from "@shared/ui/kit";
import { FolderTree } from "./folder-tree";
import type { ProjectSidebarProps } from "./project-sidebar.types";
import { t } from "../project.i18n";

/** The left column: the Files tree and, at the bottom, Trash. Libraries join it later. */
export function ProjectSidebar({ tab, onTrash }: ProjectSidebarProps) {
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-3 overflow-y-auto border-r bg-surface p-2">
      <FolderTree />
      <div className="mt-auto">
        <ListRow
          selected={tab === "trash"}
          onSelect={onTrash}
          icon={<Trash2 />}
          label={t("tabs.trash")}
        />
      </div>
    </aside>
  );
}
