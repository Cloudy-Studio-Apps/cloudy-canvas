import { Trash2, X } from "lucide-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@shared/ui/kit";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { toast } from "@shared/stores/toast-store";
import { deleteCopySection } from "../../mode/delete-copy-section";
import { useBrochure } from "../hooks/use-brochure";
import type { CopyFolderMenuProps } from "./copy-folder-menu.types";
import { t } from "../../catalog.i18n";

/**
 * A copy section's right-click menu: detach the whole copy from the repeat (its made pages stay
 * where they are as normal pages, `detachSection`) or delete its pages (`deleteCopySection`);
 * either way its row isn't made again. One undo step each.
 */
export function CopyFolderMenu({ folder, children }: CopyFolderMenuProps) {
  const engine = useDesignEngine();
  const { brochure } = useBrochure();
  if (!brochure || folder.slots.length === 0) return children;
  const id = folder.placed.section.id;
  const remove = () => {
    const kept = deleteCopySection(engine, id);
    if (kept > 0) toast({ title: t("mode.deleteKept", { count: kept }) });
  };
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem className="gap-2 text-xs" onSelect={() => brochure.detachSection(id)}>
          <X className="size-3.5" />
          {t("repeat.detach")}
        </ContextMenuItem>
        <ContextMenuItem className="gap-2 text-xs text-destructive" onSelect={remove}>
          <Trash2 className="size-3.5" />
          {t("repeat.deleteCopy")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
