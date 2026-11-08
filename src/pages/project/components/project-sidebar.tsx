import { Trash2 } from "lucide-react";

import { formatSize } from "@shared/core";
import { ListRow } from "@shared/ui/kit";
import { LibrariesSidebar } from "../libraries/libraries-sidebar";
import { useProjectContext } from "../project-context";
import { FolderTree } from "./folder-tree";
import { t } from "../project.i18n";

/** The left column: the Files tree, the Libraries and Content sections and, at the bottom, Trash with its count and size. */
export function ProjectSidebar() {
  const { trash, tab, setTab } = useProjectContext();
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-3 overflow-y-auto border-r bg-surface p-2">
      <FolderTree />
      <LibrariesSidebar />
      <div className="mt-auto">
        <ListRow
          selected={tab === "trash"}
          onSelect={() => setTab("trash")}
          icon={<Trash2 />}
          label={t("tabs.trash")}
          meta={trash.count > 0 ? `${trash.count} · ${formatSize(trash.size)}` : undefined}
        />
      </div>
    </aside>
  );
}
