import { FolderPlus } from "lucide-react";

import { useProjectContext } from "../project-context";
import { t } from "../project.i18n";

/** The dashed tile that makes a folder in the folder being shown and starts naming it. */
export function NewFolderTile() {
  const { actions, folder, setRenaming } = useProjectContext();
  return (
    // eslint-disable-next-line no-restricted-syntax -- bespoke: a dashed tile in the folder grid
    <button
      type="button"
      onClick={() =>
        void actions.createFolder(folder).then((rel) => rel !== null && setRenaming(rel))
      }
      className="flex min-h-24 cursor-pointer items-center justify-center gap-2 rounded-card border border-dashed text-sm text-muted-foreground transition-colors outline-none hover:border-border-strong hover:bg-hover hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
    >
      <FolderPlus className="size-4" />
      {t("folder.new")}
    </button>
  );
}
